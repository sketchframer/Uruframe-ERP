import React, { useState } from 'react';
import { Delete } from 'lucide-react';

interface PinPadProps {
  onComplete: (pin: string) => void;
  error?: boolean;
}

export const PinPad: React.FC<PinPadProps> = ({ onComplete, error }) => {
  const [pin, setPin] = useState('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        onComplete(newPin);
        setPin('');
      }
    }
  };

  const handleClear = () => setPin('');

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-10 rounded-[3rem] border border-slate-700">
      <div className="flex justify-center gap-4 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              error
                ? 'bg-red-500 animate-bounce'
                : pin.length > i
                  ? 'bg-blue-500 scale-125'
                  : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleKeyPress(num)}
            className="h-20 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-white font-black text-2xl rounded-2xl transition-all shadow-lg active:scale-95 border-b-4 border-slate-900"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          type="button"
          onClick={() => handleKeyPress('0')}
          className="h-20 bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-white font-black text-2xl rounded-2xl transition-all shadow-lg active:scale-95 border-b-4 border-slate-900"
        >
          0
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="h-20 bg-slate-900 hover:bg-slate-900/50 text-slate-400 font-black rounded-2xl flex items-center justify-center"
        >
          <Delete size={32} />
        </button>
      </div>
    </div>
  );
};
