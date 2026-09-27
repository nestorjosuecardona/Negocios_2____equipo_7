import 'dotenv/config';
import app from './app.js';
import { getPool } from './config/db.js';

const port=Number(process.env.PORT || 3000);
try {
  await getPool();
  app.listen(port,()=>console.log(`Negocios 2 API: http://localhost:${port}`));
} catch (err) {
  console.error('No se pudo iniciar el servidor:',err.message);
  process.exit(1);
}
