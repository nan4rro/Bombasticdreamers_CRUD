import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db/database.js';

import comprasRoutes from './routes/compras.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import gastosRoutes from './routes/gastos.routes.js';
import cajaRoutes from './routes/caja.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import backupRoutes from './routes/backup.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));

app.use(express.json());

app.use('/api/compras', comprasRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/caja', cajaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/backup', backupRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', nombre: 'Bombastic Dreamers Online' });
});

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: Falta DATABASE_URL en variables de entorno');
    process.exit(1);
  }

  await initDb();

  app.listen(PORT, () => {
    console.log(`\n  Bombastic Dreamers API (online)`);
    console.log(`  Puerto: ${PORT}`);
    console.log(`  Health: /api/health\n`);
  });
}

start().catch((err) => {
  console.error('Error al iniciar:', err);
  process.exit(1);
});
