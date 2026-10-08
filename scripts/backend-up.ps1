<#
  VOLTARA — Backend (Supabase) local bring-up
  ============================================================================
  Menjalankan backend VOLTARA secara lokal memakai Supabase CLI + Docker:
    - Postgres 17 + PostGIS   (port 54322)
    - PostgREST / REST API    (port 54321)
    - GoTrue  / Auth, Realtime, Storage
    - Studio  / Dashboard     (port 54323)
    - Mailpit / Inbucket      (port 54324)

  Tahapan:
    0. install dependency npm
    1. pastikan Docker daemon hidup (otomatis memakai jembatan npipe->TCP)
    2. buat supabase/config.toml bila belum ada
    3. jalankan stack + terapkan seluruh migrasi di supabase/migrations
    4. tulis .env berisi API KEY ASLI hasil generate lokal
    5. verifikasi endpoint backend lewat HTTP (verify-backend.ps1)

  Pemakaian:
    powershell -ExecutionPolicy Bypass -File scripts/backend-up.ps1
    ... -SkipInstall    # tanpa npm install
    ... -NoBridge       # pakai named pipe Docker langsung
    ... -StatusOnly     # status + key saja
    ... -VerifyOnly     # hanya verifikasi HTTP
    ... -Reset          # migrasi ulang dari nol
    ... -Stop           # hentikan stack

  Kompatibel Windows PowerShell 5.1 (tidak butuh PowerShell 7).
#>
[CmdletBinding()]
param(
    [switch]$StatusOnly,
    [switch]$VerifyOnly,
    [switch]$Reset,
    [switch]$Stop,
    [switch]$SkipInstall,
    [switch]$NoBridge
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$SUPABASE_CLI = 'supabase@latest'
$NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false

function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "  [X]  $msg" -ForegroundColor Red }

# PowerShell 5.1 mengubah tulisan native command ke stderr menjadi error
# terminating saat $ErrorActionPreference = 'Stop'. Helper ini menetralkannya.
function Invoke-Native {
    param(
        [Parameter(Mandatory = $true)][string]$Exe,
        [string[]]$CliArgs = @(),
        [switch]$Capture
    )
    $eap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        if ($Capture) {
            $out = & $Exe @CliArgs 2>$null
            $code = $LASTEXITCODE
            return [pscustomobject]@{ Text = (($out | Out-String).Trim()); ExitCode = $code }
        }
        & $Exe @CliArgs
        return [pscustomobject]@{ Text = ''; ExitCode = $LASTEXITCODE }
    } finally {
        $ErrorActionPreference = $eap
    }
}

function Invoke-Supabase {
    param([string[]]$CliArgs = @())
    $r = Invoke-Native -Exe 'npx' -CliArgs (@('--yes', $SUPABASE_CLI) + $CliArgs)
    if ($r.ExitCode -ne 0) { throw "supabase $($CliArgs -join ' ') gagal (exit $($r.ExitCode))" }
    return $r
}

# --------------------------------------------------------- 0. environment --
# npx/npm memakai cache di dalam project supaya tidak diblokir sandbox.
$env:npm_config_cache = Join-Path $root '.npm-cache'

# CLI Supabase menulis state ke %USERPROFILE%\.supabase; folder itu bisa
# terkunci sehingga muncul EPERM saat menulis telemetry.json.tmp.
$env:SUPABASE_TELEMETRY_DISABLED = '1'
$env:DO_NOT_TRACK = '1'
Remove-Item (Join-Path $env:USERPROFILE '.supabase\telemetry.json*') -Force -ErrorAction SilentlyContinue

# CLI juga membuat direktori temporer saat inisialisasi database, dan gagal
# bila diarahkan ke %TEMP% pengguna. Arahkan TMP/TEMP ke dalam project.
$tmpDir = Join-Path $root '.tmp'
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
$env:TMP = $tmpDir
$env:TEMP = $tmpDir

# ------------------------------------------------- 1. dependency frontend --
if (-not ($StatusOnly -or $VerifyOnly)) {
    Step 'Dependency npm'
    if ($SkipInstall) {
        Warn 'Dilewati (-SkipInstall)'
    } elseif (Test-Path (Join-Path $root 'node_modules\vite')) {
        Ok 'node_modules sudah terisi'
    } else {
        $r = Invoke-Native -Exe 'npm' -CliArgs @('install', '--no-audit', '--no-fund')
        if ($r.ExitCode -ne 0) { Fail 'npm install gagal.'; exit 1 }
        Ok 'dependency terpasang'
    }
}

