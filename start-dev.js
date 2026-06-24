const { spawn, execSync } = require('child_process');
const path = require('path');
const net = require('net');

const SCRIPT_DIR = __dirname;
const ROOT = process.env.MOCK_SERVER_DIR || SCRIPT_DIR;
const FRONTEND = process.env.ANGULAR_PROJECT_DIR || path.join(SCRIPT_DIR, '..', 'angular-sistema-odonto');
const MOCK_PORT = 8081;

function ensureEnvVar(name, value) {
  if (!process.env[name]) {
    try {
      execSync(
        `powershell -NoProfile -Command "[System.Environment]::SetEnvironmentVariable('${name}', '${value}', 'User')"`,
        { stdio: 'ignore', timeout: 5000 }
      );
      console.log(`  ✓ Variável ${name} criada permanentemente`);
    } catch {
      console.warn(`  ⚠ Não foi possível criar ${name} (rode como admin se quiser persistir)`);
    }
  }
}

// Cria as env vars permanentemente se não existirem
ensureEnvVar('MOCK_SERVER_DIR', SCRIPT_DIR);
ensureEnvVar('ANGULAR_PROJECT_DIR', FRONTEND);
ensureEnvVar('BACKEND_PROJECT_DIR', path.join(SCRIPT_DIR, '..', 'backend-sistema-odonto'));

function killProcessOnPort(port) {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', timeout: 3000, shell: true });
    const lines = result.trim().split('\n').filter(l => l.includes('LISTENING'));
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore', timeout: 3000 }); } catch { }
        console.log(`  Liberada porta ${port} (PID ${pid})`);
      }
    }
  } catch { }
}

function startProcess(name, command, args, opts = {}) {
  const cmd = [command, ...args].join(' ');
  const proc = spawn(cmd, [], {
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true,
    ...opts,
  });
  proc.on('error', (err) => console.error(`[${name}] Erro ao iniciar:`, err.message));
  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${name}] Fechou com código ${code}`);
    }
  });
  return proc;
}

function waitForPort(port, timeoutMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    function check() {
      const sock = new net.Socket();
      sock.on('connect', () => { sock.destroy(); resolve(true); });
      sock.on('error', () => {
        if (Date.now() - start > timeoutMs) resolve(false);
        else setTimeout(check, 500);
      });
      sock.connect(port, '127.0.0.1');
    }
    check();
  });
}

console.log('');
console.log('========================================');
console.log('  Ambiente Dev Sistema Odonto');
console.log('  Modo: Mock (Node.js com estado)');
console.log('========================================');
console.log('');

console.log('Verificando portas...');
killProcessOnPort(MOCK_PORT);
killProcessOnPort(4200);

setTimeout(() => {
  const mockServer = startProcess('MockServer', 'node', [
    path.join(ROOT, 'server.js'),
  ], { cwd: ROOT });

  setTimeout(async () => {
    const ready = await waitForPort(MOCK_PORT, 10000);
    if (!ready) {
      console.warn('[MockServer] Não respondeu, iniciando Angular mesmo assim');
    }

    const ng = startProcess('Angular', 'npx', [
      'ng', 'serve',
    ], { cwd: FRONTEND });

    function cleanup() {
      console.log('\nEncerrando...');
      killProcessOnPort(MOCK_PORT);
      process.exit(0);
    }

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }, 1500);
}, 2000);
