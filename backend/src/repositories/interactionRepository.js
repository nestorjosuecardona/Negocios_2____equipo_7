import { getPool, sql } from '../config/db.js';

const baseSelect = `
  SELECT i.id_interaccion, i.cliente_id, c.nombre AS cliente_nombre,
         i.usuario_id, u.nombre AS usuario_nombre,
         i.tipo, i.descripcion, i.fecha
  FROM dbo.interacciones i
  INNER JOIN dbo.clientes c ON c.id_cliente=i.cliente_id
  INNER JOIN dbo.usuarios u ON u.id_usuario=i.usuario_id
`;

export async function listInteractions() {
  const pool = await getPool();
  const result = await pool.request().query(`${baseSelect} ORDER BY i.fecha DESC`);
  return result.recordset;
}

export async function listClientInteractions(clienteId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('clienteId', sql.Int, clienteId)
    .query(`${baseSelect} WHERE i.cliente_id=@clienteId ORDER BY i.fecha DESC`);
  return result.recordset;
}

export async function listUserActivity(usuarioId) {
  const pool = await getPool();
  const result = await pool.request()
    .input('usuarioId', sql.Int, usuarioId)
    .query(`${baseSelect} WHERE i.usuario_id=@usuarioId ORDER BY i.fecha DESC`);
  return result.recordset;
}

export async function createInteraction(data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('clienteId', sql.Int, data.cliente_id)
    .input('usuarioId', sql.Int, data.usuario_id)
    .input('tipo', sql.NVarChar(30), data.tipo)
    .input('descripcion', sql.NVarChar(1000), data.descripcion)
    .input('fecha', sql.DateTime2, data.fecha ? new Date(data.fecha) : new Date())
    .query(`INSERT INTO dbo.interacciones (cliente_id, usuario_id, tipo, descripcion, fecha)
            OUTPUT INSERTED.*
            VALUES (@clienteId, @usuarioId, @tipo, @descripcion, @fecha)`);
  return result.recordset[0];
}
