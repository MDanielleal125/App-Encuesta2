const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT_BASE = parseInt(process.env.PORT || '4000', 10);
const PORT_MAX = PORT_BASE + 10;

function tryListen(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        server.close(() => resolve(null));
      } else {
        reject(err);
      }
    });
  });
}

async function start() {
  for (let p = PORT_BASE; p <= PORT_MAX; p++) {
    const server = await tryListen(p);
    if (server) {
      console.log(`API de encuesta escuchando en http://localhost:${p}`);
      if (p !== PORT_BASE) {
        console.log(`(Puerto ${PORT_BASE} estaba ocupado. Si usas el frontend, en frontend/.env agrega: VITE_API_TARGET=http://localhost:${p})`);
      }
      return;
    }
  }
  console.error(`No se pudo iniciar: todos los puertos de ${PORT_BASE} a ${PORT_MAX} están en uso.`);
  process.exit(1);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
