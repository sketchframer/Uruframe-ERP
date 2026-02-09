import { useState, useEffect } from 'react';
import { Tabs } from '@/shared/ui';
import { Settings, Users, UserCheck, MessageSquare, Cpu } from 'lucide-react';
import { useUserStore } from '@/entities/user';
import { useMachineStore } from '@/entities/machine';
import { GeneralTab } from './GeneralTab';
import { MessagesTab } from './MessagesTab';
import { UsersManagementTab } from './UsersManagementTab';
import { MachinesManagementTab } from './MachinesManagementTab';
import { WorkforceTab } from './WorkforceTab';

type SettingsTab = 'GENERAL' | 'USERS' | 'MACHINES' | 'WORKFORCE' | 'MESSAGES';

interface SettingsPageProps {
  initialTab?: string;
}

const tabMap: Record<string, SettingsTab> = {
  general: 'GENERAL',
  users: 'USERS',
  machines: 'MACHINES',
  workforce: 'WORKFORCE',
  messages: 'MESSAGES',
};

export function SettingsPage({ initialTab = 'general' }: SettingsPageProps) {
  const users = useUserStore((s) => s.users);
  const machines = useMachineStore((s) => s.machines);

  const tab = tabMap[initialTab?.toLowerCase() ?? 'general'] ?? 'GENERAL';
  const [activeTab, setActiveTab] = useState<SettingsTab>(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in max-w-6xl mx-auto">

      <Tabs
        tabs={[
          { id: 'GENERAL', label: 'Sistema', icon: <Settings size={14} /> },
          { id: 'USERS', label: 'Usuarios', icon: <Users size={14} /> },
          { id: 'MACHINES', label: 'Máquinas', icon: <Cpu size={14} /> },
          { id: 'WORKFORCE', label: 'Fuerza de Trabajo', icon: <UserCheck size={14} /> },
          { id: 'MESSAGES', label: 'Mensajería', icon: <MessageSquare size={14} /> },
        ]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as SettingsTab)}
      />

      <div className="flex-1 bg-slate-800 rounded-[2.5rem] border border-slate-700 p-8 overflow-y-auto shadow-2xl relative">
        {activeTab === 'MESSAGES' && <MessagesTab users={users} />}
        {activeTab === 'USERS' && <UsersManagementTab users={users} />}
        {activeTab === 'MACHINES' && <MachinesManagementTab machines={machines} />}
        {activeTab === 'WORKFORCE' && <WorkforceTab users={users} machines={machines} />}
        {activeTab === 'GENERAL' && <GeneralTab />}
      </div>
    </div>
  );
}
