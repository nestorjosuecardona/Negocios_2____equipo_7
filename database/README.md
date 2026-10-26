# Base de datos Negocios 2

## Instalación nueva

Ejecuta los scripts en este orden desde SQL Server Management Studio:

1. `create_database.sql`
2. `schema.sql`
3. `migrations/2026_10_24_erp.sql`

## Base de datos existente

Ejecuta únicamente `migrations/2026_10_24_erp.sql` sobre la base `Negocios2`. La migración agrega los roles de Ventas y Logística, el módulo de órdenes ERP, el nivel de implementación y las tablas que utiliza el flujo de carrito existente. Puede ejecutarse más de una vez.

Las órdenes ERP se guardan en `ordenes_erp` y `ordenes_erp_detalles`; su historial de creación, procesamiento y cancelación queda en `procesos_erp`. Las reposiciones de proveedores continúan en `pedidos`; las compras del carrito continúan en `ventas` y `venta_detalles`. Los reportes ERP se calculan con las tablas actuales para conservar una sola fuente de datos.
