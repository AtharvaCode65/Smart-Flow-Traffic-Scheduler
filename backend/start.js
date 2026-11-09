import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const directory = fileURLToPath(new URL('.', import.meta.url));
const children = new Set();
let stopping = false;

function launch(command, args) {
  const child = spawn(command, args, { cwd: directory, stdio: 'inherit', windowsHide: true });
  children.add(child);
  child.once('exit', () => children.delete(child));
  return child;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = launch(command, args);
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}

process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
process.on('exit', () => { for (const child of children) child.kill(); });

async function schedulerIsRunning() {
  try {
    const response = await fetch('http://127.0.0.1:18080/api/status', { signal: AbortSignal.timeout(1500) });
    const status = await response.json();
    return response.ok && Array.isArray(status.lanes) && status.lanes.length === 4;
  } catch { return false; }
}

try {
  if (await schedulerIsRunning()) {
    console.log('Using the C++ scheduler already running on port 18080.');
  } else {
    await run('cmake', ['-S', '.', '-B', 'build']);
    await run('cmake', ['--build', 'build', '--config', 'Debug']);
    const executable = [join(directory, 'build', 'Debug', 'smart_flow_server.exe'), join(directory, 'build', 'smart_flow_server.exe')].find(existsSync);
    if (!executable) throw new Error('CMake did not produce smart_flow_server.exe.');
    const scheduler = launch(executable, []);
    scheduler.once('error', (error) => { console.error(error.message); stop(1); });
    scheduler.once('exit', (code) => { if (!stopping) { console.error('C++ scheduler stopped.'); stop(code || 1); } });
    let ready = false;
    for (let attempt = 0; attempt < 30 && !stopping; attempt++) {
      if (await schedulerIsRunning()) { ready = true; break; }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!ready) throw new Error('C++ scheduler failed to start on port 18080.');
  }
  console.log('C++ scheduler ready at http://localhost:18080.');
  const records = launch(process.execPath, ['server.js']);
  records.once('error', (error) => console.error(`Records API: ${error.message}`));
  records.once('exit', (code) => {
    if (!stopping && code !== 0) console.error('Records API stopped. The C++ scheduler remains available; check your MongoDB configuration.');
  });
} catch (error) {
  console.error(`Unable to start backend: ${error.message}`);
  stop(1);
}
