const sql = require('msnodesqlv8');
const util = require('util');

const connectionString =
    'Driver={ODBC Driver 18 for SQL Server};' +
    'Server=localhost\\SQLEXPRESS;' +
    'Database=Negocios2;' +
    'Trusted_Connection=Yes;' +
    'TrustServerCertificate=Yes;';

console.log('Probando conexión directa con msnodesqlv8...\n');

sql.query(
    connectionString,
    `
    SELECT
        DB_NAME() AS base_datos,
        @@SERVERNAME AS servidor,
        SUSER_SNAME() AS usuario_windows;

    SELECT COUNT(*) AS total_roles
    FROM dbo.roles;
    `,
    (error, rows) => {
        if (error) {
            console.log('ERROR REAL DE SQL SERVER:\n');

            console.log(
                util.inspect(error, {
                    depth: null,
                    colors: false
                })
            );

            process.exit(1);
        }

        console.log('CONEXIÓN DIRECTA CORRECTA\n');

        console.log(
            util.inspect(rows, {
                depth: null,
                colors: false
            })
        );

        process.exit(0);
    }
);