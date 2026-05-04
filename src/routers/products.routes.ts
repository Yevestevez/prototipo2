import { Router } from 'express';
import debug from 'debug';

import type { ProductsController } from '../controllers/products.controller.ts';

const log = debug(`${process.env.PROJECT_NAME}:router:products`);
log('Loading Products router...');

export class ProductsRouter {
    #router: Router;
    #controller: ProductsController;

    constructor(controller: ProductsController) {
        this.#router = Router();
        this.#controller = controller;

        this.#router.get('/', this.#controller.getAllProducts);
    }

    get router() {
        return this.#router;
    }
}
