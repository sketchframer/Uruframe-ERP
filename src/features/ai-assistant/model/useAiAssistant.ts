import { useState, useCallback } from 'react';
import { useMachineStore } from '@/entities/machine';
import { useEventStore } from '@/entities/event';
import { useJobStore } from '@/entities/job';
import { analyzeFactoryState } from '../api/geminiService';

export function useAiAssistant() {
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const machines = useMachineStore((s) => s.machines);
  const events = useEventStore((s) => s.events);
  const jobs = useJobStore((s) => s.jobs);

  const ask = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const context = {
          machines: machines.map((m) => ({
            id: m.id,
            name: m.name,
            status: m.status,
            efficiency: m.efficiency,
          })),
          recentEvents: events.slice(0, 15),
          activeJobs: jobs.filter((j) => j.status === 'IN_PROGRESS'),
        };

        const result = await analyzeFactoryState(context, query);
        setResponse(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [machines, events, jobs]
  );

  const clear = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    response,
    isLoading,
    error,
    ask,
    clear,
  };
}
