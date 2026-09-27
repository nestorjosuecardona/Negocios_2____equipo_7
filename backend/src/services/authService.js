import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
    findUserByEmail,
    updateLastAccess,
    createClientAccount
} from '../repositories/userRepository.js';


function createToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            'JWT_SECRET no está configurado.'
        );
    }

    return jwt.sign(
        user,
        process.env.JWT_SECRET,
        {
            expiresIn:
                process.env.JWT_EXPIRES_IN || '8h'
        }
    );
}


export async function login(correo, password) {
    if (!correo || !password) {
        const error = new Error(
            'Correo y contraseña son obligatorios.'
        );

        error.status = 400;
        throw error;
    }

    const normalizedEmail = correo
        .trim()
        .toLowerCase();

    const user = await findUserByEmail(
        normalizedEmail
    );

    if (!user) {
        const error = new Error(
            'Credenciales incorrectas.'
        );

        error.status = 401;
        throw error;
    }

    if (user.estado !== 'activo') {
        const error = new Error(
            'La cuenta no se encuentra activa.'
        );

        error.status = 403;
        throw error;
    }

    const passwordCorrecta =
        await bcrypt.compare(
            password,
            user.password_hash
        );

    if (!passwordCorrecta) {
        const error = new Error(
            'Credenciales incorrectas.'
        );

        error.status = 401;
        throw error;
    }

    const payload = {
        id: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
    };

    const token = createToken(payload);

    await updateLastAccess(
        user.id_usuario
    );

    return {
        token,
        user: payload
    };
}


export async function registerClient({
    nombre,
    correo,
    password,
    telefono
}) {
    if (!nombre || !correo || !password) {
        const error = new Error(
            'Nombre, correo y contraseña son obligatorios.'
        );

        error.status = 400;
        throw error;
    }

    const normalizedName =
        nombre.trim();

    const normalizedEmail = correo
        .trim()
        .toLowerCase();

    if (normalizedName.length < 2) {
        const error = new Error(
            'El nombre no es válido.'
        );

        error.status = 400;
        throw error;
    }

    if (
        !normalizedEmail.includes('@') ||
        !normalizedEmail.includes('.')
    ) {
        const error = new Error(
            'El correo no es válido.'
        );

        error.status = 400;
        throw error;
    }

    if (password.length < 8) {
        const error = new Error(
            'La contraseña debe tener al menos 8 caracteres.'
        );

        error.status = 400;
        throw error;
    }

    const existingUser =
        await findUserByEmail(
            normalizedEmail
        );

    if (existingUser) {
        const error = new Error(
            'El correo ya está registrado.'
        );

        error.status = 409;
        throw error;
    }

    const passwordHash =
        await bcrypt.hash(
            password,
            12
        );

    const account =
        await createClientAccount({
            nombre: normalizedName,
            correo: normalizedEmail,
            passwordHash,
            telefono:
                telefono?.trim() || null
        });

    const payload = {
        id: account.id_usuario,
        nombre: account.nombre,
        correo: account.correo,
        rol: 'CLIENTE'
    };

    const token = createToken(payload);

    return {
        message:
            'Cuenta creada correctamente.',

        token,

        user: payload,

        cliente: {
            id: account.id_cliente
        }
    };
}