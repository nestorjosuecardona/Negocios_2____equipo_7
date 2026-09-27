import bcrypt from 'bcryptjs';

import {
    createUser,
    findUserByEmail,
    findUserById,
    getAllUsers,
    updateUserData,
    updateUserStatus,
} from '../repositories/userRepository.js';

const validStates = [
    'activo',
    'inactivo',
    'bloqueado',
];

function normalizeEmail(value) {
    return value
        ?.trim()
        .toLowerCase();
}

function validateName(nombre) {
    if (
        !nombre ||
        nombre.trim().length < 2
    ) {
        const error =
            new Error(
                'El nombre no es válido.',
            );

        error.status = 400;

        throw error;
    }
}

function validateEmail(correo) {
    if (
        !correo ||
        !correo.includes('@') ||
        !correo.includes('.')
    ) {
        const error =
            new Error(
                'El correo no es válido.',
            );

        error.status = 400;

        throw error;
    }
}

export async function listUsers() {
    return getAllUsers();
}

export async function createAdmin({
    nombre,
    correo,
    password,
}) {
    const normalizedName =
        nombre?.trim();

    const normalizedEmail =
        normalizeEmail(correo);

    validateName(
        normalizedName,
    );

    validateEmail(
        normalizedEmail,
    );

    if (
        !password ||
        password.length < 8
    ) {
        const error =
            new Error(
                'La contraseña debe tener al menos 8 caracteres.',
            );

        error.status = 400;

        throw error;
    }

    const existing =
        await findUserByEmail(
            normalizedEmail,
        );

    if (existing) {
        const error =
            new Error(
                'El correo ya está registrado.',
            );

        error.status = 409;

        throw error;
    }

    const passwordHash =
        await bcrypt.hash(
            password,
            12,
        );

    return createUser({
        nombre:
            normalizedName,
        correo:
            normalizedEmail,
        passwordHash,
        rol: 'ADMIN',
    });
}

export async function editUser(
    id,
    {
        nombre,
        correo,
    },
) {
    const user =
        await findUserById(
            id,
        );

    if (!user) {
        const error =
            new Error(
                'Usuario no encontrado.',
            );

        error.status = 404;

        throw error;
    }

    if (
        user.rol ===
        'SUPER_ADMIN'
    ) {
        const error =
            new Error(
                'La cuenta del Administrador General no se puede modificar desde este módulo.',
            );

        error.status = 403;

        throw error;
    }

    const normalizedName =
        nombre?.trim();

    const normalizedEmail =
        normalizeEmail(correo);

    validateName(
        normalizedName,
    );

    validateEmail(
        normalizedEmail,
    );

    const existing =
        await findUserByEmail(
            normalizedEmail,
        );

    if (
        existing &&
        existing.id_usuario !==
        id
    ) {
        const error =
            new Error(
                'El correo ya está registrado.',
            );

        error.status = 409;

        throw error;
    }

    const updated =
        await updateUserData(
            id,
            {
                nombre:
                    normalizedName,
                correo:
                    normalizedEmail,
            },
        );

    if (!updated) {
        const error =
            new Error(
                'Usuario no encontrado.',
            );

        error.status = 404;

        throw error;
    }

    return updated;
}

export async function changeUserStatus(
    id,
    estado,
) {
    if (
        !validStates.includes(
            estado,
        )
    ) {
        const error =
            new Error(
                'Estado de usuario no válido.',
            );

        error.status = 400;

        throw error;
    }

    const user =
        await findUserById(
            id,
        );

    if (!user) {
        const error =
            new Error(
                'Usuario no encontrado.',
            );

        error.status = 404;

        throw error;
    }

    if (
        user.rol ===
        'SUPER_ADMIN'
    ) {
        const error =
            new Error(
                'La cuenta del Administrador General no puede bloquearse o desactivarse.',
            );

        error.status = 403;

        throw error;
    }

    const updated =
        await updateUserStatus(
            id,
            estado,
        );

    if (!updated) {
        const error =
            new Error(
                'Usuario no encontrado.',
            );

        error.status = 404;

        throw error;
    }

    return updated;
}