# ---------------------------------------------------------------- 2. Docker --
Step 'Docker daemon'

function Test-TcpPort($h, $p) {
    try {
        $c = New-Object System.Net.Sockets.TcpClient
        $c.Connect($h, $p)
        $c.Close()
        return $true
    } catch { return $false }
}

# Docker Desktop di Windows hanya bicara lewat named pipe, dan Supabase CLI
# (binary Bun) selalu gagal membukanya. Jembatan TCP di
# scripts/docker-npipe-bridge.mjs menyajikannya sebagai endpoint TCP.
if (-not $env:DOCKER_HOST -and -not $NoBridge) {
    $bridgePort = 2375
    if (-not (Test-TcpPort '127.0.0.1' $bridgePort)) {
        $bridgeScript = Join-Path $PSScriptRoot 'docker-npipe-bridge.mjs'
        if (Test-Path $bridgeScript) {
            Write-Host '  ... menjalankan jembatan Docker npipe -> TCP'
            try {
                Start-Process -FilePath 'node' -ArgumentList @($bridgeScript) -WindowStyle Hidden -ErrorAction Stop
            } catch {
                Warn "Gagal menjalankan jembatan: $($_.Exception.Message)"
            }
            for ($i = 0; $i -lt 20; $i++) {
                Start-Sleep -Milliseconds 500
                if (Test-TcpPort '127.0.0.1' $bridgePort) { break }
            }
        }
    }
    if (Test-TcpPort '127.0.0.1' $bridgePort) {
        $env:DOCKER_HOST = "tcp://127.0.0.1:$bridgePort"
        Ok "Jembatan Docker aktif: $env:DOCKER_HOST"
    } else {
        Warn 'Jembatan Docker tidak tersedia — memakai named pipe langsung.'
    }
}

$d = Invoke-Native -Exe 'docker' -CliArgs @('info', '--format', '{{.ServerVersion}}') -Capture
if ($d.ExitCode -ne 0 -or -not $d.Text) {
    Fail 'Docker daemon tidak terjangkau.'
    Write-Host '  Nyalakan Docker Desktop, tunggu sampai "Engine running", lalu ulangi.'
    exit 1
}
Ok "Docker server $($d.Text)"

# ------------------------------------------------------------------ 3. CLI --
Step 'Supabase CLI'
$c = Invoke-Native -Exe 'npx' -CliArgs @('--yes', $SUPABASE_CLI, '--version') -Capture
if ($c.ExitCode -ne 0) { Fail 'Gagal mengunduh Supabase CLI via npx.'; exit 1 }
Ok "CLI $($c.Text.Split([char]10)[-1].Trim())"

