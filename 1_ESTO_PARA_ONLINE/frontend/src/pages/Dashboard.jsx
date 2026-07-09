import { useEffect, useState } from 'react';
import { api, formatMoney } from '../api/client';
import PageHeader from '../components/PageHeader';

function StatCard({ label, value, positive, negative }) {
  const cls = positive ? 'positive' : negative ? 'negative' : '';
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${cls}`}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Cargando dashboard...</p>;
  if (!data) return <p className="text-red-500">Error al cargar datos</p>;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Resumen de tu negocio Bombastic Dreamers" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Ventas hoy" value={formatMoney(data.ventas_hoy)} />
        <StatCard label="Ventas del mes" value={formatMoney(data.ventas_mes)} />
        <StatCard label="Utilidad bruta" value={formatMoney(data.utilidad_bruta_mes)} positive />
        <StatCard label="Utilidad neta" value={formatMoney(data.utilidad_neta_mes)} positive={data.utilidad_neta_mes >= 0} negative={data.utilidad_neta_mes < 0} />
        <StatCard label="Dinero en caja" value={formatMoney(data.dinero_caja)} />
        <StatCard label="Valor inventario" value={formatMoney(data.valor_inventario)} />
        <StatCard label="Autos vendidos" value={data.autos_vendidos_mes} />
        <StatCard label="Margen promedio" value={`${data.margen_promedio.toFixed(1)}%`} positive />
        <StatCard label="Gastos del mes" value={formatMoney(data.gastos_mes)} negative />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Top productos vendidos</h3>
          {data.top_productos.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin ventas registradas</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {data.top_productos.map((p, i) => (
                  <tr key={i}>
                    <td>{p.producto_nombre}</td>
                    <td>{p.total_vendido}</td>
                    <td>{formatMoney(p.ingresos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Baja rotación</h3>
          {data.baja_rotacion.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin productos en inventario</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Vendidos</th>
                </tr>
              </thead>
              <tbody>
                {data.baja_rotacion.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.cantidad}</td>
                    <td>{p.vendidos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
