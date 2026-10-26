import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import scmRoutes from './routes/scmRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

import {
    requireAuth,
    requireRole
} from './middlewares/auth.js';

import { asyncHandler } from './utils/asyncHandler.js';

import {
    index as metrics
} from './controllers/metricsController.js';

import {
    myActivity
} from './controllers/interactionController.js';

import {
    notFound,
    errorHandler
} from './middlewares/errorHandler.js';

import adminUserRoutes
    from './routes/adminUserRoutes.js';

import saleRoutes
    from './routes/saleRoutes.js';
import profileRoutes
    from './routes/profileRoutes.js';
import adminSaleRoutes
    from './routes/adminSaleRoutes.js';
import erpRoutes
    from './routes/erpRoutes.js';

const app = express();


app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            'http://localhost:5173'
    })
);

app.use(express.json());

app.use(
    '/api/public',
    publicRoutes,
);

app.get(
    '/api/health',
    (req, res) => {
        res.json({
            ok: true,
            project: 'Negocios 2'
        });
    }
);


app.use(
    '/api/auth',
    authRoutes
);


// CRM

app.use(
    '/api/clientes',
    requireAuth,
    requireRole(
        'SUPER_ADMIN',
        'ADMIN'
    ),
    clientRoutes
);

app.use(
    '/api/interacciones',
    requireAuth,
    requireRole(
        'SUPER_ADMIN',
        'ADMIN'
    ),
    interactionRoutes
);

app.get(
    '/api/actividad/mia',
    requireAuth,
    requireRole(
        'SUPER_ADMIN',
        'ADMIN'
    ),
    asyncHandler(myActivity)
);

app.get(
    '/api/metricas',
    requireAuth,
    requireRole(
        'SUPER_ADMIN',
        'ADMIN'
    ),
    asyncHandler(metrics)
);


// SCM

app.use(
    '/api/scm',
    requireAuth,
    requireRole(
        'SUPER_ADMIN',
        'ADMIN',
        'LOGISTICA'
    ),
    scmRoutes
);

app.use(
    '/api/erp',
    requireAuth,
    requireRole(
        'SUPER_ADMIN',
        'ADMIN',
        'VENTAS',
        'LOGISTICA'
    ),
    erpRoutes
);

app.use(
    '/api/admin/usuarios',
    requireAuth,
    requireRole('SUPER_ADMIN'),
    adminUserRoutes
);

app.use(
    '/api/ventas',
    requireAuth,
    requireRole('CLIENTE'),
    saleRoutes
);

app.use(
    '/api/perfil',
    requireAuth,
    requireRole('CLIENTE'),
    profileRoutes
);

app.use(
    '/api/admin/ventas',
    requireAuth,
    requireRole(
        'SUPER_ADMIN',
        'ADMIN'
    ),
    adminSaleRoutes
);

app.use(notFound);
app.use(errorHandler);

export default app;
