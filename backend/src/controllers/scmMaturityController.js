import * as service
    from '../services/scmMaturityService.js';

export async function show(
    req,
    res,
) {
    const state =
        await service
            .getState();

    res.json(state);
}

export async function update(
    req,
    res,
) {
    const state =
        await service
            .updateLevel({
                nivel:
                    req.body.nivel_scm,

                usuarioId:
                    req.user.id,
            });

    res.json(state);
}