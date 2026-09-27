import * as authService
    from '../services/authService.js';


export async function login(req, res) {
    const result =
        await authService.login(
            req.body.correo,
            req.body.password
        );

    res.json(result);
}


export async function register(req, res) {
    const result =
        await authService.registerClient(
            req.body
        );

    res
        .status(201)
        .json(result);
}


export async function me(req, res) {
    res.json({
        user: req.user
    });
}