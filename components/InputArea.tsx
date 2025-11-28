import React, { useState, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';

interface InputAreaProps {
  onAdd: (text: string) => void;
}

export const InputArea: React.FC<InputAreaProps> = ({ onAdd }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="max-w-md mx-auto flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="添加任务 (例如: 开会, 拿快递)"
            className="w-full pl-4 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Add Button */}
         <button
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-center
            ${inputValue.trim() 
              ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          aria-label="添加"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
        数据保存在本地，不会同步服务器，放心使用
      </div>
    </div>
  );
};