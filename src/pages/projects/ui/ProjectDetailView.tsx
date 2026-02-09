import type { ReactNode } from 'react';

interface ProjectDetailViewProps {
  header: ReactNode;
  children: ReactNode;
}

export function ProjectDetailView({ header, children }: ProjectDetailViewProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {header}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {children}
      </div>
    </div>
  );
}
