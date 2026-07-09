export const TIPOS_COMPRA = [
  { value: 'mainline', label: 'Mainline' },
  { value: 'premium', label: 'Premium' },
  { value: 'rlc', label: 'RLC' },
  { value: 'protector', label: 'Protector' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'accesorio', label: 'Accesorio' },
  { value: 'otro', label: 'Otro' },
];

export const ESTADOS_COMPRA = [
  { value: 'en_camino', label: 'En camino', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'recibido', label: 'Recibido', color: 'bg-green-100 text-green-800' },
  { value: 'vendido_parcialmente', label: 'Vendido parcial', color: 'bg-blue-100 text-blue-800' },
  { value: 'cerrado', label: 'Cerrado', color: 'bg-gray-100 text-gray-600' },
];

export const CATEGORIAS = TIPOS_COMPRA;

export const ESTADOS_INVENTARIO = [
  { value: 'disponible', label: 'Disponible', color: 'bg-green-100 text-green-800' },
  { value: 'reservado', label: 'Reservado', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'vendido', label: 'Vendido', color: 'bg-gray-100 text-gray-600' },
  { value: 'premio', label: 'Premio', color: 'bg-purple-100 text-purple-800' },
  { value: 'danado', label: 'Dañado', color: 'bg-red-100 text-red-800' },
];

export const TIPOS_ITEM = [
  { value: 'caja_cerrada', label: 'Caja cerrada' },
  { value: 'auto_individual', label: 'Auto individual' },
  { value: 'accesorio', label: 'Accesorio' },
  { value: 'premio', label: 'Premio' },
];

export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'qr', label: 'QR' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'tiktok', label: 'TikTok' },
];

export const CANALES = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'live', label: 'Live TikTok' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'pedido_externo', label: 'Pedido externo' },
];

export const ESTADOS_VENTA = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'pagado', label: 'Pagado', color: 'bg-green-100 text-green-800' },
  { value: 'entregado', label: 'Entregado', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

export const CATEGORIAS_GASTO = [
  { value: 'transporte', label: 'Transporte' },
  { value: 'publicidad', label: 'Publicidad' },
  { value: 'materiales', label: 'Materiales' },
  { value: 'internet', label: 'Internet' },
  { value: 'comida', label: 'Comida' },
  { value: 'premios', label: 'Premios' },
  { value: 'sueldos', label: 'Sueldos' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'otros', label: 'Otros' },
];

export const TIPOS_CAJA = [
  { value: 'retiro_personal', label: 'Retiro personal' },
  { value: 'inversion', label: 'Inversión recibida' },
  { value: 'ajuste', label: 'Ajuste manual' },
];

export function labelOf(list, value) {
  return list.find((i) => i.value === value)?.label || value;
}

export function badgeClass(list, value) {
  return list.find((i) => i.value === value)?.color || 'bg-gray-100 text-gray-600';
}
