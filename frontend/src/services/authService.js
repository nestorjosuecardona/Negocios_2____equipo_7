import api from './api';

export const loginRequest = (correo, password) =>
    api
        .post('/auth/login', {
            correo,
            password
        })
        .then(response => response.data);

export const registerRequest = (data) =>
    api
        .post('/auth/register', data)
        .then(response => response.data);

export const meRequest = () =>
    api
        .get('/auth/me')
        .then(response => response.data);