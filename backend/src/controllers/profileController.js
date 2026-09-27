import * as service
    from '../services/profileService.js';

export async function show(
    req,
    res,
) {
    const profile =
        await service.getProfile(
            req.user.id,
        );

    res.json(profile);
}

export async function update(
    req,
    res,
) {
    const profile =
        await service.updateProfile(
            req.user.id,
            req.body,
        );

    res.json(profile);
}