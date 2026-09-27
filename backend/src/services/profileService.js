import * as repository
    from '../repositories/profileRepository.js';

function createError(
    message,
    status = 400,
) {
    const error =
        new Error(message);

    error.status = status;

    return error;
}

export async function getProfile(
    usuarioId,
) {
    const profile =
        await repository
            .getProfileByUserId(
                usuarioId,
            );

    if (!profile) {
        throw createError(
            'Perfil no encontrado.',
            404,
        );
    }

    return profile;
}

export async function updateProfile(
    usuarioId,
    data,
) {
    const nombre =
        data.nombre?.trim();

    const correo =
        data.correo
            ?.trim()
            .toLowerCase();

    const telefono =
        data.telefono
            ?.trim() || '';

    if (!nombre) {
        throw createError(
            'El nombre es obligatorio.',
        );
    }

    if (!correo) {
        throw createError(
            'El correo es obligatorio.',
        );
    }

    if (nombre.length > 150) {
        throw createError(
            'El nombre es demasiado largo.',
        );
    }

    if (correo.length > 180) {
        throw createError(
            'El correo es demasiado largo.',
        );
    }

    if (telefono.length > 40) {
        throw createError(
            'El teléfono es demasiado largo.',
        );
    }

    const duplicated =
        await repository
            .emailExistsForOtherUser(
                correo,
                usuarioId,
            );

    if (duplicated) {
        throw createError(
            'Ese correo ya está registrado.',
            409,
        );
    }

    return repository
        .updateProfile({
            usuarioId,
            nombre,
            correo,
            telefono,
        });
}