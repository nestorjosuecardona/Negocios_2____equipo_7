import { getPool, sql } from '../config/db.js';

export async function getScmSummary() {
    const pool = await getPool();

    const result = await pool
        .request()
        .query(`
            SELECT
                COUNT(*) AS proveedores
            FROM dbo.proveedores
            WHERE estado = N'activo';

            SELECT
                COUNT(*) AS productos
            FROM dbo.productos
            WHERE estado = N'activo';

            SELECT
                ISNULL(
                    SUM(stock_actual),
                    0
                ) AS stock_total
            FROM dbo.productos
            WHERE estado = N'activo';

            SELECT
                COUNT(*) AS ordenes_pendientes
            FROM dbo.pedidos
            WHERE estado = N'pendiente';
        `);

    return {
        proveedores:
            result.recordsets[0][0]
                .proveedores,

        productos:
            result.recordsets[1][0]
                .productos,

        stock_total:
            result.recordsets[2][0]
                .stock_total,

        ordenes_pendientes:
            result.recordsets[3][0]
                .ordenes_pendientes,
    };
}

export async function listSuppliers() {
  const pool = await getPool();
  return (await pool.request().query('SELECT * FROM dbo.proveedores ORDER BY fecha_registro DESC')).recordset;
}

export async function createSupplier(data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('nombre', sql.NVarChar(150), data.nombre)
    .input('contacto', sql.NVarChar(150), data.contacto || null)
    .input('correo', sql.NVarChar(180), data.correo || null)
    .input('telefono', sql.NVarChar(40), data.telefono || null)
    .query(`INSERT INTO dbo.proveedores(nombre, contacto, correo, telefono)
            OUTPUT INSERTED.* VALUES(@nombre,@contacto,@correo,@telefono)`);
  return result.recordset[0];
}

export async function listProducts() {
  const pool = await getPool();
  return (await pool.request().query(`
    SELECT p.*, pr.nombre AS proveedor_nombre
    FROM dbo.productos p LEFT JOIN dbo.proveedores pr ON pr.id_proveedor=p.proveedor_id
    ORDER BY p.id_producto DESC
  `)).recordset;
}

export async function createProduct(data) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const request = new sql.Request(tx);
    const inserted = await request
      .input('nombre', sql.NVarChar(180), data.nombre)
      .input('sku', sql.NVarChar(80), data.sku)
      .input('descripcion', sql.NVarChar(800), data.descripcion || null)
      .input('precio', sql.Decimal(12,2), Number(data.precio || 0))
      .input('proveedorId', sql.Int, data.proveedor_id || null)
      .query(`INSERT INTO dbo.productos(nombre,sku,descripcion,precio,proveedor_id)
              OUTPUT INSERTED.* VALUES(@nombre,@sku,@descripcion,@precio,@proveedorId)`);
    const product = inserted.recordset[0];
    await new sql.Request(tx)
      .input('productoId', sql.Int, product.id_producto)
      .input('stock', sql.Int, Number(data.stock_actual || 0))
      .input('minimo', sql.Int, Number(data.stock_minimo || 0))
      .query(`INSERT INTO dbo.inventario(producto_id,stock_actual,stock_minimo)
              VALUES(@productoId,@stock,@minimo)`);
    await tx.commit();
    return product;
  } catch (e) {
    await tx.rollback();
    throw e;
  }
}

export async function listInventory() {
  const pool = await getPool();
  return (await pool.request().query(`
    SELECT i.id_inventario, i.producto_id, p.nombre, p.sku,
           i.stock_actual, i.stock_minimo, i.ultima_actualizacion,
           CASE WHEN i.stock_actual <= i.stock_minimo THEN 1 ELSE 0 END AS stock_bajo
    FROM dbo.inventario i INNER JOIN dbo.productos p ON p.id_producto=i.producto_id
    ORDER BY p.nombre
  `)).recordset;
}

export async function listOrders() {
  const pool = await getPool();
  return (await pool.request().query(`
    SELECT o.*, p.nombre AS proveedor_nombre
    FROM dbo.ordenes_compra o INNER JOIN dbo.proveedores p ON p.id_proveedor=o.proveedor_id
    ORDER BY o.fecha DESC
  `)).recordset;
}
