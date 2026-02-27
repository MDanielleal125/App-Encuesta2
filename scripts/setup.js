const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function log(msg) {
  console.log('[Setup]', msg);
}

function run(cmd, cwd = root) {
  log(cmd);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
}

function copyEnvIfNeeded() {
  const backendDir = path.join(root, 'backend');
  const envPath = path.join(backendDir, '.env');
  const examplePath = path.join(backendDir, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    log('Creado backend/.env desde .env.example');
  } else if (fs.existsSync(envPath)) {
    log('backend/.env ya existe');
  }
}

function main() {
  log('Instalando dependencias del backend...');
  run('npm install', path.join(root, 'backend'));

  log('Instalando dependencias del frontend...');
  run('npm install', path.join(root, 'frontend'));

  copyEnvIfNeeded();

  log('Generando cliente Prisma y aplicando migraciones...');
  const backendDir = path.join(root, 'backend');
  run('npx prisma generate', backendDir);
  run('npx prisma migrate deploy', backendDir);

  log('Cargando datos iniciales (admin y preguntas)...');
  run('node prisma/seed.js', backendDir);

  log('Instalando dependencias de la raíz (concurrently)...');
  run('npm install', root);

  log('');
  log('=== Listo. Para iniciar la aplicación ejecuta: ===');
  log('  npm run dev');
  log('');
  log('Luego abre en el navegador: http://localhost:3000');
  log('Admin: cédula 00000000, contraseña admin123');
  log('');
}

main();
