import sql from 'mssql/msnodesqlv8.js';

const connectionString =
    'Driver={ODBC Driver 18 for SQL Server};' +
    'Server=localhost\\SQLEXPRESS;' +
    'Database=Negocios2;' +
    'Trusted_Connection=Yes;' +
    'TrustServerCertificate=Yes;';

const config = {
    connectionString,

    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool = null;

export async function getPool() {
    try {
        if (!pool) {
            pool = new sql.ConnectionPool(config);

            await pool.connect();

            console.log(
                'Conexión a SQL Server establecida correctamente'
            );
        }

        return pool;

    } catch (error) {
        console.error(
            'Error al conectar con SQL Server:',
            error
        );

        pool = null;

        throw error;
    }
}

export { sql };