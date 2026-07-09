import { useEffect, useState } from 'react';
import { api, formatMoney, formatDate, hoy } from '../api/client';
import { TIPOS_CAJA, labelOf } from '../utils/constants';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

export default function Caja() {
  const [saldo, setSaldo] = useState(0);
  const [resumen, setResumen] = useState(null);
  const [cierres, setCierres] = useState([]);
  const [fecha, setFecha] = useState(hoy());
  const [modal, setModal] = useState(false);
  const [movForm, setMovForm] = useState({ fecha: hoy(), tipo: 'retiro_personal', monto: '', descripcion: '' });
  const [notasCierre, setNotasCierre] = useState('');

  const load = () => {
    api.caja.saldo().then((d) => setSaldo(d.saldo)).catch(console.error);
    api.caja.resumen(fecha).then(setResumen).catch(console.error);
    api.caja.cierres().then(setCierres).catch(console.error);
  };

  useEffect(() => { load(); }, [fecha]);

  const handleMovimiento = async (e) => {
    e.preventDefault();
    try {
      await api.caja.movimiento({ ...movForm, monto: Number(movForm.monto) });
      setModal(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCerrar = async () => {
    try {
      await api.caja.cerrar({ fecha, notas: notasCierre });
      setNotasCierre('');
      load();
      alert('Caja cerrada correctamente');
    } catch (err) {
      alert(err.message);
    }
  };

  const tipoLabel = (tipo) => {
    const map = {
      entrada_venta: 'Entrada venta',
      salida_compra: 'Salida compra',
      salida_gasto: 'Salida gasto',
      retiro_personal: 'Retiro personal',
      inversion: 'Inversión',
      ajuste: 'Ajuste',
    };
    return map[tipo] || tipo;
  };

  return (
    <div>
      <PageHeader
        title="Caja"
        subtitle="Control de dinero real del negocio"
        action={
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setModal(true)}>Movimiento manual</button>
            <button className="btn-primary" onClick={handleCerrar}>Cerrar caja del día</button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <span className="stat-label">Saldo actual</span>
          <span className={`stat-value ${saldo >= 0 ? 'positive' : 'negative'}`}>{formatMoney(saldo)}</span>
        </div>
        {resumen && (
          <>
            <div className="stat-card">
              <span className="stat-label">Saldo inicial ({formatDate(fecha)})</span>
              <span className="stat-value">{formatMoney(resumen.saldo_inicial)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Entradas del día</span>
              <span className="stat-value positive">{formatMoney(resumen.entradas)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Salidas del día</span>
              <span className="stat-value negative">{formatMoney(resumen.salidas)}</span>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-3 mb-4 items-center">
        <label className="text-sm text-gray-600">Ver día:</label>
        <input type="date" className="max-w-[200px]" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <input
          className="max-w-xs"
          placeholder="Notas de cierre..."
          value={notasCierre}
          onChange={(e) => setNotasCierre(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card overflow-x-auto">
          <h3 className="font-semibold mb-4">Movimientos del día</h3>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {resumen?.movimientos?.map((m) => (
                <tr key={m.id}>
                  <td>{tipoLabel(m.tipo)}</td>
                  <td>{m.descripcion || '-'}</td>
                  <td className={m.tipo.startsWith('entrada') || m.tipo === 'inversion' ? 'text-green-600' : 'text-red-600'}>
                    {formatMoney(m.monto)}
                  </td>
                </tr>
              ))}
              {(!resumen?.movimientos || resumen.movimientos.length === 0) && (
                <tr><td colSpan={3} className="text-center text-gray-400 py-6">Sin movimientos</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card overflow-x-auto">
          <h3 className="font-semibold mb-4">Historial de cierres</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Inicial</th>
                <th>Entradas</th>
                <th>Salidas</th>
                <th>Final</th>
              </tr>
            </thead>
            <tbody>
              {cierres.map((c) => (
                <tr key={c.id}>
                  <td>{formatDate(c.fecha)}</td>
                  <td>{formatMoney(c.saldo_inicial)}</td>
                  <td className="text-green-600">{formatMoney(c.entradas)}</td>
                  <td className="text-red-600">{formatMoney(c.salidas)}</td>
                  <td className="font-medium">{formatMoney(c.saldo_final)}</td>
                </tr>
              ))}
              {cierres.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-6">Sin cierres registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Movimiento manual">
        <form onSubmit={handleMovimiento} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
            <input type="date" value={movForm.fecha} onChange={(e) => setMovForm({ ...movForm, fecha: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select value={movForm.tipo} onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value })}>
              {TIPOS_CAJA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Monto</label>
            <input type="number" min="0" step="0.01" value={movForm.monto} onChange={(e) => setMovForm({ ...movForm, monto: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <input value={movForm.descripcion} onChange={(e) => setMovForm({ ...movForm, descripcion: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
