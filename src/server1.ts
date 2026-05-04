import debug from 'debug';
import { createServer } from 'node:http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import type { Request, Response } from 'express';
import { products } from '../data/products.ts';

const env = process.env;

// Logger para comprobaciones
const log = debug(` ${env.PROJECT_NAME}`);
log(`Starting node server...`);
console.log('hola', env.PORT);

// Creamos la interfaz de la entidad <Producto> para que esté correctamente tipada
interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

const createApp = () => {
    log('Starting Express app...');
    const app = express();

    // Desactivamos la cabecera automática de express (buena práctica de seguridad)
    app.disable('x-powered-by');
    // Usamos morgan para logs de las peticiones al servidor
    app.use(morgan('dev'));
    // Usamos CORS para permitir realizar peticiones desde dominios diferentes al servidor
    app.use(
        cors({
            origin: '*',
        }),
    );
    // Parsea json
    app.use(express.json());
    // Parsea los "bodies" en las peticiones entrantes
    app.use(express.urlencoded());

    // Ruta por defecto para comprobar el estado del servidor (lo usan sobre todo bots de manera automática)
    app.use('/health', (_req: Request, res: Response) => {
        return res.json({
            status: 'ok',
            timeStamp: new Date().toISOString(),
        });
    });

    // Ruta a la raíz del proyecto
    app.get('/', async (_req: Request, res: Response) => {
        log('Received request to root endpoint');
        return res.send('Hello ROOT');
    });

    // Ruta a la API
    app.get('/api', async (_req: Request, res: Response) => {
        log('Received request to API endpoint');
        return res.send('Hello API');
    });

    // Rutas CRUD de producto

    // GetAllProducts
    app.get('/api/products', async (_req: Request, res: Response) => {
        log('Received request to get all products');
        // Aquí deberíamos llamar a un router + controller + repo, por ahora lo dejamos todo junto
        return res.json(products);
    });

    //GetProductById;
    app.get('/api/products/:id', async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            log('Missing id');
            return res.status(400).json({ error: 'Bad request' });
        }
        log(`Received request to get product with id: ${id}`);
        const product = products.find((p) => p.id === parseInt(id as string));
        if (!product) {
            log(`Product with id ${id} not found`);
            return res.status(404).json({ error: 'Product not found' });
        }
        return res.json(product);
    });

    // CreateProduct
    app.post('/api/products', async (req: Request, res: Response) => {
        const { name, price, stock } = req.body;
        log('Received request to create product with data:', {
            name,
            price,
            stock,
        });
        if (!name || !price || !stock) {
            log('Missing required fields to create product');
            return res
                .status(400)
                .json({ error: 'Missing required fields: name, price, stock' });
        }
        const newProduct: Product = {
            id: products.length + 1,
            name,
            price,
            stock,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        };
        products.push(newProduct);
        log('Product created successfully:', newProduct);

        return res.status(201).json(newProduct);
    });

    // UpdateProduct ->
    app.patch('/api/products/:id', async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            log('Missing id');
            return res.status(400).json({ error: 'Bad request' });
        }
        const { name, price, stock, is_active } = req.body;
        log(`Received request to update product with id: ${id}`);
        const productIndex = products.findIndex(
            (p) => p.id === parseInt(id as string),
        );
        if (productIndex === -1) {
            log(`Product with id ${id} not found`);
            return res.status(404).json({ error: 'Product not found' });
        }
        if (!name || !price || !stock) {
            log('Missing required fields to update product');
            return res
                .status(400)
                .json({ error: 'Missing required fields: name, price, stock' });
        }
        if (!products) {
            log(`Product with id ${id} not found`);
            return res.status(404).json({ error: 'Product not found' });
        }
        products[productIndex] = {
            ...products[productIndex],
            name,
            price,
            stock,
            is_active,
            updated_at: new Date(),
        };
        log('Product updated successfully:', products[productIndex]);
        return res.json(products[productIndex]);
    });

    // DeleteProduct
    app.delete('/api/products/:id', async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            log('Missing id');
            return res.status(400).json({ error: 'Bad request' });
        }
        log(`Received request to delete product with id: ${id}`);
        const productIndex = products.findIndex(
            (p) => p.id === parseInt(id as string),
        );
        if (productIndex === -1) {
            log(`Product with id ${id} not found`);
            return res.status(404).json({ error: 'Product not found' });
        }
        const deletedProduct = products.splice(productIndex, 1);
        log('Product deleted successfully:', deletedProduct[0]);
        return res.json(deletedProduct[0]);
    });

    // Endpoint para rutas o recursos no encontrados, por buenas prácticas llamaríamos a un manejador de errores al que pasaríamos el error con next, por ahora lo mantenemos aquí para el prototipo
    app.use((_req: Request, res: Response) => {
        log('Calling errorHandler for 404 error...');
        const error = new Error('Not Found');
        return res.send(error);
    });

    return app;
};

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
