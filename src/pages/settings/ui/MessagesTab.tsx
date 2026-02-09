import { useState, useMemo } from 'react';
import { Button, Select, Textarea, toast } from '@/shared/ui';
import { useForm } from '@/shared/hooks';
import { Send } from 'lucide-react';
import type { User } from '@/shared/types';
import { useMessageStore } from '@/entities/message';

interface MessagesTabProps {
  users: User[];
}

export function MessagesTab({ users }: MessagesTabProps) {
  const messageStore = useMessageStore.getState();
  const [msgTo, setMsgTo] = useState('ALL');

  const recipientOptions = useMemo(() => [
    { value: 'ALL', label: 'TODOS (Dashboard Principal)' },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` })),
  ], [users]);

  const msgForm = useForm({
    initialValues: { content: '' },
    onSubmit: async (values) => {
      if (!values.content.trim()) return;
      await messageStore.add({ from: 'ADMIN', to: msgTo, content: values.content.trim(), isRead: false });
      msgForm.reset();
      toast.success('Comunicado enviado correctamente');
    },
  });

  return (
    <div className="max-w-2xl animate-fade-in">
      <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Comunicación Interna</h2>
      <p className="text-slate-500 text-sm mb-8">Envíe instrucciones o avisos generales a la planta.</p>
      <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-700 space-y-6">
        <Select
          label="Destinatario"
          options={recipientOptions}
          value={msgTo}
          onChange={e => setMsgTo(e.target.value)}
        />
        <Textarea
          label="Contenido del Mensaje"
          placeholder="Escriba aquí el comunicado..."
          value={msgForm.values.content}
          onChange={e => msgForm.handleChange('content', e.target.value)}
          className="min-h-[150px]"
        />
        <Button
          variant="primary"
          size="xl"
          className="w-full"
          leftIcon={<Send size={18} />}
          onClick={msgForm.handleSubmit}
          isLoading={msgForm.isSubmitting}
        >
          Publicar Comunicado
        </Button>
      </div>
    </div>
  );
}
