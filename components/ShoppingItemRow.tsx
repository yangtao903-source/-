import React, { ReactNode } from 'react';
import { ShoppingItem } from '../types';
import { Check, Trash2 } from 'lucide-react';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  dragHandle?: ReactNode;
}

export const ShoppingItemRow: React.FC<ShoppingItemRowProps> = ({ item, onToggle, onDelete, dragHandle }) => {
  return (
    <div 
      className={`group flex items-center justify-between p-3 mb-2 rounded-xl transition-all duration-300 border
        ${item.isBought 
          ? 'bg-slate-50 border-transparent opacity-60' 
          : 'bg-white border-slate-100 shadow-sm hover:border-indigo-100'}`}
    >
      <div className="flex items-center flex-1 min-w-0">
        {/* Drag Handle (if provided) */}
        {dragHandle && (
          <div className="mr-2 -ml-1">
            {dragHandle}
          </div>
        )}

        <div 
          className="flex items-center flex-1 cursor-pointer min-w-0" 
          onClick={() => onToggle(item.id)}
        >
          <div 
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-colors duration-200
              ${item.isBought 
                ? 'bg-emerald-500 border-emerald-500' 
                : 'border-slate-300 group-hover:border-indigo-400'}`}
          >
            {item.isBought && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </div>
          
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span 
              className={`text-base font-medium transition-all duration-200 truncate pr-2
                ${item.isBought ? 'text-slate-400 line-through' : 'text-slate-800'}`}
            >
              {item.name}
            </span>
            {item.category && item.category !== '默认' && (
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 truncate">
                {item.category}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="p-2 text-slate-300 hover:text-red-400 transition-colors focus:outline-none md:opacity-0 md:group-hover:opacity-100 active:opacity-100 shrink-0" 
        aria-label="删除"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};