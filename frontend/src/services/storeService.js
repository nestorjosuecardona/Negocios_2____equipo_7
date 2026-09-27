import api from './api.js';

export const getPublicProducts = (
    params = {},
) =>
    api
        .get(
            '/public/productos',
            {
                params,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const getPublicCategories = () =>
    api
        .get(
            '/public/categorias',
        )
        .then(
            (response) =>
                response.data,
        );

export const getPublicProduct = (
    id,
) =>
    api
        .get(
            `/public/productos/${id}`,
        )
        .then(
            (response) =>
                response.data,
        );