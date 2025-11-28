import React, { useState, useEffect } from 'react';
import { ShoppingItem, ShoppingHistoryRecord } from './types';
import { InputArea } from './components/InputArea';
import { ShoppingItemRow } from './components/ShoppingItemRow';
import { CheckSquare, PieChart, Archive, History, Clock, ArrowLeft, MessageSquare, Trophy, GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';

const STORAGE_KEY = 'smartshop_items_v1';
const HISTORY_KEY = 'smartshop_history_v1';

// Wrapper component for Reorder.Item to isolate drag controls hooks
interface SortableItemProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ 
  item, 
  onToggle, 
  onDelete 
}) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={controls}
      className="relative"
    >
      <ShoppingItemRow
        item={item}
        onToggle={onToggle}
        onDelete={onDelete}
        dragHandle={
          <div 
            onPointerDown={(e) => {
              if (navigator.vibrate) navigator.vibrate(10);
              controls.start(e);
            }}
            className="touch-none p-2 text-slate-300 hover:text-indigo-500 cursor-grab active:cursor-grabbing"
            title="拖拽排序"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        }
      />
    </Reorder.Item>
  );
};

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [history, setHistory] = useState<ShoppingHistoryRecord[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [viewMode, setViewMode] = useState<'list' | 'history'>('list');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const handleAdd = (text: string) => {
    const newItems = text.split(/[,，\n]/).map(t => t.trim()).filter(Boolean).map(name => ({
      id: crypto.randomUUID(),
      name: name,
      isBought: false,
      category: '默认'
    }));
    // Add new items to the top of the list
    setItems(prev => [...newItems, ...prev]);
  };

  const toggleItem = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isBought: !item.isBought } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle reorder from framer-motion
  const handleReorder = (newPendingOrder: ShoppingItem[]) => {
    // We only reordered the pending items. We need to reconstruct the full list.
    // Full list = New Pending Order + Existing Completed Items
    const completedItems = items.filter(i => i.isBought);
    setItems([...newPendingOrder, ...completedItems]);
  };

  const archiveCompleted = () => {
    const completedItems = items.filter(item => item.isBought);
    if (completedItems.length === 0) return;

    if (confirm(`确定要归档 ${completedItems.length} 个已完成任务到历史记录吗？`)) {
      const record: ShoppingHistoryRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        items: completedItems
      };
      setHistory(prev => [record, ...prev]);
      setItems(prev => prev.filter(item => !item.isBought));
    }
  };
  
  const clearHistory = () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([]);
    }
  };

  const sendFeedback = () => {
    window.location.href = "mailto:?subject=任务清单App建议&body=如果您有好的建议，尽管提：";
  };

  const totalItems = items.length;
  const boughtItems = items.filter(i => i.isBought).length;
  const progress = totalItems === 0 ? 0 : Math.round((boughtItems / totalItems) * 100);
  const isAllCompleted = totalItems > 0 && boughtItems === totalItems;
  
  // Separate items for rendering logic
  const pendingItems = items.filter(i => !i.isBought);
  const completedItems = items.filter(i => i.isBought);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Main View
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen pb-40 bg-slate-50 text-slate-900 font-sans">
        {/* Header */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40">
          <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-800">
                任务清单
              </h1>
            </div>
            
            <div className="flex gap-2">
               <button 
                onClick={sendFeedback}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="如果您有好的建议，尽管提"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('history')}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="历史记录"
              >
                <History className="w-5 h-5" />
              </button>
              <button 
                onClick={archiveCompleted}
                disabled={boughtItems === 0}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30"
                title="归档已完成"
              >
                <Archive className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {totalItems > 0 && (
            <div className="h-1 w-full bg-slate-100">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="max-w-md mx-auto px-4 pt-4">
          
          {/* Completion Banner */}
          {isAllCompleted && (
            <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl mb-4 flex items-center gap-3 shadow-sm animate-fade-in">
              <Trophy className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-bold">恭喜！任务全部完成</p>
                <p className="text-xs text-emerald-600">点击右上角归档按钮保存记录</p>
              </div>
            </div>
          )}

          {/* Stats Card */}
          {totalItems > 0 ? (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">当前进度</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-800">{boughtItems}</span>
                  <span className="text-sm text-slate-400">/ {totalItems} 项</span>
                </div>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center">
                <PieChart className="w-full h-full text-slate-100 absolute" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-emerald-500 opacity-20"
                ></div>
                 <span className="text-xs font-bold text-emerald-600">{progress}%</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-20 text-center px-6">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                 <CheckSquare className="w-8 h-8 text-indigo-200" />
              </div>
              <h2 className="text-xl font-semibold text-slate-700 mb-2">任务清单空空如也</h2>
              <p className="text-slate-400 mb-6 text-sm">
                下方添加任务，开始高效的一天。
              </p>
            </div>
          )}

          {/* Pending Tasks (Sortable) */}
          <div className="mb-6">
            {pendingItems.length > 0 && (
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 flex items-center justify-between">
                <span>待办任务 ({pendingItems.length})</span>
                <span className="text-[10px] font-normal text-slate-400">按住左侧图标拖动排序</span>
              </h3>
            )}
            
            <Reorder.Group 
              axis="y" 
              values={pendingItems} 
              onReorder={handleReorder}
              className="space-y-0"
            >
              {pendingItems.map(item => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                />
              ))}
            </Reorder.Group>
          </div>

          {/* Completed Tasks (Static) */}
          {completedItems.length > 0 && (
            <div className="mt-8 animate-fade-in">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                已完成 ({completedItems.length})
              </h3>
              <div className="space-y-0 opacity-80 grayscale-[30%]">
                {completedItems.map(item => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    onDelete={deleteItem}
                    // No drag handle for completed items
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        <InputArea onAdd={handleAdd} />
      </div>
    );
  }

  // History View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 bg-white border-b border-slate-200 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('list')}
              className="p-1 -ml-1 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <h1 className="text-lg font-bold text-slate-800">
              历史记录
            </h1>
          </div>
          {history.length > 0 && (
             <button 
                onClick={clearHistory}
                className="text-xs text-red-500 font-medium px-2 py-1 bg-red-50 rounded-md"
              >
                清空记录
              </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 pb-12">
        {history.length === 0 ? (
          <div className="text-center mt-20 text-slate-400">
             <Clock className="w-12 h-12 mx-auto mb-3 text-slate-200" />
             <p>暂无历史记录</p>
             <p className="text-xs mt-2">完成任务后点击归档按钮即可保存记录</p>
          </div>
        ) : (
          <div className="space-y-4">
             {history.map(record => (
               <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{formatDate(record.timestamp)}</span>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      完成 {record.items.length} 项
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {record.items.map(item => (
                      <span key={item.id} className="text-sm text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {item.name}
                      </span>
                    ))}
                  </div>
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}