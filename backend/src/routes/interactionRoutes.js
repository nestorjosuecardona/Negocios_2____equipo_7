import { Router } from 'express';
import * as c from '../controllers/interactionController.js';
const router=Router();
router.get('/',c.index);
router.post('/',c.store);
export default router;
