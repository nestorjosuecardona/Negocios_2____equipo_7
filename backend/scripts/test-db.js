import 'dotenv/config';
import { getPool } from '../src/config/db.js';

try {
    const pool = await getPool();

    const resultado = await pool.request().query(`
    SELECT
      DB_NAME() AS base_datos,
      @@SERVERNAME AS servidor,
      SUSER_SNAME() AS usuario_windows;

    SELECT
      COUNT(*) AS total_roles
    FROM dbo.roles;
  `);

    console.log('\nCONEXIÓN CORRECTA\n');

    console.table(resultado.recordsets[0]);
    console.table(resultado.recordsets[1]);

    await pool.close();
    process.exit(0);

} catch (error) {
    console.error('\nERROR DE CONEXIÓN\n');
    console.error(error);
    process.exit(1);
}