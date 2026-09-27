import {
    Router,
} from 'express';

import {
    index,
    storeAdmin,
    update,
    updateStatus,
} from '../controllers/adminUserController.js';

import {
    asyncHandler,
} from '../utils/asyncHandler.js';

const router =
    Router();

router.get(
    '/',
    asyncHandler(index),
);

router.post(
    '/administradores',
    asyncHandler(
        storeAdmin,
    ),
);

router.put(
    '/:id',
    asyncHandler(
        update,
    ),
);

router.patch(
    '/:id/estado',
    asyncHandler(
        updateStatus,
    ),
);

export default router;