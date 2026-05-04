import debug from 'debug';
import { createServer } from 'node:http';
import { createApp } from './app.ts';

const env = process.env;

// Logger para comprobaciones
const log = debug(`${env.PROJECT_NAME}`);
log(`Starting node server...`);
console.log('hola', env.PORT);

const listenManager = () => {
    const addr = server.address();
    if (addr === null) return;
    let bind;
    if (typeof addr === 'string') {
        bind = 'pipe ' + addr;
    } else {
        bind =
            addr.address === '::'
                ? `http://localhost:${addr?.port}`
                : `${addr.address}:${addr?.port}`;
    }
    if (env.NODE_ENV !== 'dev') {
        console.log(`Server listening on ${bind}`);
    } else {
        log(`Server listening from ${bind}`);
    }
};

// startServer -> función que envuelve la creación del servidor node con app express
const startServer = async () => {
    // Nos traemos el listenManager para decorar el log de escucha del servidor

    log('Starting Node server...');

    // Introducimos el puerto como variable de entorno
    const port = env.PORT || 3000;

    const app = createApp();
    // Creamos nuestro servidor pasándole nuestra aplicación app
    const server = createServer(app);
    // Ponemos al servidor a escuchar en el puerto
    server.listen(port);
    server.on('listening', listenManager);

    return server;
};

// Levantamos nuestro servidor
const server = await startServer().catch((error) => {
    log('Error starting server:', error);
    // Cerramos el proceso de node con error (1)
    process.exit(1);
});
