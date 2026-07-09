import { useEffect, useState } from 'react';
import { api, formatMoney, formatDate, hoy } from '../api/client';
import { CATEGORIAS, ESTADOS_INVENTARIO, TIPOS_ITEM, labelOf, badgeClass } from '../utils/constants';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

const emptyForm = {
  nombre: '',
  categoria: 'mainline',
  tipo_item: 'auto_individual',
  serie: '',
  anio: '',
  case_code: '',
  cantidad: 1,
  costo_unitario: '',
  precio_sugerido: '',
  estado: 'disponible',
  ubicacion: '',
  fecha_ingreso: hoy(),
  proveedor_nombre: '',
  notas: '',
};

export default function Inventario() {
  const [items, setItems] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modal, setModal] = useState(false);
  const [cajaModal, setCajaModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [autosAbrir, setAutosAbrir] = useState([{ nombre: '' }]);
  const [error, setError] = useState('');

  const load = () => {
    const params = {};
    if (busqueda) params.busqueda = busqueda;
    if (filtroEstado) params.estado = filtroEstado;
    api.inventario.list(params).then(setItems).catch(console.error);
  };

  useEffect(() => { load(); }, [busqueda, filtroEstado]);

  const openNew = () => { setForm(emptyForm); setError(''); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.inventario.create({
        ...form,
        cantidad: Number(form.cantidad),
        costo_unitario: Number(form.costo_unitario),
        precio_sugerido: form.precio_sugerido ? Number(form.precio_sugerido) : null,
        anio: form.anio ? Number(form.anio) : null,
      });
      setModal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAbrirCaja = async () => {
    try {
      const autos = autosAbrir.filter((a) => a.nombre.trim());
      if (autos.length === 0) return alert('Agrega al menos un auto');
      await api.inventario.abrirCaja(cajaModal.id, autos);
      setCajaModal(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle="Control de stock: cajas, autos y accesorios"
        action={<button className="btn-primary" onClick={openNew}>+ Agregar item</button>}
      />

      <div className="flex gap-3 mb-4">
        <input
          className="max-w-xs"
          placeholder="Buscar por nombre, código o serie..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select className="max-w-[180px]" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS_INVENTARIO.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Stock</th>
              <th>Costo</th>
              <th>Precio sug.</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="font-mono text-xs">{item.codigo_interno}</td>
                <td>{item.nombre}</td>
                <td>{labelOf(CATEGORIAS, item.categoria)}</td>
                <td>{labelOf(TIPOS_ITEM, item.tipo_item)}</td>
                <td>{item.cantidad}</td>
                <td>{formatMoney(item.costo_unitario)}</td>
                <td>{item.precio_sugerido ? formatMoney(item.precio_sugerido) : '-'}</td>
                <td><Badge label={labelOf(ESTADOS_INVENTARIO, item.estado)} colorClass={badgeClass(ESTADOS_INVENTARIO, item.estado)} /></td>
                <td>{item.ubicacion || '-'}</td>
                <td>
                  {item.tipo_item === 'caja_cerrada' && item.estado === 'disponible' && (
                    <button className="btn-primary text-xs py-1" onClick={() => { setCajaModal(item); setAutosAbrir([{ nombre: '' }]); }}>
                      Abrir caja
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={10} className="text-center text-gray-400 py-8">Inventario vacío</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Agregar al inventario" wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
              <input value={form.nombre} onChange={set('nombre')} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
              <select value={form.categoria} onChange={set('categoria')}>
                {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select value={form.tipo_item} onChange={set('tipo_item')}>
                {TIPOS_ITEM.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Serie</label>
              <input value={form.serie} onChange={set('serie')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Año</label>
              <input type="number" value={form.anio} onChange={set('anio')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Case</label>
              <input value={form.case_code} onChange={set('case_code')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
              <input type="number" min="1" value={form.cantidad} onChange={set('cantidad')} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Costo unitario</label>
              <input type="number" min="0" step="0.01" value={form.costo_unitario} onChange={set('costo_unitario')} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio sugerido</label>
              <input type="number" min="0" step="0.01" value={form.precio_sugerido} onChange={set('precio_sugerido')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ubicación</label>
              <input value={form.ubicacion} onChange={set('ubicacion')} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fecha ingreso</label>
              <input type="date" value={form.fecha_ingreso} onChange={set('fecha_ingreso')} required />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!cajaModal} onClose={() => setCajaModal(null)} title={`Abrir caja: ${cajaModal?.nombre}`} wide>
        <p className="text-sm text-gray-500 mb-4">Ingresa los nombres de los autos individuales que salen de esta caja.</p>
        {autosAbrir.map((auto, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              placeholder={`Auto ${i + 1} - nombre`}
              value={auto.nombre}
              onChange={(e) => {
                const copy = [...autosAbrir];
                copy[i] = { nombre: e.target.value };
                setAutosAbrir(copy);
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="btn-secondary text-sm mb-4"
          onClick={() => setAutosAbrir([...autosAbrir, { nombre: '' }])}
        >
          + Agregar auto
        </button>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setCajaModal(null)}>Cancelar</button>
          <button className="btn-primary" onClick={handleAbrirCaja}>Abrir caja</button>
        </div>
      </Modal>
    </div>
  );
}
