<#
  VOLTARA - Verifikasi backend lokal lewat HTTP
  ============================================================================
  Membaca .env lalu menguji langsung endpoint Supabase lokal:
    - REST API (PostgREST) hidup
    - isi tabel hasil migrasi sesuai seed
    - RLS: tabel publik bisa dibaca anon, tabel privat hanya service_role
    - RPC PostGIS get_nearby_chargers: jarak & urutan benar
    - Auth (GoTrue) sehat, Realtime hidup
    - anon key ditolak saat menulis

  Pemakaian:
    # backend lokal (membaca .env)
    powershell -ExecutionPolicy Bypass -File scripts/verify-backend.ps1

    # backend cloud, tanpa menyentuh .env
    ... -ApiUrl "https://xxxx.supabase.co" -AnonKey "eyJ..."

    # menunjuk file env lain
    ... -EnvFile "C:\path\ke\.env.production"

  Catatan: bila kunci service_role tidak tersedia, pemeriksaan sisi service
  dilewati dan skrip tetap memverifikasi semua yang bisa diuji dengan anon key.

  Kompatibel Windows PowerShell 5.1.
#>
[CmdletBinding()]
param(
    [string]$EnvFile,
    [string]$ApiUrl,
    [string]$AnonKey,
    [string]$ServiceKey
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root '.env'

$script:pass = 0; $script:fail = 0; $script:info = 0

function Check($name, $ok, $detail) {
    if ($ok) {
        $script:pass++
        Write-Host ("  [PASS] {0,-44} {1}" -f $name, $detail) -ForegroundColor Green
    } else {
        $script:fail++
        Write-Host ("  [FAIL] {0,-44} {1}" -f $name, $detail) -ForegroundColor Red
    }
}
function Note($name, $detail) {
    $script:info++
    Write-Host ("  [INFO] {0,-44} {1}" -f $name, $detail) -ForegroundColor Yellow
}
function Section($t) { Write-Host "`n--- $t ---" -ForegroundColor Cyan }
function Get-ErrCode($err) { try { return [int]$err.Exception.Response.StatusCode } catch { return 0 } }
function Peek($v) { if ($v -and $v.Length -gt 20) { $v.Substring(0, 20) + '...' } else { $v } }

Write-Host 'VOLTARA backend verification' -ForegroundColor White
Write-Host "waktu: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# ------------------------------------------------- sumber konfigurasi ----
# Prioritas: parameter eksplisit > file .env (atau -EnvFile).
if ($EnvFile) { $envPath = $EnvFile }

$cfg = @{}
if (Test-Path $envPath) {
    foreach ($line in (Get-Content $envPath)) {
        $m = [regex]::Match($line.Trim(), '^([A-Z0-9_]+)="?(.*?)"?$')
        if ($m.Success) { $cfg[$m.Groups[1].Value] = $m.Groups[2].Value }
    }
} elseif (-not $ApiUrl) {
    Write-Host "`n[FATAL] .env tidak ditemukan di $envPath." -ForegroundColor Red
    Write-Host '        Jalankan scripts/backend-up.ps1, atau pakai -ApiUrl/-AnonKey.' -ForegroundColor Red
    exit 1
}

if ($ApiUrl -or $AnonKey -or $ServiceKey) {
    # Mode eksplisit: parameter adalah SATU-SATUNYA sumber konfigurasi.
    # .env sengaja tidak dibaca supaya kunci backend lokal tidak pernah
    # tercampur dengan kunci backend cloud.
    $api  = if ($ApiUrl)  { $ApiUrl.TrimEnd('/') } else { '' }
    $anon = if ($AnonKey) { $AnonKey }             else { '' }
    $svc  = $ServiceKey
} else {
    $api  = $cfg['VITE_SUPABASE_URL']
    $anon = $cfg['VITE_SUPABASE_ANON_KEY']
    $svc  = $cfg['SUPABASE_SERVICE_ROLE_KEY']
}

if (-not $api -or -not $anon) {
    Write-Host '[FATAL] URL Supabase / anon key tidak ditemukan pada sumber konfigurasi.' -ForegroundColor Red
    exit 1
}

Section 'Konfigurasi'
Note 'API URL'    $api
Note 'anon key'   "$(Peek $anon) (len $($anon.Length))"
if ($svc) { Note 'service key' "$(Peek $svc) (len $($svc.Length))" }
else      { Note 'service key' 'tidak tersedia - pemeriksaan sisi service dilewati' }

$hA = @{ apikey = $anon; Authorization = "Bearer $anon" }
$hS = @{ apikey = $svc;  Authorization = "Bearer $svc" }

# Ambil JSON lewat Invoke-WebRequest + ConvertFrom-Json: hasilnya konsisten
# di PowerShell 5.1, tidak seperti Invoke-RestMethod yang membungkus array.
function Get-Json($url, $headers) {
    $r = Invoke-WebRequest -Uri $url -Headers $headers -Method Get -TimeoutSec 25 -UseBasicParsing
    if (-not $r.Content) { return @() }
    # Ditampung dulu: PowerShell 5.1 tidak meng-enumerasi array hasil
    # ConvertFrom-Json, sehingga @(... | ConvertFrom-Json) jadi 1 elemen.
    $parsed = $r.Content | ConvertFrom-Json
    return @($parsed)
}

# ------------------------------------------------------------- REST hidup ---
Section 'REST API (PostgREST)'
try {
    $null = Invoke-WebRequest -Uri "$api/rest/v1/" -Headers $hA -Method Get -TimeoutSec 20 -UseBasicParsing
    Check 'PostgREST reachable' $true "$api/rest/v1/"
} catch {
    $code = Get-ErrCode $_
    Check 'PostgREST reachable' ($code -eq 200) "HTTP $code"
}

# ------------------------------------------- isi tabel + kebijakan RLS -----
if ($svc) {
    Section 'Isi tabel dan kebijakan RLS (anon vs service_role)'
} else {
    Section 'Isi tabel dan kebijakan RLS (hanya anon - tanpa service_role)'
}
# nama = @(harapan anon, harapan service_role)
$tables = [ordered]@{
    'organizations'      = @(4, 4)   # publik
    'chargers'           = @(8, 8)   # publik
    'charger_connectors' = @(11, 11) # publik
    'ai_agent_states'    = @(6, 6)   # publik
    'vehicles'           = @(0, 4)   # privat: hanya authenticated/service
    'actionable_alerts'  = @(0, 2)   # privat: hanya authenticated/service
}

foreach ($t in $tables.Keys) {
    $wantAnon = $tables[$t][0]
    $wantSvc  = $tables[$t][1]

    $anonCount = -1
    try { $anonCount = @(Get-Json "$api/rest/v1/$t`?select=id" $hA).Count }
    catch { $anonCount = "err$(Get-ErrCode $_)" }

    if ($svc) {
        $svcCount = -1
        try { $svcCount = @(Get-Json "$api/rest/v1/$t`?select=id" $hS).Count }
        catch { $svcCount = "err$(Get-ErrCode $_)" }
        $ok = ($anonCount -eq $wantAnon) -and ($svcCount -eq $wantSvc)
        Check "tabel $t" $ok "anon=$anonCount (harap $wantAnon) | service=$svcCount (harap $wantSvc)"
    } else {
        # Tanpa service_role kita hanya bisa memastikan sisi anon benar.
        # Untuk tabel privat, anon=0 justru bukti RLS bekerja.
        $ok = ($anonCount -eq $wantAnon)
        $ket = if ($wantAnon -eq 0) { "anon=$anonCount - RLS memblokir (benar)" } else { "anon=$anonCount (harap $wantAnon)" }
        Check "tabel $t" $ok $ket
    }
}

# ------------------------------------------------------------ PostGIS RPC --
Section 'RPC PostGIS get_nearby_chargers'
try {
    $body = @{
        user_lat = -8.6920; user_lng = 115.2580; radius_meters = 30000
        filter_connector = 'ALL'; min_power = 0
    } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$api/rest/v1/rpc/get_nearby_chargers" -Headers $hA `
            -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 30 -UseBasicParsing
    $parsed = $r.Content | ConvertFrom-Json
    $rows = @($parsed)

    Check 'RPC mengembalikan seluruh charger' ($rows.Count -eq 8) "charger dalam radius 30 km: $($rows.Count)"

    if ($rows.Count -gt 0) {
        $nearest = $rows[0]
        $d = [math]::Round([double]$nearest.distance_meters, 1)
        Check 'titik acuan tepat di charger Sanur' ($d -lt 1) "$($nearest.name) = $d m"

        $asc = $true
        for ($i = 1; $i -lt $rows.Count; $i++) {
            if ([double]$rows[$i].distance_meters -lt [double]$rows[$i - 1].distance_meters) { $asc = $false; break }
        }
        $far = [math]::Round([double]$rows[$rows.Count - 1].distance_meters / 1000, 1)
        Check 'urutan jarak menaik (ST_Distance)' $asc "terjauh $($rows[$rows.Count - 1].name) = $far km"

        $withConn = @($rows | Where-Object { @($_.connectors).Count -gt 0 }).Count
        Check 'join connectors JSONB ikut' ($withConn -eq 8) "$withConn dari 8 charger punya connector"

        $connOk = $true
        foreach ($row in $rows) {
            foreach ($c in @($row.connectors)) {
                if (-not $c.bayNumber -or -not $c.type) { $connOk = $false }
            }
        }
        Check 'field camelCase connector lengkap' $connOk "bayNumber & type terisi"
    }
} catch {
    Check 'RPC get_nearby_chargers' $false $_.Exception.Message
}

# ------------------------------------------------------------------- Auth --
Section 'Auth (GoTrue)'
try {
    $h = Invoke-WebRequest -Uri "$api/auth/v1/health" -Headers $hA -Method Get -TimeoutSec 20 -UseBasicParsing
    $j = $h.Content | ConvertFrom-Json
    Check 'Auth service hidup' ($h.StatusCode -eq 200) "name=$($j.name) version=$($j.version)"
} catch {
    Check 'Auth service hidup' $false "HTTP $(Get-ErrCode $_)"
}

# --------------------------------------------------------------- Realtime --
Section 'Realtime (WebSocket gateway)'
# /realtime/v1/websocket memang memerlukan token; 401 berarti service hidup
# di balik Kong. 404/502 berarti routing ke realtime mati.
try {
    $null = Invoke-WebRequest -Uri "$api/realtime/v1/websocket" -Headers $hA -Method Get -TimeoutSec 20 -UseBasicParsing
    Check 'Realtime gateway hidup' $true 'HTTP 200'
} catch {
    $code = Get-ErrCode $_
    Check 'Realtime gateway hidup' ($code -eq 401 -or $code -eq 426) "HTTP $code (401 = butuh token, service hidup)"
}

# -------------------------------------------------------------------- RLS --
Section 'Row Level Security: anon key harus DITOLAK saat menulis'
try {
    $payload = @{
        name = 'RLS probe'; operator_name = 'probe'; address = 'probe'
        latitude = 0.0; longitude = 0.0
    } | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$api/rest/v1/chargers" -Headers $hA -Method Post `
            -Body $payload -ContentType 'application/json' -TimeoutSec 20 -UseBasicParsing
    Check 'anon POST ditolak RLS' ($r.StatusCode -ge 400) "HTTP $($r.StatusCode) (seharusnya 401/403)"
} catch {
    $code = Get-ErrCode $_
    if ($code -gt 0) { Check 'anon POST ditolak RLS' ($code -ge 400) "HTTP $code - RLS aktif" }
    else { Check 'anon POST ditolak RLS' $false "tidak ada respons HTTP: $($_.Exception.Message.Split([char]10)[0])" }
}

if ($svc) {
    Section 'Kunci service_role (server-only)'
    try {
        $r = @(Get-Json "$api/rest/v1/chargers?select=id&limit=1" $hS)
        Check 'service_role key berfungsi' ($r.Count -eq 1) 'service_role berhasil membaca data'
    } catch {
        Check 'service_role key berfungsi' $false "HTTP $(Get-ErrCode $_)"
    }
}

# --------------------------------------------------------------- ringkasan --
Write-Host ''
$color = if ($script:fail -eq 0) { 'Green' } else { 'Red' }
Write-Host ("HASIL: {0} pass, {1} fail, {2} info" -f $script:pass, $script:fail, $script:info) -ForegroundColor $color
if ($script:fail -eq 0) {
    Write-Host 'Backend VOLTARA SIAP dipakai.' -ForegroundColor Green
    exit 0
} else {
    Write-Host 'Ada pemeriksaan yang gagal - lihat baris [FAIL] di atas.' -ForegroundColor Red
    exit 1
}
