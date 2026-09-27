import api from './api';

export const getEvaluacionesCliente = (clienteId) =>
    api
        .get(`/clientes/${clienteId}/evaluaciones`)
        .then((response) => response.data);

export const crearEvaluacionCliente = (
    clienteId,
    data,
) =>
    api
        .post(
            `/clientes/${clienteId}/evaluaciones`,
            data,
        )
        .then((response) => response.data);