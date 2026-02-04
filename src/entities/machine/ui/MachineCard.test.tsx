import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MachineCard } from './MachineCard';
import { MachineStatus } from '@/shared/types';

describe('MachineCard', () => {
  const mockMachine = {
    id: 'M-01',
    name: 'Test Machine',
    brand: 'TestBrand',
    type: 'CONFORMADORA' as const,
    status: MachineStatus.IDLE,
    efficiency: 85,
    operatorIds: [],
    currentJobId: null,
    isActive: true,
    oee_availability: 90,
    oee_performance: 88,
    oee_quality: 95,
    totalMetersProduced: 1000,
    nextMaintenanceMeters: 2000,
  };

  it('renders machine name and brand', () => {
    render(
      <MachineCard
        machine={mockMachine}
        onClick={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText('Test Machine')).toBeInTheDocument();
    expect(screen.getByText('TestBrand')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    render(
      <MachineCard
        machine={mockMachine}
        onClick={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText('IDLE')).toBeInTheDocument();
  });

  it('calls onClick when card area is clicked', () => {
    const onClick = vi.fn();
    render(
      <MachineCard
        machine={mockMachine}
        onClick={onClick}
        onEdit={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Test Machine'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows project name in order section when provided', () => {
    render(
      <MachineCard
        machine={mockMachine}
        projectName="Test Project"
        onClick={() => {}}
        onEdit={() => {}}
      />
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
});
