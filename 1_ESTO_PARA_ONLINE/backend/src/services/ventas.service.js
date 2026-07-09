import { getOne, getAll, query, withTransaction } from '../db/database.js';
import { calcularUtilidadBruta } from '../utils/calculos.js';
import * as inventarioService from './inventario.service.js';
import * as cajaService from './caja.service.js';

export async function listarVentas(filtros = {}) {
  let sql = 'SELECT * FROM ventas WHERE 1=1';
  const params = [];
  let i = 1;

  if (filtros.desde) { sql += ` AND fecha >= $${i++}`; params.push(filtros.desde); }
  if (filtros.hasta) { sql += ` AND fecha <= $${i++}`; params.push(filtros.hasta); }
  if (filtros.estado) { sql += ` AND estado = $${i++}`; params.push(filtros.estado); }

  sql += ' ORDER BY fecha DESC, id DESC';
  const ventas = await getAll(sql, params);

  return Promise.all(ventas.map(async (v) => ({
    ...v,
    items: await getAll('SELECT * FROM venta_items WHERE venta_id = $1', [v.id]),
  })));
}

export async function obtenerVenta(id) {
  const venta = await getOne('SELECT * FROM ventas WHERE id = $1', [id]);
  if (!venta) return null;
  return {
    ...venta,
    items: await getAll('SELECT * FROM venta_items WHERE venta_id = $1', [id]),
  };
}

export async function crearVenta(data) {
  return withTransaction(async (client) => {
    let totalVenta = 0;
    let totalCosto = 0;
    const itemsProcesados = [];

    for (const item of data.items) {
      let costoUnitario = item.costo_unitario;
      let nombreProducto = item.producto_nombre;

      if (item.inventario_id) {
        const invRes = await client.query('SELECT * FROM inventario WHERE id = $1', [item.inventario_id]);
        const inv = invRes.rows[0];
        if (!inv) throw new Error(`Producto inventario #${item.inventario_id} no encontrado`);
        costoUnitario = inv.costo_unitario;
        nombreProducto = inv.nombre;
        await inventarioService.descontarStock(item.inventario_id, item.cantidad, client);
      }

      const utilidad = calcularUtilidadBruta(item.precio_venta, costoUnitario, item.cantidad);
      const subtotal = Number(item.precio_venta) * Number(item.cantidad);
      totalVenta += subtotal;
      totalCosto += Number(costoUnitario) * Number(item.cantidad);

      itemsProcesados.push({
        inventario_id: item.inventario_id || null,
        producto_nombre: nombreProducto,
        cantidad: item.cantidad,
        precio_venta: item.precio_venta,
        costo_unitario: costoUnitario,
        utilidad,
      });
    }

    totalVenta += Number(data.delivery || 0);
    const utilidadBruta = totalVenta - Number(data.delivery || 0) - totalCosto;

    const ventaRes = await client.query(`
      INSERT INTO ventas (
        fecha, cliente_id, cliente_nombre, metodo_pago, canal, delivery,
        estado, total_venta, total_costo, utilidad_bruta, live_id, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id
    `, [
      data.fecha, data.cliente_id || null, data.cliente_nombre || null,
      data.metodo_pago || 'efectivo', data.canal || 'presencial', data.delivery || 0,
      data.estado || 'pagado', totalVenta, totalCosto, utilidadBruta,
      data.live_id || null, data.notas || null,
    ]);

    const ventaId = ventaRes.rows[0].id;

    for (const item of itemsProcesados) {
      await client.query(`
        INSERT INTO venta_items (venta_id, inventario_id, producto_nombre, cantidad, precio_venta, costo_unitario, utilidad)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [ventaId, item.inventario_id, item.producto_nombre, item.cantidad, item.precio_venta, item.costo_unitario, item.utilidad]);
    }

    if (data.estado !== 'cancelado' && data.estado !== 'pendiente') {
      await cajaService.registrarEntradaVenta(ventaId, totalVenta, data.fecha, client);
    }

    await actualizarClienteStats(data.cliente_id, data.cliente_nombre, totalVenta, data.fecha, client);

    return obtenerVenta(ventaId);
  });
}

async function actualizarClienteStats(clienteId, clienteNombre, monto, fecha, client) {
  const run = (t, p) => client.query(t, p);
  if (clienteId) {
    await run(`
      UPDATE clientes SET total_comprado = COALESCE(total_comprado,0)+$1,
        cantidad_compras = COALESCE(cantidad_compras,0)+1, ultima_compra=$2 WHERE id=$3
    `, [monto, fecha, clienteId]);
  } else if (clienteNombre) {
    const ex = await run('SELECT id FROM clientes WHERE nombre = $1', [clienteNombre]);
    if (ex.rows[0]) {
      await run(`
        UPDATE clientes SET total_comprado = COALESCE(total_comprado,0)+$1,
          cantidad_compras = COALESCE(cantidad_compras,0)+1, ultima_compra=$2 WHERE id=$3
      `, [monto, fecha, ex.rows[0].id]);
    }
  }
}

export async function cancelarVenta(id) {
  const venta = await obtenerVenta(id);
  if (!venta) return null;
  if (venta.estado === 'cancelado') return venta;
  await query(`UPDATE ventas SET estado = 'cancelado' WHERE id = $1`, [id]);
  return obtenerVenta(id);
}

export async function topProductos(limite = 10, desde, hasta) {
  let sql = `
    SELECT producto_nombre, SUM(cantidad) as total_vendido,
           SUM(precio_venta * cantidad) as ingresos, SUM(utilidad) as utilidad
    FROM venta_items vi JOIN ventas v ON v.id = vi.venta_id
    WHERE v.estado != 'cancelado'
  `;
  const params = [];
  let i = 1;
  if (desde) { sql += ` AND v.fecha >= $${i++}`; params.push(desde); }
  if (hasta) { sql += ` AND v.fecha <= $${i++}`; params.push(hasta); }
  sql += ` GROUP BY producto_nombre ORDER BY total_vendido DESC LIMIT $${i}`;
  params.push(limite);
  return getAll(sql, params);
}

export async function ventasDelPeriodo(desde, hasta) {
  return getOne(`
    SELECT COALESCE(SUM(total_venta),0) as total, COALESCE(SUM(utilidad_bruta),0) as utilidad_bruta,
           COALESCE(SUM(total_costo),0) as total_costo, COUNT(*) as cantidad
    FROM ventas WHERE estado != 'cancelado' AND fecha >= $1 AND fecha <= $2
  `, [desde, hasta]);
}

export async function autosVendidos(desde, hasta) {
  const row = await getOne(`
    SELECT COALESCE(SUM(vi.cantidad),0) as total
    FROM venta_items vi JOIN ventas v ON v.id = vi.venta_id
    WHERE v.estado != 'cancelado' AND v.fecha >= $1 AND v.fecha <= $2
  `, [desde, hasta]);
  return Number(row?.total || 0);
}
