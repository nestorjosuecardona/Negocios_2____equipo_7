import { Router } from 'express';
import * as c
    from '../controllers/authController.js';

import {
    requireAuth
} from '../middlewares/auth.js';


const router = Router();


router.post(
    '/register',
    c.register
);

router.post(
    '/login',
    c.login
);

router.get(
    '/me',
    requireAuth,
    c.me
);


export default router;