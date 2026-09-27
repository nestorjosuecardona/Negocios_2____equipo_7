import { Router } from 'express';

import * as scmController
    from '../controllers/scmController.js';

import * as supplierController
    from '../controllers/supplierController.js';

import * as productController
    from '../controllers/productController.js';

import * as inventoryController
    from '../controllers/inventoryController.js';

import * as orderController
    from '../controllers/orderController.js';

import * as scmMaturityController
    from '../controllers/scmMaturityController.js';

import * as scmReportController
    from '../controllers/scmReportController.js';

const router =
    Router();

router.get(
    '/resumen',
    scmController.summary,
);

router.get(
    '/proveedores',
    supplierController.index,
);

router.post(
    '/proveedores',
    supplierController.store,
);

router.get(
    '/proveedores/:id',
    supplierController.show,
);

router.put(
    '/proveedores/:id',
    supplierController.update,
);

router.patch(
    '/proveedores/:id/estado',
    supplierController.updateStatus,
);

router.get(
    '/categorias',
    productController.categories,
);

router.get(
    '/productos',
    productController.index,
);

router.post(
    '/productos',
    productController.store,
);

router.get(
    '/productos/:id',
    productController.show,
);

router.put(
    '/productos/:id',
    productController.update,
);

router.patch(
    '/productos/:id/estado',
    productController.updateStatus,
);

router.put(
    '/productos/:id/estrategia',
    productController.updateStrategy,
);

router.get(
    '/productos/:id/movimientos',
    inventoryController.productMovements,
);

router.get(
    '/inventario',
    inventoryController.index,
);

router.get(
    '/inventario/movimientos',
    inventoryController.movements,
);

router.post(
    '/inventario/movimientos',
    inventoryController.storeMovement,
);

router.get(
    '/ordenes',
    orderController.index,
);

router.post(
    '/ordenes',
    orderController.store,
);

router.get(
    '/ordenes/:id',
    orderController.show,
);

router.patch(
    '/ordenes/:id/surtir',
    orderController.fulfill,
);

router.get(
    '/estado',
    scmMaturityController.show,
);

router.put(
    '/nivel',
    scmMaturityController.update,
);

router.get(
    '/reportes',
    scmReportController.dashboard,
);

export default router;