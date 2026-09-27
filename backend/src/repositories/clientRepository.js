import { getPool, sql } from '../config/db.js';

export async function listClients({ q = '', estado = '', etapa = '' }) {
  const pool = await getPool();
  const request = pool.request()
    .input('q', sql.NVarChar(180), `%${q}%`)
    .input('estado', sql.NVarChar(20), estado)
    .input('etapa', sql.NVarChar(30), etapa);

  const result = await request.query(`
    SELECT id_cliente, nombre, correo, telefono, empresa, fecha_registro, estado, etapa_crm
    FROM dbo.clientes
    WHERE (@q = '%%' OR nombre LIKE @q OR correo LIKE @q OR empresa LIKE @q OR telefono LIKE @q)
      AND (@estado = '' OR estado = @estado)
      AND (@etapa = '' OR etapa_crm = @etapa)
    ORDER BY fecha_registro DESC
  `);
  return result.recordset;
}

export async function findClientById(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`SELECT id_cliente, nombre, correo, telefono, empresa, fecha_registro, estado, etapa_crm
            FROM dbo.clientes WHERE id_cliente = @id`);
  return result.recordset[0] || null;
}

export async function createClient(data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('nombre', sql.NVarChar(150), data.nombre)
    .input('correo', sql.NVarChar(180), data.correo || null)
    .input('telefono', sql.NVarChar(40), data.telefono || null)
    .input('empresa', sql.NVarChar(150), data.empresa || null)
    .input('estado', sql.NVarChar(20), data.estado || 'activo')
    .input('etapa', sql.NVarChar(30), data.etapa_crm || 'Prospecto')
    .query(`INSERT INTO dbo.clientes (nombre, correo, telefono, empresa, estado, etapa_crm)
            OUTPUT INSERTED.*
            VALUES (@nombre, @correo, @telefono, @empresa, @estado, @etapa)`);
  return result.recordset[0];
}

export async function updateClient(id, data) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('nombre', sql.NVarChar(150), data.nombre)
    .input('correo', sql.NVarChar(180), data.correo || null)
    .input('telefono', sql.NVarChar(40), data.telefono || null)
    .input('empresa', sql.NVarChar(150), data.empresa || null)
    .input('estado', sql.NVarChar(20), data.estado || 'activo')
    .input('etapa', sql.NVarChar(30), data.etapa_crm || 'Prospecto')
    .query(`UPDATE dbo.clientes
            SET nombre=@nombre, correo=@correo, telefono=@telefono, empresa=@empresa,
                estado=@estado, etapa_crm=@etapa
            OUTPUT INSERTED.*
            WHERE id_cliente=@id`);
  return result.recordset[0] || null;
}

export async function updateClientStage(id, etapa) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('etapa', sql.NVarChar(30), etapa)
    .query(`UPDATE dbo.clientes SET etapa_crm=@etapa
            OUTPUT INSERTED.* WHERE id_cliente=@id`);
  return result.recordset[0] || null;
}

export async function deleteClient(id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query('DELETE FROM dbo.clientes OUTPUT DELETED.id_cliente WHERE id_cliente=@id');
  return result.recordset[0] || null;
}
