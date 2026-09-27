import * as evaluationRepository
    from '../repositories/evaluationRepository.js';

import {
    findClientById,
} from '../repositories/clientRepository.js';

export async function getClientEvaluations(
    clientId,
) {
    const client =
        await findClientById(clientId);

    if (!client) {
        const error =
            new Error(
                'Cliente no encontrado.',
            );

        error.status = 404;

        throw error;
    }

    return evaluationRepository
        .getEvaluationsByClient(clientId);
}

export async function createClientEvaluation({
    clientId,
    userId,
    puntuacion,
    comentario,
}) {
    const client =
        await findClientById(clientId);

    if (!client) {
        const error =
            new Error(
                'Cliente no encontrado.',
            );

        error.status = 404;

        throw error;
    }

    const score =
        Number(puntuacion);

    if (
        !Number.isInteger(score) ||
        score < 1 ||
        score > 5
    ) {
        const error =
            new Error(
                'La puntuación debe ser un número entre 1 y 5.',
            );

        error.status = 400;

        throw error;
    }

    if (
        comentario &&
        comentario.trim().length > 1000
    ) {
        const error =
            new Error(
                'El comentario no puede superar los 1000 caracteres.',
            );

        error.status = 400;

        throw error;
    }

    return evaluationRepository
        .createEvaluation({
            clientId,
            userId,
            puntuacion: score,
            comentario:
                comentario?.trim() || null,
        });
}