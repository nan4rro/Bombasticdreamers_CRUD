import * as ventasService from './ventas.service.js';
import * as gastosService from './gastos.service.js';
import * as inventarioService from './inventario.service.js';
import * as cajaService from './caja.service.js';
import { hoy, inicioMes, finMes, calcularMargen } from '../utils/calculos.js';

export async function obtenerDashboard() {
  const fechaHoy = hoy();
  const desdeMes = inicioMes();
  const hastaMes = finMes();

  const [ventasHoy, ventasMes, gastosMes, dineroCaja, valorInventario, autosVendidos, topProductos, bajaRotacion] = await Promise.all([
    ventasService.ventasDelPeriodo(fechaHoy, fechaHoy),
    ventasService.ventasDelPeriodo(desdeMes, hastaMes),
    gastosService.gastosDelPeriodo(desdeMes, hastaMes),
    cajaService.saldoActual(),
    inventarioService.valorTotalInventario(),
    ventasService.autosVendidos(desdeMes, hastaMes),
    ventasService.topProductos(5, desdeMes, hastaMes),
    inventarioService.productosBajaRotacion(5),
  ]);

  const utilidadNetaMes = Number(ventasMes?.utilidad_bruta || 0) - Number(gastosMes?.total || 0);

  return {
    ventas_hoy: Number(ventasHoy?.total || 0),
    ventas_mes: Number(ventasMes?.total || 0),
    utilidad_bruta_mes: Number(ventasMes?.utilidad_bruta || 0),
    utilidad_neta_mes: utilidadNetaMes,
    dinero_caja: dineroCaja,
    valor_inventario: valorInventario,
    autos_vendidos_mes: autosVendidos,
    margen_promedio: calcularMargen(Number(ventasMes?.utilidad_bruta || 0), Number(ventasMes?.total || 0)),
    gastos_mes: Number(gastosMes?.total || 0),
    top_productos: topProductos,
    baja_rotacion: bajaRotacion,
    lives_rentables: [],
  };
}

export async function obtenerReporte(desde, hasta) {
  const [ventas, gastos, gastosCat, valorInventario, topProductos] = await Promise.all([
    ventasService.ventasDelPeriodo(desde, hasta),
    gastosService.gastosDelPeriodo(desde, hasta),
    gastosService.gastosPorCategoria(desde, hasta),
    inventarioService.valorTotalInventario(),
    ventasService.topProductos(10, desde, hasta),
  ]);

  return {
    periodo: { desde, hasta },
    ventas: Number(ventas?.total || 0),
    utilidad_bruta: Number(ventas?.utilidad_bruta || 0),
    utilidad_neta: Number(ventas?.utilidad_bruta || 0) - Number(gastos?.total || 0),
    gastos: Number(gastos?.total || 0),
    gastos_por_categoria: gastosCat,
    valor_inventario: valorInventario,
    top_productos: topProductos,
    productos_menos_rentables: [],
    clientes_principales: [],
  };
}
