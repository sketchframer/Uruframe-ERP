import { useState } from 'react';
import { Factory, ShieldCheck } from 'lucide-react';
import { useAuth, PinPad } from '@/features/auth';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login } = useAuth();
  const [error, setError] = useState(false);

  const handlePinComplete = async (pin: string) => {
    const result = await login(pin);
    if (result.success) {
      onLoginSuccess?.();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-2xl mb-8">
          <Factory className="w-16 h-16 text-white" />
        </div>

        <h1 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-2">
          STRUCTURA
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-12">
          Sistema de Gestión de Planta
        </p>

        <div className="w-full">
          <PinPad onComplete={handlePinComplete} error={error} />
        </div>

        {error && (
          <p className="text-center text-red-500 font-black uppercase text-[10px] tracking-widest mt-8 animate-pulse">
            Acceso Denegado - PIN Incorrecto
          </p>
        )}

        <div className="mt-12 flex items-center gap-2 text-slate-600">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Acceso Encriptado Estándar FactoryOS
          </span>
        </div>
      </div>
    </div>
  );
}
