import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import type { Request, Response } from 'express';
import { products } from '../data/products.ts';
import { log } from 'debug';
import type { Product } from './schemas/products.ts';
import type { PrismaClient } from './generated/prisma/client.ts';
import { ProductsRepo } from './repo/products.repo.ts';
import { ProductsController } from './controllers/products.controller.ts';
import { ProductsRouter } from './routers/products.routes.ts';

export const createApp = (prisma: PrismaClient) => {
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

    // Manejo de ruta de productos con router específico
    const productsRepo = new ProductsRepo(prisma);
    const productsController = new ProductsController(productsRepo);
    const productsRouter = new ProductsRouter(productsController);
    app.use('/api/products', productsRouter.router);

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
