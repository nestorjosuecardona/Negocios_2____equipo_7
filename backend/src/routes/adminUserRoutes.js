import {
    Router,
} from 'express';

import {
    index,
    storeAdmin,
    storeBusinessUser,
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

router.post(
    '/personal',
    asyncHandler(
        storeBusinessUser,
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
