import debug from 'debug';
import type { PrismaClient, Product } from '../generated/prisma/client.ts';

const log = debug(`${process.env.PROJECT_NAME}:repo:products`);
log('Loading products repository...');

export class ProductsRepo {
    #prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.#prisma = prisma;
    }

    getAllProducts = async (): Promise<Product[]> => {
        log('Getting all Products...');

        return this.#prisma.product.findMany({});
    };
}
