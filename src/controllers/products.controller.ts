import debug from 'debug';
import type { NextFunction, Request, Response } from 'express';
import type { Product } from '../schemas/products.ts';
import type { ProductsRepo } from '../repo/products.repo.ts';
import { HttpError } from '../errors/http-errors.ts';

const log = debug(`${process.env.PROJECT_NAME}:controller:products`);
log('Starting products controller...');

export class ProductsController {
    #repo: ProductsRepo;

    constructor(repo: ProductsRepo) {
        this.#repo = repo;
    }

    getAllProducts = async (
        _req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        log('Getting all products...');

        try {
            const products: Product[] = await this.#repo.getAllProducts();
            return res.json(products);
        } catch (error) {
            const finalError = new HttpError(
                500,
                'Internal Server Error',
                'An error occurred while fetching products',
                {
                    cause: error,
                },
            );

            return next(finalError);
        }
    };
}
