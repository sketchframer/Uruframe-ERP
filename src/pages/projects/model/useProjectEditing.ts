import { useState } from 'react';
import type { Project } from '@/shared/types';
import { useProjectStore } from '@/entities/project';
import { useForm } from '@/shared/hooks';
import { toast } from '@/shared/ui';

export function useProjectEditing(selectedProjectId: string | null) {
  const projectStore = useProjectStore.getState();
  const [isEditing, setIsEditing] = useState(false);

  const editProjectForm = useForm({
    initialValues: {
      name: '',
      clientId: '',
      deadline: '',
      status: 'PLANNING' as string,
      description: '',
    },
    onSubmit: async (values) => {
      if (selectedProjectId) {
        await projectStore.update(selectedProjectId, values as Partial<Project>);
        toast.success('Proyecto actualizado');
        setIsEditing(false);
      }
    },
  });

  return { isEditing, setIsEditing, editProjectForm };
}
