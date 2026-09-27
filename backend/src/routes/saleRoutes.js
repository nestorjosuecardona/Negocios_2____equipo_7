import {
    Router,
} from 'express';

import * as controller
    from '../controllers/saleController.js';

import {
    asyncHandler,
} from '../utils/asyncHandler.js';

const router =
    Router();

router.get(
    '/mias',
    asyncHandler(
        controller.mine,
    ),
);

router.get(
    '/mias/:id',
    asyncHandler(
        controller.showMine,
    ),
);

router.post(
    '/',
    asyncHandler(
        controller.store,
    ),
);

export default router;