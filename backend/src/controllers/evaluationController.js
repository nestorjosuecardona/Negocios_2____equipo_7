import * as evaluationService
    from '../services/evaluationService.js';

export async function byClient(
    req,
    res,
) {
    const clientId =
        Number(req.params.id);

    const evaluations =
        await evaluationService
            .getClientEvaluations(
                clientId,
            );

    res.json(evaluations);
}

export async function storeForClient(
    req,
    res,
) {
    const clientId =
        Number(req.params.id);

    const userId =
        req.user.id;

    const evaluation =
        await evaluationService
            .createClientEvaluation({
                clientId,
                userId,
                puntuacion:
                    req.body.puntuacion,

                comentario:
                    req.body.comentario,
            });

    res
        .status(201)
        .json(evaluation);
}