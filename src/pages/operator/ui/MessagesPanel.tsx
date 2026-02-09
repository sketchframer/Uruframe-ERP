import type { SystemMessage } from '@/shared/types';
import { EmptyState } from '@/shared/ui';
import { MessageSquare } from 'lucide-react';

interface MessagesPanelProps {
  userMessages: SystemMessage[];
}

export function MessagesPanel({ userMessages }: MessagesPanelProps) {
  return (
    <div className="space-y-2 sm:space-y-3 overflow-y-auto max-h-full pr-1 sm:pr-2 custom-scrollbar flex-1 min-h-0">
      {userMessages.length === 0 && (
        <EmptyState
          icon={<MessageSquare />}
          message="Bandeja de Entrada Vacía"
          className="py-8 sm:py-12 [&>div]:[&>svg]:w-10 [&>div]:[&>svg]:h-10"
        />
      )}
      {userMessages.slice().reverse().map(m => (
        <div key={m.id} className={`p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border transition-all ${m.to === 'ALL' ? 'bg-blue-600/10 border-blue-500/30 shadow shadow-blue-600/10' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex flex-wrap justify-between items-center gap-1.5 mb-2 sm:mb-2.5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${m.to === 'ALL' ? 'bg-blue-500' : 'bg-slate-700'}`} />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">De: <span className="text-white">{m.from}</span></span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">{new Date(m.timestamp).toLocaleString()}</span>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-slate-100 leading-snug font-bold">{m.content}</p>
        </div>
      ))}
    </div>
  );
}
