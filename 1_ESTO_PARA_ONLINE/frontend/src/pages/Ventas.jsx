import { useEffect, useState } from 'react';
import { api, formatMoney, formatDate, hoy } from '../api/client';
import { METODOS_PAGO, CANALES, ESTADOS_VENTA, labelOf, badgeClass } from '../utils/constants';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

const emptyItem = { inventario_id: '', producto_nombre: '', cantidad: 1, precio_venta: '', costo_unitario: '' };

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    fecha: hoy(),
    cliente_nombre: '',
    metodo_pago: 'efectivo',
    canal: 'presencial',
    delivery: '',
    estado: 'pagado',
    notas: '',
    items: [{ ...emptyItem }],
  });
  const [error, setError] = useState('');

  const load = () => api.ventas.list().then(setVentas).catch(console.error);
  useEffect(() => {
    load();
    api.inventario.list({ estado: 'disponible' }).then(setInventario).catch(console.error);
  }, []);

  const openNew = () => {
    setForm({
      fecha: hoy(),
      cliente_nombre: '',
      metodo_pago: 'efectivo',
      canal: 'presencial',
      delivery: '',
      estado: 'pagado',
      notas: '',
      items: [{ ...emptyItem }],
    });
    setError('');
    setModal(true);
  };

  const selectProducto = (index, inventarioId) => {
    const item = inventario.find((i) => i.id === Number(inventarioId));
    const items = [...form.items];
    if (item) {
      items[index] = {
        inventario_id: item.id,
        producto_nombre: item.nombre,
        cantidad: 1,
        precio_venta: item.precio_sugerido || '',
        costo_unitario: item.costo_unitario,
      };
    } else {
      items[index] = { ...emptyItem, inventario_id: '' };
    }
    setForm({ ...form, items });
  };

  const calcUtilidad = (item) => {
    const pv = Number(item.precio_venta) || 0;
    const cu = Number(item.costo_unitario) || 0;
    const qty = Number(item.cantidad) || 1;
    return (pv - cu) * qty;
  };

  const totalVenta = form.items.reduce((s, i) => s + (Number(i.precio_venta) || 0) * (Number(i.cantidad) || 1), 0) + (Number(form.delivery) || 0);
  const totalUtilidad = form.items.reduce((s, i) => s + calcUtilidad(i), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.ventas.create({
        ...form,
        delivery: Number(form.delivery || 0),
        items: form.items.map((i) => ({
          inventario_id: i.inventario_id ? Number(i.inventario_id) : null,
          producto_nombre: i.producto_nombre,
          cantidad: Number(i.cantidad),
          precio_venta: Number(i.precio_venta),
          costo_unitario: Number(i.costo_unitario || 0),
        })),
      });
      setModal(false);
      load();
      api.inventario.list({ estado: 'disponible' }).then(setInventario);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Ventas"
        subtitle="Registra ventas y descuenta inventario automáticamente"
        action={<button className="btn-primary" onClick={openNew}>+ Nueva venta</button>}
      />

      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Utilidad</th>
              <th>Pago</th>
              <th>Canal</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id}>
                <td>{formatDate(v.fecha)}</td>
                <td>{v.cliente_nombre || '-'}</td>
                <td>{v.items?.map((i) => i.producto_nombre).join(', ')}</td>
                <td>{formatMoney(v.total_venta)}</td>
                <td className="text-green-600">{formatMoney(v.utilidad_bruta)}</td>
                <td>{labelOf(METODOS_PAGO, v.metodo_pago)}</td>
                <td>{labelOf(CANALES, v.canal)}</td>
                <td><Badge label={labelOf(ESTADOS_VENTA, v.estado)} colorClass={badgeClass(ESTADOS_VENTA, v.estado)} /></td>
              </tr>
            ))}
            {ventas.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 py-8">No hay ventas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Nueva venta" wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cliente</label>
              <input value={form.cliente_nombre} onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Método de pago</label>
              <select value={form.metodo_pago} onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}>
                {METODOS_PAGO.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Canal</label>
              <select value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })}>
                {CANALES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Delivery</label>
              <input type="number" min="0" step="0.01" value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                {ESTADOS_VENTA.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Productos</h4>
            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 items-end">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Del inventario</label>
                  <select value={item.inventario_id} onChange={(e) => selectProducto(idx, e.target.value)}>
                    <option value="">Manual...</option>
                    {inventario.map((inv) => (
                      <option key={inv.id} value={inv.id}>{inv.nombre} (stock: {inv.cantidad})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                  <input value={item.producto_nombre} onChange={(e) => {
                    const items = [...form.items];
                    items[idx].producto_nombre = e.target.value;
                    setForm({ ...form, items });
                  }} required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Cant.</label>
                  <input type="number" min="1" value={item.cantidad} onChange={(e) => {
                    const items = [...form.items];
                    items[idx].cantidad = e.target.value;
                    setForm({ ...form, items });
                  }} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Precio</label>
                  <input type="number" min="0" step="0.01" value={item.precio_venta} onChange={(e) => {
                    const items = [...form.items];
                    items[idx].precio_venta = e.target.value;
                    setForm({ ...form, items });
                  }} required />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => setForm({ ...form, items: [...form.items, { ...emptyItem }] })}
            >
              + Agregar producto
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p><strong>Total venta:</strong> {formatMoney(totalVenta)}</p>
            <p><strong>Utilidad bruta:</strong> {formatMoney(totalUtilidad)}</p>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar venta</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
