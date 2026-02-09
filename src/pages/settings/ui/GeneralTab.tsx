export function GeneralTab() {
  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Estado del Sistema</h2>
      <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-white font-black uppercase tracking-widest">Núcleo Structura Activo</span>
        </div>
        <div className="space-y-4 text-slate-400 font-mono text-sm">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>Versión ERP:</span>
            <span className="text-blue-400">4.5.5-Stable</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span>Base de Datos:</span>
            <span className="text-white">Local-Sync-JSON</span>
          </div>
          <div className="flex justify-between">
            <span>Licencia:</span>
            <span className="text-green-500">PRO - Corporativa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
