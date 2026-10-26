import { Router } from 'express';
import * as controller from '../controllers/erpController.js';
import { requireRole } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const administrators = ['SUPER_ADMIN', 'ADMIN'];

router.get('/metricas', asyncHandler(controller.dashboard));
router.get('/catalogo', asyncHandler(controller.catalog));
router.get('/ordenes', asyncHandler(controller.indexOrders));
router.get('/ordenes/:id', asyncHandler(controller.showOrder));
router.post(
    '/ordenes',
    requireRole(...administrators, 'VENTAS'),
    asyncHandler(controller.createOrder),
);
router.post(
    '/ordenes/procesar',
    requireRole(...administrators, 'VENTAS', 'LOGISTICA'),
    asyncHandler(controller.processOrderFromBody),
);
router.post(
    '/ordenes/:id/procesar',
    requireRole(...administrators, 'VENTAS', 'LOGISTICA'),
    asyncHandler(controller.processOrder),
);
router.put(
    '/ordenes/:id/estado',
    requireRole(...administrators),
    asyncHandler(controller.updateOrderStatus),
);
router.get('/estado', asyncHandler(controller.showState));
router.put(
    '/estado',
    requireRole(...administrators),
    asyncHandler(controller.updateState),
);

export default router;
