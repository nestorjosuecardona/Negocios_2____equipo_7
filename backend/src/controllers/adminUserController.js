import * as service
    from '../services/adminUserService.js';

export async function index(
    req,
    res,
) {
    const users =
        await service.listUsers();

    res.json(
        users,
    );
}

export async function storeAdmin(
    req,
    res,
) {
    const user =
        await service.createAdmin(
            req.body,
        );

    res
        .status(201)
        .json(user);
}

export async function update(
    req,
    res,
) {
    const user =
        await service.editUser(
            Number(
                req.params.id,
            ),
            req.body,
        );

    res.json(
        user,
    );
}

export async function updateStatus(
    req,
    res,
) {
    const user =
        await service.changeUserStatus(
            Number(
                req.params.id,
            ),
            req.body.estado,
        );

    res.json(
        user,
    );
}