import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '../src/config/db.js';
import { processOrder, updateOrderStatus } from '../src/services/erpService.js';

const requiredVariables = [
    'SEED_SUPER_ADMIN_EMAIL',
    'SEED_SUPER_ADMIN_PASSWORD',
    'SEED_ADMIN_EMAIL',
    'SEED_ADMIN_PASSWORD',
    'SEED_CLIENTE_EMAIL',
    'SEED_CLIENTE_PASSWORD'
];

for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        console.error(`Falta la variable ${variable} en el archivo .env`);
        process.exit(1);
    }
}

const usuarios = [
    {
        nombre: 'Administrador General',
        correo: process.env.SEED_SUPER_ADMIN_EMAIL,
        password: process.env.SEED_SUPER_ADMIN_PASSWORD,
        rol: 'SUPER_ADMIN'
    },
    {
        nombre: 'Administrador',
        correo: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
        rol: 'ADMIN'
    },
    {
        nombre: 'Cliente Demo',
        correo: process.env.SEED_CLIENTE_EMAIL,
        password: process.env.SEED_CLIENTE_PASSWORD,
        rol: 'CLIENTE'
    }
];

async function obtenerRol(pool, nombreRol) {
    const resultado = await pool
        .request()
        .input('nombreRol', sql.NVarChar(30), nombreRol)
        .query(`
            SELECT id_rol
            FROM dbo.roles
            WHERE nombre = @nombreRol
        `);

    if (resultado.recordset.length === 0) {
        throw new Error(`No existe el rol ${nombreRol}`);
    }

    return resultado.recordset[0].id_rol;
}

async function guardarUsuario(pool, usuario) {
    const idRol = await obtenerRol(pool, usuario.rol);

    const passwordHash = await bcrypt.hash(
        usuario.password,
        12
    );

    const existente = await pool
        .request()
        .input(
            'correo',
            sql.NVarChar(180),
            usuario.correo
        )
        .query(`
            SELECT id_usuario
            FROM dbo.usuarios
            WHERE correo = @correo
        `);

    if (existente.recordset.length > 0) {
        await pool
            .request()
            .input(
                'idUsuario',
                sql.Int,
                existente.recordset[0].id_usuario
            )
            .input(
                'nombre',
                sql.NVarChar(120),
                usuario.nombre
            )
            .input(
                'passwordHash',
                sql.NVarChar(255),
                passwordHash
            )
            .input(
                'idRol',
                sql.TinyInt,
                idRol
            )
            .query(`
                UPDATE dbo.usuarios
                SET
                    nombre = @nombre,
                    password_hash = @passwordHash,
                    id_rol = @idRol,
                    estado = N'activo'
                WHERE id_usuario = @idUsuario
            `);

        console.log(
            `${usuario.rol}: usuario actualizado`
        );

        return;
    }

    await pool
        .request()
        .input(
            'nombre',
            sql.NVarChar(120),
            usuario.nombre
        )
        .input(
            'correo',
            sql.NVarChar(180),
            usuario.correo
        )
        .input(
            'passwordHash',
            sql.NVarChar(255),
            passwordHash
        )
        .input(
            'idRol',
            sql.TinyInt,
            idRol
        )
        .query(`
            INSERT INTO dbo.usuarios (
                nombre,
                correo,
                password_hash,
                id_rol,
                estado
            )
            VALUES (
                @nombre,
                @correo,
                @passwordHash,
                @idRol,
                N'activo'
            )
        `);

    console.log(
        `${usuario.rol}: usuario creado`
    );
}

async function obtenerUsuario(pool, correo) {
    const resultado = await pool.request()
        .input('correo', sql.NVarChar(180), correo)
        .query(`SELECT id_usuario FROM dbo.usuarios WHERE correo = @correo`);
    return resultado.recordset[0]?.id_usuario;
}

async function verificarMigracionErp(pool) {
    const resultado = await pool.request().query(`
        SELECT CASE WHEN OBJECT_ID(N'dbo.ordenes_erp', N'U') IS NOT NULL
                      AND OBJECT_ID(N'dbo.procesos_erp', N'U') IS NOT NULL
                    THEN 1 ELSE 0 END AS disponible;
    `);
    if (!resultado.recordset[0]?.disponible) {
        throw new Error('Falta aplicar database/migrations/2026_10_24_erp.sql antes de cargar los datos de demostración.');
    }
}

