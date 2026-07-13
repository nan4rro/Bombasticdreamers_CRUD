export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className={`relative bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-[#2a2a2a]">
          <h2 className="text-lg font-semibold text-[#ffcc00]">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[#ffcc00] text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
