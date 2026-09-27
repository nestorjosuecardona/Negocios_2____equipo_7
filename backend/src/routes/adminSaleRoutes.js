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
    '/',
    asyncHandler(
        controller.adminIndex,
    ),
);

router.get(
    '/:id',
    asyncHandler(
        controller.adminShow,
    ),
);

router.patch(
    '/:id/estado',
    asyncHandler(
        controller.adminUpdateStatus,
    ),
);

export default router;