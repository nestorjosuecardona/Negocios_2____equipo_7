import { Router }
    from 'express';

import * as controller
    from '../controllers/publicStoreController.js';

const router = Router();

router.get(
    '/categorias',
    controller.categories,
);

router.get(
    '/productos',
    controller.products,
);

router.get(
    '/productos/:id',
    controller.product,
);

export default router;