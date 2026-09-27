import {
    Router,
} from 'express';

import * as controller
    from '../controllers/profileController.js';

import {
    asyncHandler,
} from '../utils/asyncHandler.js';

const router =
    Router();

router.get(
    '/',
    asyncHandler(
        controller.show,
    ),
);

router.put(
    '/',
    asyncHandler(
        controller.update,
    ),
);

export default router;