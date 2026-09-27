import api from './api';

export const getScmResumen = () =>
    api
        .get('/scm/resumen')
        .then(
            (response) =>
                response.data,
        );

export const getProveedores = (
    params = {},
) =>
    api
        .get(
            '/scm/proveedores',
            {
                params,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const getProveedor = (
    id,
) =>
    api
        .get(
            `/scm/proveedores/${id}`,
        )
        .then(
            (response) =>
                response.data,
        );

export const crearProveedor = (
    data,
) =>
    api
        .post(
            '/scm/proveedores',
            data,
        )
        .then(
            (response) =>
                response.data,
        );

export const actualizarProveedor = (
    id,
    data,
) =>
    api
        .put(
            `/scm/proveedores/${id}`,
            data,
        )
        .then(
            (response) =>
                response.data,
        );

export const cambiarEstadoProveedor = (
    id,
    estado,
) =>
    api
        .patch(
            `/scm/proveedores/${id}/estado`,
            {
                estado,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const getCategorias = () =>
    api
        .get('/scm/categorias')
        .then(
            (response) =>
                response.data,
        );

export const getProductos = (
    params = {},
) =>
    api
        .get(
            '/scm/productos',
            {
                params,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const getProducto = (
    id,
) =>
    api
        .get(
            `/scm/productos/${id}`,
        )
        .then(
            (response) =>
                response.data,
        );

export const crearProducto = (
    data,
) =>
    api
        .post(
            '/scm/productos',
            data,
        )
        .then(
            (response) =>
                response.data,
        );

export const actualizarProducto = (
    id,
    data,
) =>
    api
        .put(
            `/scm/productos/${id}`,
            data,
        )
        .then(
            (response) =>
                response.data,
        );

export const cambiarEstadoProducto = (
    id,
    estado,
) =>
    api
        .patch(
            `/scm/productos/${id}/estado`,
            {
                estado,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const cambiarEstrategiaProducto = (
    id,
    estrategiaLogistica,
) =>
    api
        .put(
            `/scm/productos/${id}/estrategia`,
            {
                estrategia_logistica:
                    estrategiaLogistica,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const getInventario = (
    params = {},
) =>
    api
        .get(
            '/scm/inventario',
            {
                params,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const getMovimientosInventario = (
    params = {},
) =>
    api
        .get(
            '/scm/inventario/movimientos',
            {
                params,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const getMovimientosProducto = (
    id,
) =>
    api
        .get(
            `/scm/productos/${id}/movimientos`,
        )
        .then(
            (response) =>
                response.data,
        );

export const crearMovimientoInventario = (
    data,
) =>
    api
        .post(
            '/scm/inventario/movimientos',
            data,
        )
        .then(
            (response) =>
                response.data,
        );

export const getOrdenes = (
    params = {},
) =>
    api
        .get(
            '/scm/ordenes',
            {
                params,
            },
        )
        .then(
            (response) =>
                response.data,
        );

export const crearOrdenReposicion = (
    data,
) =>
    api
        .post(
            '/scm/ordenes',
            data,
        )
        .then(
            (response) =>
                response.data,
        );

export const surtirOrden = (
    id,
) =>
    api
        .patch(
            `/scm/ordenes/${id}/surtir`,
        )
        .then(
            (response) =>
                response.data,
    );

export const getScmEstado = () =>
    api
        .get('/scm/estado')
        .then(
            (response) =>
                response.data,
        );

export const actualizarNivelScm = (
    nivelScm,
) =>
    api
        .put(
            '/scm/nivel',
            {
                nivel_scm:
                    nivelScm,
            },
        )
        .then(
            (response) =>
                response.data,
    );

export const getScmReportes = () =>
    api
        .get('/scm/reportes')
        .then(
            (response) =>
                response.data,
    );
