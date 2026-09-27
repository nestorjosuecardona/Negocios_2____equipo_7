import { Router } from 'express';

import * as clientController
    from '../controllers/clientController.js';

import {
    byClient as interactionsByClient,
} from '../controllers/interactionController.js';

import {
    byClient as evaluationsByClient,
    storeForClient as createEvaluation,
} from '../controllers/evaluationController.js';

const router = Router();

router.get(
    '/',
    clientController.index,
);

router.post(
    '/',
    clientController.store,
);

router.get(
    '/:id',
    clientController.show,
);

router.put(
    '/:id',
    clientController.update,
);

router.delete(
    '/:id',
    clientController.destroy,
);

router.put(
    '/:id/etapa',
    clientController.updateStage,
);

router.get(
    '/:id/interacciones',
    interactionsByClient,
);

router.get(
    '/:id/evaluaciones',
    evaluationsByClient,
);

router.post(
    '/:id/evaluaciones',
    createEvaluation,
);

export default router;