# ----------------------------------------------------------------- 4. init --
Step 'Konfigurasi project'
$cfgPath = Join-Path $root 'supabase\config.toml'
if (-not (Test-Path $cfgPath)) {
    # stdin dikosongkan supaya prompt interaktif CLI tidak menggantung.
    $null | & npx --yes $SUPABASE_CLI init
    if (-not (Test-Path $cfgPath)) {
        Warn 'supabase init tidak menghasilkan config.toml — menulis konfigurasi minimal.'
        $minimal = @'
project_id = "voltra"

[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
shadow_port = 54320

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000"]

[realtime]
enabled = true
'@
        [System.IO.File]::WriteAllText($cfgPath, $minimal, $NoBom)
    }
    Ok 'supabase/config.toml siap'
} else {
    Ok 'supabase/config.toml sudah ada'
}

if ($Stop) {
    Step 'Menghentikan stack'
    Invoke-Supabase -CliArgs @('stop') | Out-Null
    Ok 'Stack dihentikan (data tetap di volume Docker)'
    exit 0
}

if ($StatusOnly) {
    Step 'Status stack'
    Invoke-Supabase -CliArgs @('status') | Out-Null
    exit 0
}

# ---------------------------------------------------------------- 5. start --
if ($Reset) {
    Step 'Reset database + migrasi ulang'
    Invoke-Supabase -CliArgs @('db', 'reset') | Out-Null
}

if (-not $VerifyOnly) {
    Step 'Menjalankan stack Supabase'
    Invoke-Supabase -CliArgs @('start') | Out-Null
    Ok 'Stack berjalan'
}

# --------------------------------------------------------- 6. ambil API key --
Step 'Mengambil API key lokal'
$s = Invoke-Native -Exe 'npx' -CliArgs @('--yes', $SUPABASE_CLI, 'status', '-o', 'env') -Capture
if ($s.ExitCode -ne 0) { Fail 'Gagal membaca env dari Supabase CLI.'; exit 1 }

$vars = @{}
foreach ($line in ($s.Text -split "`r?`n")) {
    $m = [regex]::Match($line.Trim(), '^([A-Z0-9_]+)="?(.*?)"?$')
    if ($m.Success) { $vars[$m.Groups[1].Value] = $m.Groups[2].Value }
}

$apiUrl  = $vars['API_URL']
$anonKey = $vars['ANON_KEY'];         if (-not $anonKey) { $anonKey = $vars['PUBLISHABLE_KEY'] }
$svcKey  = $vars['SERVICE_ROLE_KEY']; if (-not $svcKey) { $svcKey  = $vars['SECRET_KEY'] }
$dbUrl   = $vars['DB_URL']

if (-not $apiUrl -or -not $anonKey) {
    Fail 'API_URL / ANON_KEY tidak ada di output "supabase status -o env".'
    Write-Host $s.Text
    exit 1
}

function Peek($v) { if ($v -and $v.Length -gt 24) { $v.Substring(0, 24) + '...' } else { $v } }

Ok "API URL      : $apiUrl"
Ok "anon key     : $(Peek $anonKey)  (len $($anonKey.Length))"
if ($svcKey) { Ok "service_role : $(Peek $svcKey)  (len $($svcKey.Length))" }
else { Warn 'service_role key tidak ditemukan.' }

# ------------------------------------------------------------- 7. tulis .env --
Step 'Menulis .env'
$envPath = Join-Path $root '.env'
$gemini = ''
if (Test-Path $envPath) {
    $prev = Get-Content $envPath -Raw
    $gm = [regex]::Match($prev, 'GEMINI_API_KEY="?([^"\r\n]*)"?')
    if ($gm.Success) { $gemini = $gm.Groups[1].Value }
    $backup = "$envPath.bak-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $envPath $backup
    Warn "File .env lama dicadangkan ke $(Split-Path -Leaf $backup)"
}

$envContent = @"
# ==============================================================================
# VOLTARA EV Mobility Intelligence Platform — Environment (LOKAL, auto-generated)
# Dibuat oleh scripts/backend-up.ps1 pada $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# JANGAN commit file ini (sudah diblokir oleh .gitignore).
# ==============================================================================

# Supabase lokal — REST / Auth / Realtime endpoint
VITE_SUPABASE_URL="$apiUrl"

# Kunci publik. Aman untuk bundle client karena seluruh tabel dilindungi RLS.
VITE_SUPABASE_ANON_KEY="$anonKey"
VITE_SUPABASE_PUBLISHABLE_KEY="$($vars['PUBLISHABLE_KEY'])"

# Kunci rahasia server-only. Hanya untuk skrip admin / seed / test.
# JANGAN pernah diberi prefix VITE_ (akan bocor ke bundle browser).
SUPABASE_SERVICE_ROLE_KEY="$svcKey"

# Koneksi database langsung (psql / migrasi manual)
DATABASE_URL="$dbUrl"

# Gemini AI — opsional, backend tetap jalan tanpanya
GEMINI_API_KEY="$gemini"

# Aplikasi
APP_URL="http://localhost:3000"
"@

[System.IO.File]::WriteAllText($envPath, $envContent, $NoBom)
Ok ".env ditulis ($((Get-Item $envPath).Length) byte, tanpa BOM)"

# ------------------------------------------------------------ 8. verifikasi --
$verify = Join-Path $PSScriptRoot 'verify-backend.ps1'
if (Test-Path $verify) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $verify
}

# --------------------------------------------------------------- 9. ringkas --
Step 'Ringkasan backend'
Write-Host "  Studio   : http://127.0.0.1:54323"
Write-Host "  REST API : $apiUrl/rest/v1/chargers"
Write-Host "  DB       : $dbUrl"
Write-Host "  Kunci    : tersimpan di .env"
Write-Host ''
Write-Host '  Frontend : npm run dev   ->  http://localhost:3000' -ForegroundColor Gray
