import { getPool } from '../config/db.js';

export async function getMetrics() {
  const pool = await getPool();

  const summary = await pool.request().query(`
    SELECT
      COUNT(*) AS total_clientes,
      SUM(CASE WHEN estado='activo' THEN 1 ELSE 0 END) AS clientes_activos,
      SUM(CASE WHEN estado='inactivo' THEN 1 ELSE 0 END) AS clientes_inactivos
    FROM dbo.clientes;

    SELECT COUNT(*) AS interacciones_mes
    FROM dbo.interacciones
    WHERE YEAR(fecha)=YEAR(GETDATE()) AND MONTH(fecha)=MONTH(GETDATE());

    SELECT COUNT(*) AS clientes_sin_interaccion
    FROM dbo.clientes c
    WHERE NOT EXISTS (
      SELECT 1 FROM dbo.interacciones i
      WHERE i.cliente_id=c.id_cliente AND i.fecha >= DATEADD(DAY,-30,GETDATE())
    );

    SELECT etapa_crm, COUNT(*) AS total
    FROM dbo.clientes GROUP BY etapa_crm ORDER BY etapa_crm;

    SELECT tipo, COUNT(*) AS total
    FROM dbo.interacciones GROUP BY tipo ORDER BY tipo;

    SELECT TOP 8 c.id_cliente, c.nombre, c.empresa,
      MAX(i.fecha) AS ultima_interaccion,
      DATEDIFF(DAY, MAX(i.fecha), GETDATE()) AS dias_sin_interaccion
    FROM dbo.clientes c
    LEFT JOIN dbo.interacciones i ON i.cliente_id=c.id_cliente
    WHERE c.estado='activo'
    GROUP BY c.id_cliente, c.nombre, c.empresa
    HAVING MAX(i.fecha) IS NULL OR MAX(i.fecha) < DATEADD(DAY,-30,GETDATE())
    ORDER BY ultima_interaccion ASC;
  `);

  return {
    ...summary.recordsets[0][0],
    interacciones_mes: summary.recordsets[1][0].interacciones_mes,
    clientes_sin_interaccion: summary.recordsets[2][0].clientes_sin_interaccion,
    etapas: summary.recordsets[3],
    tipos_interaccion: summary.recordsets[4],
    clientes_riesgo: summary.recordsets[5]
  };
}
