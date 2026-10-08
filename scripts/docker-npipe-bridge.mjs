/**
 * VOLTARA — Docker named-pipe → TCP bridge (Windows)
 * ============================================================================
 * Kenapa ini perlu:
 *   Docker Desktop di Windows hanya menyediakan REST API lewat named pipe
 *   (npipe:////./pipe/dockerDesktopLinuxEngine). Supabase CLI (binary Bun)
 *   gagal membuka pipe tersebut — selalu "permission denied" — padahal
 *   docker CLI, node, dan powershell bisa membukanya dengan lancar.
 *
 *   Skrip ini menjadi perantara: ia membuka named pipe Docker, lalu
 *   menyajikannya sebagai endpoint TCP lokal. Supabase CLI kemudian cukup
 *   diarahkan ke TCP tersebut lewat DOCKER_HOST, tanpa menyentuh npipe.
 *
 * Pemakaian:
 *   node scripts/docker-npipe-bridge.mjs                 # 127.0.0.1:2375
 *   BRIDGE_PORT=2376 node scripts/docker-npipe-bridge.mjs
 *
 * Lalu untuk Supabase CLI:
 *   $env:DOCKER_HOST = "tcp://127.0.0.1:2375"
 *   npx supabase start
 */

import net from 'node:net';

const HOST = process.env.BRIDGE_HOST || '127.0.0.1';
const PORT = Number(process.env.BRIDGE_PORT || 2375);
const PIPE = process.env.BRIDGE_PIPE || '\\\\.\\pipe\\dockerDesktopLinuxEngine';

const server = net.createServer((client) => {
  const upstream = net.connect(PIPE);
  let closed = false;

  const shutdown = () => {
    if (closed) return;
    closed = true;
    client.destroy();
    upstream.destroy();
  };

  client.on('error', shutdown);
  upstream.on('error', shutdown);
  client.on('close', shutdown);
  upstream.on('close', shutdown);

  client.pipe(upstream);
  upstream.pipe(client);
});

server.on('error', (err) => {
  console.error(`[bridge] server error: ${err.code || ''} ${err.message}`);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`[bridge] siap: http://${HOST}:${PORT}  ->  ${PIPE}`);
  console.log('[bridge] pakai: $env:DOCKER_HOST = "tcp://' + HOST + ':' + PORT + '"');
});
