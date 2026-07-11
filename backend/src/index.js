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
import resetRoutes from './routes/reset.routes.js';

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
app.use('/api/admin', resetRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', nombre: 'Bombastic Dreamers Online' });
});

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: Falta DATABASE_URL en variables de entorno');
    process.exit(1);
  }

  // Reintentos: la base de datos puede tardar en estar lista en el primer deploy
  for (let intento = 1; intento <= 10; intento++) {
    try {
      await initDb();
      console.log('Base de datos conectada e inicializada');
      break;
    } catch (err) {
      console.error(`Intento ${intento}/10 DB:`, err.message);
      if (intento === 10) throw err;
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  Bombastic Dreamers API (online)`);
    console.log(`  Puerto: ${PORT}`);
    console.log(`  Health: /api/health\n`);
  });
}

start().catch((err) => {
  console.error('Error al iniciar:', err);
  process.exit(1);
});
