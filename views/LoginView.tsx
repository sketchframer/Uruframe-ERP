
import React, { useState } from 'react';
import { User, Factory, ShieldCheck, Delete } from 'lucide-react';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const verifyPin = (currentPin: string) => {
    const user = users.find(u => u.pin === currentPin);
    if (user) {
      onLogin(user);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        <div className="bg-blue-600 p-6 rounded-[2.5rem] shadow-2xl mb-8">
          <Factory className="w-16 h-16 text-white" />
        </div>
        
        <h1 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-2">STRUCTURA</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-12">Sistema de Gestión de Planta</p>

        <div className="bg-slate-800/50 backdrop-blur-md p-10 rounded-[3rem] border border-slate-700 w-full shadow-2xl">
          <div className="flex justify-center gap-4 mb-10">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  error ? 'bg-red-500 animate-bounce' : 
                  pin.length > i ? 'bg-blue-500 scale-125' : 'bg-slate-700'
                }`} 
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button 
                key={num}
                onClick={() => handleKeyPress(num)}
                className="h-20 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-white font-black text-2xl rounded-2xl transition-all shadow-lg active:scale-95 border-b-4 border-slate-900"
              >
                {num}
              </button>
            ))}
            <div />
            <button 
              onClick={() => handleKeyPress('0')}
              className="h-20 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-white font-black text-2xl rounded-2xl transition-all shadow-lg active:scale-95 border-b-4 border-slate-900"
            >
              0
            </button>
            <button 
              onClick={handleClear}
              className="h-20 bg-slate-900 hover:bg-slate-900/50 text-slate-400 font-black rounded-2xl flex items-center justify-center transition-all"
            >
              <Delete size={32} />
            </button>
          </div>

          {error && (
            <p className="text-center text-red-500 font-black uppercase text-[10px] tracking-widest mt-8 animate-pulse">
              Acceso Denegado - PIN Incorrecto
            </p>
          )}
        </div>

        <div className="mt-12 flex items-center gap-2 text-slate-600">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Acceso Encriptado Estándar FactoryOS</span>
        </div>
      </div>
    </div>
  );
};