async function guardarDatosDemo(pool, adminId, clienteUsuarioId) {
    // Vincula el usuario Cliente Demo con CRM y agrega clientes de muestra.
    await pool.request()
        .input('usuarioId', sql.Int, clienteUsuarioId)
        .input('nombre', sql.NVarChar(150), 'Cliente Demo')
        .input('correo', sql.NVarChar(180), process.env.SEED_CLIENTE_EMAIL)
        .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.clientes WHERE usuario_id = @usuarioId)
                INSERT INTO dbo.clientes (usuario_id, nombre, correo, empresa, etapa_crm, notas)
                VALUES (@usuarioId, @nombre, @correo, N'Cliente particular', N'Activo', N'Cuenta vinculada al usuario de demostración.');
        `);

    const clientes = [
        ['Taller Rápido del Centro', 'taller.centro.demo@ejemplo.com', 'Taller Rápido', 'Frecuente'],
        ['Auto Servicio Rivera', 'rivera.demo@ejemplo.com', 'Auto Servicio Rivera', 'Activo'],
        ['Mariana López', 'mariana.lopez.demo@ejemplo.com', 'Cliente particular', 'Prospecto'],
    ];
    for (const [nombre, correo, empresa, etapa] of clientes) {
        await pool.request()
            .input('nombre', sql.NVarChar(150), nombre)
            .input('correo', sql.NVarChar(180), correo)
            .input('empresa', sql.NVarChar(150), empresa)
            .input('etapa', sql.NVarChar(30), etapa)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.clientes WHERE correo = @correo)
                    INSERT INTO dbo.clientes (nombre, correo, empresa, etapa_crm, notas)
                    VALUES (@nombre, @correo, @empresa, @etapa, N'Registro de demostración para CRM y ERP.');
            `);
    }

    await pool.request().query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.categorias WHERE nombre = N'Accesorios automotrices')
            INSERT INTO dbo.categorias (nombre, descripcion)
            VALUES (N'Accesorios automotrices', N'Productos de muestra para catálogo, inventario y órdenes ERP.');
    `);
    await pool.request().query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.proveedores WHERE correo = N'demo@autopartes-ejemplo.com')
            INSERT INTO dbo.proveedores (nombre, contacto, correo, telefono, direccion)
            VALUES (N'Autopartes del Centro (Demo)', N'Equipo de ventas', N'demo@autopartes-ejemplo.com', N'5550001122', N'Ciudad de México');
    `);

    const productos = [
        ['DEMO-AUTO-001', 'Foco LED H7', 'Par de focos LED de muestra.', 125, 249, 24, 5],
        ['DEMO-AUTO-002', 'Cámara de reversa', 'Cámara universal para automóvil.', 280, 499, 12, 3],
        ['DEMO-AUTO-003', 'Tapetes universales', 'Juego de tapetes para automóvil.', 190, 349, 18, 4],
        ['DEMO-AUTO-004', 'Cargador USB para auto', 'Cargador dual para toma de 12 V.', 65, 129, 30, 8],
    ];
    for (const [sku, nombre, descripcion, costo, precio, stock, minimo] of productos) {
        await pool.request()
            .input('sku', sql.NVarChar(80), sku)
            .input('nombre', sql.NVarChar(180), nombre)
            .input('descripcion', sql.NVarChar(1000), descripcion)
            .input('costo', sql.Decimal(12, 2), costo)
            .input('precio', sql.Decimal(12, 2), precio)
            .input('stock', sql.Int, stock)
            .input('minimo', sql.Int, minimo)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.productos WHERE sku = @sku)
                BEGIN
                    DECLARE @categoriaId INT = (SELECT id_categoria FROM dbo.categorias WHERE nombre = N'Accesorios automotrices');
                    DECLARE @proveedorId INT = (SELECT id_proveedor FROM dbo.proveedores WHERE correo = N'demo@autopartes-ejemplo.com');
                    INSERT INTO dbo.productos (sku, nombre, descripcion, id_categoria, marca, proveedor_id, costo_unitario, precio_venta, stock_actual, stock_minimo, estrategia_logistica)
                    VALUES (@sku, @nombre, @descripcion, @categoriaId, N'Demo', @proveedorId, @costo, @precio, @stock, @minimo, N'PULL');
                END;
            `);
    }

    // Crea una orden pendiente identificable para que el seed sea repetible.
    const ordenMarker = 'Datos de demostración: orden ERP inicial.';
    const orderExists = await pool.request()
        .input('marker', sql.NVarChar(500), ordenMarker)
        .query(`SELECT TOP 1 orden_id FROM dbo.procesos_erp WHERE tipo = N'creacion' AND descripcion = @marker`);
    if (orderExists.recordset.length === 0) {
        const cliente = await pool.request()
            .input('correo', sql.NVarChar(180), 'taller.centro.demo@ejemplo.com')
            .query(`SELECT id_cliente FROM dbo.clientes WHERE correo = @correo`);
        const catalogo = await pool.request().query(`
            SELECT id_producto, sku, precio_venta FROM dbo.productos
            WHERE sku IN (N'DEMO-AUTO-001', N'DEMO-AUTO-004');
        `);
        const foco = catalogo.recordset.find(producto => producto.sku === 'DEMO-AUTO-001');
        const cargador = catalogo.recordset.find(producto => producto.sku === 'DEMO-AUTO-004');
        if (!cliente.recordset[0] || !foco || !cargador) throw new Error('No se pudieron recuperar los datos para la orden de demostración.');

        const total = Number(foco.precio_venta) * 2 + Number(cargador.precio_venta);
        const orden = await pool.request()
            .input('clienteId', sql.Int, cliente.recordset[0].id_cliente)
            .input('usuarioId', sql.Int, adminId)
            .input('total', sql.Decimal(12, 2), total)
            .query(`
                INSERT INTO dbo.ordenes_erp (cliente_id, usuario_id, estado, total)
                OUTPUT INSERTED.id_orden
                VALUES (@clienteId, @usuarioId, N'pendiente', @total);
            `);
        const ordenId = orden.recordset[0].id_orden;
        for (const [producto, cantidad] of [[foco, 2], [cargador, 1]]) {
            await pool.request()
                .input('ordenId', sql.Int, ordenId)
                .input('productoId', sql.Int, producto.id_producto)
                .input('cantidad', sql.Int, cantidad)
                .input('precio', sql.Decimal(12, 2), producto.precio_venta)
                .input('subtotal', sql.Decimal(12, 2), Number(producto.precio_venta) * cantidad)
                .query(`
                    INSERT INTO dbo.ordenes_erp_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal)
                    VALUES (@ordenId, @productoId, @cantidad, @precio, @subtotal);
                `);
        }
        await pool.request()
            .input('ordenId', sql.Int, ordenId)
            .input('usuarioId', sql.Int, adminId)
            .input('marker', sql.NVarChar(500), ordenMarker)
            .query(`
                INSERT INTO dbo.procesos_erp (orden_id, usuario_id, tipo, descripcion)
                VALUES (@ordenId, @usuarioId, N'creacion', @marker);
            `);
    }

    const processedMarker = 'Datos de demostración: orden ERP procesada.';
    const processedExists = await pool.request()
        .input('marker', sql.NVarChar(500), processedMarker)
        .query(`SELECT TOP 1 orden_id FROM dbo.procesos_erp WHERE tipo = N'creacion' AND descripcion = @marker`);
    if (processedExists.recordset.length === 0) {
        const cliente = await pool.request()
            .input('correo', sql.NVarChar(180), 'rivera.demo@ejemplo.com')
            .query(`SELECT id_cliente FROM dbo.clientes WHERE correo = @correo`);
        const producto = await pool.request()
            .input('sku', sql.NVarChar(80), 'DEMO-AUTO-002')
            .query(`SELECT id_producto, precio_venta FROM dbo.productos WHERE sku = @sku`);
        if (!cliente.recordset[0] || !producto.recordset[0]) throw new Error('No se pudieron recuperar los datos para la orden procesada de demostración.');

        const precio = Number(producto.recordset[0].precio_venta);
        const orden = await pool.request()
            .input('clienteId', sql.Int, cliente.recordset[0].id_cliente)
            .input('usuarioId', sql.Int, adminId)
            .input('total', sql.Decimal(12, 2), precio)
            .query(`
                INSERT INTO dbo.ordenes_erp (cliente_id, usuario_id, estado, total)
                OUTPUT INSERTED.id_orden
                VALUES (@clienteId, @usuarioId, N'pendiente', @total);
            `);
        const ordenId = orden.recordset[0].id_orden;
        await pool.request()
            .input('ordenId', sql.Int, ordenId)
            .input('productoId', sql.Int, producto.recordset[0].id_producto)
            .input('precio', sql.Decimal(12, 2), precio)
            .query(`
                INSERT INTO dbo.ordenes_erp_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (@ordenId, @productoId, 1, @precio, @precio);
            `);
        await pool.request()
            .input('ordenId', sql.Int, ordenId)
            .input('usuarioId', sql.Int, adminId)
            .input('marker', sql.NVarChar(500), processedMarker)
            .query(`
                INSERT INTO dbo.procesos_erp (orden_id, usuario_id, tipo, descripcion)
                VALUES (@ordenId, @usuarioId, N'creacion', @marker);
            `);
        await processOrder(ordenId, adminId);
    }
}

async function guardarLoteAmplioDemo(pool, adminId) {
    const categorias = [
        ['Iluminación automotriz', 'Faros, focos y luces para vehículos.'],
        ['Audio y electrónica', 'Audio, cargadores y electrónica automotriz.'],
        ['Interior y comodidad', 'Accesorios para el interior del vehículo.'],
        ['Seguridad y exterior', 'Accesorios de seguridad y protección exterior.'],
    ];
    for (const [nombre, descripcion] of categorias) {
        await pool.request()
            .input('nombre', sql.NVarChar(120), nombre)
            .input('descripcion', sql.NVarChar(500), descripcion)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.categorias WHERE nombre = @nombre)
                    INSERT INTO dbo.categorias (nombre, descripcion) VALUES (@nombre, @descripcion);
            `);
    }

    const nombres = ['Distribuidora del Valle', 'Autopartes La Ruta', 'Suministros del Bajío', 'Refacciones del Norte', 'Comercializadora Oriente', 'Accesorios Vía Motor', 'Partes y Más', 'Grupo Automotriz Central', 'Importadora Camino Real', 'Soluciones Vehiculares'];
    const proveedores = [];
    for (let i = 1; i <= 20; i += 1) {
        const correo = `proveedor.erp.${String(i).padStart(3, '0')}@demo.negocios2.test`;
        const nombre = `${nombres[(i - 1) % nombres.length]} ${String(i).padStart(2, '0')}`;
        await pool.request()
            .input('correo', sql.NVarChar(180), correo)
            .input('nombre', sql.NVarChar(150), nombre)
            .input('telefono', sql.NVarChar(40), `555${String(1000000 + i).slice(-7)}`)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.proveedores WHERE correo = @correo)
                    INSERT INTO dbo.proveedores (nombre, contacto, correo, telefono, direccion)
                    VALUES (@nombre, N'Contacto de demostración', @correo, @telefono, N'Ciudad de México');
            `);
        proveedores.push(correo);
    }

    const nombresCliente = ['Abarrotes', 'Taller', 'Servicio', 'Refaccionaria', 'Transportes', 'Flotilla', 'Comercial', 'Mecánica', 'Autos', 'Soluciones'];
    const clientes = [];
    for (let i = 1; i <= 100; i += 1) {
        const correo = `cliente.erp.${String(i).padStart(3, '0')}@demo.negocios2.test`;
        const nombre = `${nombresCliente[(i - 1) % nombresCliente.length]} ${['López', 'García', 'Hernández', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'][(i * 3) % 10]} ${String(i).padStart(3, '0')}`;
        const empresa = `Empresa Demo ${String(i).padStart(3, '0')}`;
        const etapa = ['Prospecto', 'Activo', 'Frecuente'][(i - 1) % 3];
        await pool.request()
            .input('correo', sql.NVarChar(180), correo)
            .input('nombre', sql.NVarChar(150), nombre)
            .input('empresa', sql.NVarChar(150), empresa)
            .input('telefono', sql.NVarChar(40), `555${String(2000000 + i).slice(-7)}`)
            .input('etapa', sql.NVarChar(30), etapa)
            .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.clientes WHERE correo = @correo)
                    INSERT INTO dbo.clientes (nombre, correo, empresa, telefono, etapa_crm, notas)
                    VALUES (@nombre, @correo, @empresa, @telefono, @etapa, N'Cliente de demostración para el lote ampliado de Unidad 3.');
            `);
        clientes.push(correo);
    }

    const productosBase = [
        'Foco LED H4', 'Foco LED H7', 'Faros de niebla', 'Tira LED interior', 'Lámpara de cortesía',
        'Bocina coaxial', 'Cargador USB dual', 'Estéreo Bluetooth', 'Cámara de reversa', 'Sensor de estacionamiento',
        'Tapetes universales', 'Cubreasientos', 'Organizador de cajuela', 'Soporte para teléfono', 'Volante deportivo',
        'Alarma vehicular', 'Cámara de tablero', 'Birlos de seguridad', 'Cubierta para auto', 'Plumillas limpiaparabrisas',
    ];
    const marcas = ['MotorPlus', 'RutaMax', 'AutoNova', 'VíaMotor', 'DrivePro'];
    const categoriasNombre = categorias.map(categoria => categoria[0]);
    const proveedoresPorId = await pool.request().query(`
        SELECT id_proveedor, correo FROM dbo.proveedores
        WHERE correo LIKE N'proveedor.erp.%@demo.negocios2.test';
    `);
    const categoriasPorId = await pool.request().query(`
        SELECT id_categoria, nombre FROM dbo.categorias
        WHERE nombre IN (N'Iluminación automotriz', N'Audio y electrónica', N'Interior y comodidad', N'Seguridad y exterior');
    `);
    const proveedorId = new Map(proveedoresPorId.recordset.map(row => [row.correo, row.id_proveedor]));
    const categoriaId = new Map(categoriasPorId.recordset.map(row => [row.nombre, row.id_categoria]));

    for (let i = 1; i <= 80; i += 1) {
        const sku = `LOTE-AUTO-${String(i).padStart(4, '0')}`;
        const nombre = `${productosBase[(i - 1) % productosBase.length]} ${String(Math.ceil(i / productosBase.length)).padStart(2, '0')}`;
        const costo = 55 + ((i * 37) % 500);
        const precio = costo + 45 + ((i * 23) % 280);
        const stock = 45 + (i % 35);
        const nombreCategoria = categoriasNombre[(i - 1) % categoriasNombre.length];
        const correoProveedor = proveedores[(i - 1) % proveedores.length];
        await pool.request()
            .input('sku', sql.NVarChar(80), sku)
            .input('nombre', sql.NVarChar(180), nombre)
            .input('descripcion', sql.NVarChar(1000), `Artículo de catálogo de demostración ${sku}.`)
            .input('categoriaId', sql.Int, categoriaId.get(nombreCategoria))
            .input('proveedorId', sql.Int, proveedorId.get(correoProveedor))
            .input('marca', sql.NVarChar(120), marcas[(i - 1) % marcas.length])
            .input('costo', sql.Decimal(12, 2), costo)
            .input('precio', sql.Decimal(12, 2), precio)
            .input('stock', sql.Int, stock)
            .input('minimo', sql.Int, 8 + (i % 10))
            .query(`
                IF NOT EXISTS (SELECT 1 FROM dbo.productos WHERE sku = @sku)
                    INSERT INTO dbo.productos (sku, nombre, descripcion, id_categoria, marca, proveedor_id, costo_unitario, precio_venta, stock_actual, stock_minimo, estrategia_logistica)
                    VALUES (@sku, @nombre, @descripcion, @categoriaId, @marca, @proveedorId, @costo, @precio, @stock, @minimo, CASE WHEN @sku LIKE N'%[02468]' THEN N'PULL' ELSE N'PUSH' END);
            `);
    }

    const clienteResult = await pool.request().query(`
        SELECT id_cliente, correo FROM dbo.clientes WHERE correo LIKE N'cliente.erp.%@demo.negocios2.test';
    `);
    const productoResult = await pool.request().query(`
        SELECT id_producto, sku, precio_venta FROM dbo.productos WHERE sku LIKE N'LOTE-AUTO-%';
    `);
    const clienteIds = new Map(clienteResult.recordset.map(row => [row.correo, row.id_cliente]));
    const productosPorSku = new Map(productoResult.recordset.map(row => [row.sku, row]));
    const markerPrefix = 'Datos de demostración: lote ERP 2026-10 orden ';
    const markersResult = await pool.request()
        .input('marker', sql.NVarChar(500), `${markerPrefix}%`)
        .query(`SELECT descripcion FROM dbo.procesos_erp WHERE tipo = N'creacion' AND descripcion LIKE @marker`);
    const markers = new Set(markersResult.recordset.map(row => row.descripcion));
    const now = new Date();

    for (let i = 1; i <= 120; i += 1) {
        const folio = String(i).padStart(3, '0');
        const marker = `${markerPrefix}${folio}.`;
        if (markers.has(marker)) continue;

        const clienteCorreo = clientes[((i * 17) - 1) % clientes.length];
        const productoA = productosPorSku.get(`LOTE-AUTO-${String(((i * 7 - 1) % 80) + 1).padStart(4, '0')}`);
        const productoB = productosPorSku.get(`LOTE-AUTO-${String(((i * 7 + 12) % 80) + 1).padStart(4, '0')}`);
        const lineas = [{ producto: productoA, cantidad: 1 + (i % 2) }];
        if (i % 3 === 0 && productoB) lineas.push({ producto: productoB, cantidad: 1 });
        const total = lineas.reduce((suma, linea) => suma + Number(linea.producto.precio_venta) * linea.cantidad, 0);
        const fecha = new Date(now.getTime() - ((i * 3) % 180) * 24 * 60 * 60 * 1000);
        const ordenResult = await pool.request()
            .input('clienteId', sql.Int, clienteIds.get(clienteCorreo))
            .input('usuarioId', sql.Int, adminId)
            .input('total', sql.Decimal(12, 2), total)
            .input('fecha', sql.DateTime2, fecha)
            .query(`
                INSERT INTO dbo.ordenes_erp (cliente_id, usuario_id, fecha, estado, total)
                OUTPUT INSERTED.id_orden
                VALUES (@clienteId, @usuarioId, @fecha, N'pendiente', @total);
            `);
        const ordenId = ordenResult.recordset[0].id_orden;
        for (const linea of lineas) {
            await pool.request()
                .input('ordenId', sql.Int, ordenId)
                .input('productoId', sql.Int, linea.producto.id_producto)
                .input('cantidad', sql.Int, linea.cantidad)
                .input('precio', sql.Decimal(12, 2), linea.producto.precio_venta)
                .input('subtotal', sql.Decimal(12, 2), Number(linea.producto.precio_venta) * linea.cantidad)
                .query(`
                    INSERT INTO dbo.ordenes_erp_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal)
                    VALUES (@ordenId, @productoId, @cantidad, @precio, @subtotal);
                `);
        }
        await pool.request()
            .input('ordenId', sql.Int, ordenId)
            .input('usuarioId', sql.Int, adminId)
            .input('marker', sql.NVarChar(500), marker)
            .input('fecha', sql.DateTime2, fecha)
            .query(`
                INSERT INTO dbo.procesos_erp (orden_id, usuario_id, tipo, descripcion, fecha)
                VALUES (@ordenId, @usuarioId, N'creacion', @marker, @fecha);
            `);

        if (i % 10 === 0) {
            await updateOrderStatus(ordenId, 'cancelada', adminId);
        } else if (i % 10 !== 1) {
            await processOrder(ordenId, adminId);
            const fechaProcesada = new Date(fecha.getTime() + 60 * 60 * 1000);
            await pool.request()
                .input('ordenId', sql.Int, ordenId)
                .input('fechaProcesada', sql.DateTime2, fechaProcesada)
                .input('fechaProceso', sql.DateTime2, fechaProcesada)
                .query(`
                    UPDATE dbo.ordenes_erp SET fecha_procesada = @fechaProcesada WHERE id_orden = @ordenId;
                    UPDATE dbo.procesos_erp SET fecha = @fechaProceso WHERE orden_id = @ordenId AND tipo = N'procesamiento';
                `);
        }
    }
}

async function ejecutarSeed() {
    let pool;

    try {
        pool = await getPool();

        await verificarMigracionErp(pool);

        for (const usuario of usuarios) {
            await guardarUsuario(
                pool,
                usuario
            );
        }

        await guardarDatosDemo(
            pool,
            await obtenerUsuario(pool, process.env.SEED_ADMIN_EMAIL),
            await obtenerUsuario(pool, process.env.SEED_CLIENTE_EMAIL)
        );
        await guardarLoteAmplioDemo(
            pool,
            await obtenerUsuario(pool, process.env.SEED_ADMIN_EMAIL)
        );

        console.log(
            '\nUsuarios y datos de demostración cargados correctamente'
        );

    } catch (error) {
        console.error(
            '\nError al crear usuarios iniciales:'
        );

        console.error(error);

        process.exitCode = 1;

    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

ejecutarSeed();
