/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Plus, 
  Send, 
  DollarSign, 
  ChevronDown, 
  QrCode, 
  SlidersHorizontal,
  Bell,
  X,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet as WalletIcon,
  Trash2,
  Edit2,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Token, StagedNotification, AppState, Wallet } from './types';

const OFFICIAL_ICONS = {
  SOL: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  ETH: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  MATIC: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
};

const DEFAULT_TOKENS: Token[] = [
  { id: 'solana', name: 'Solana', symbol: 'SOL', amount: 0, value: 0, icon: OFFICIAL_ICONS.SOL },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', amount: 0, value: 0, icon: OFFICIAL_ICONS.ETH },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', amount: 0, value: 0, icon: OFFICIAL_ICONS.MATIC },
];

const INITIAL_WALLET: Wallet = {
  id: 'wallet-1',
  name: 'Wallet IS',
  totalBalance: 0,
  changeAmount: 0,
  changePercent: 0,
  tokens: DEFAULT_TOKENS,
  stagedRefreshAmount: null,
};

const INITIAL_STATE: AppState = {
  wallets: [INITIAL_WALLET],
  activeWalletId: 'wallet-1',
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('phantom_clone_state_v2');
    if (saved) {
      const parsed = JSON.parse(saved) as AppState;
      // Handle staged refresh for all wallets
      const updatedWallets = parsed.wallets.map(w => {
        if (w.stagedRefreshAmount !== null) {
          return {
            ...w,
            totalBalance: w.stagedRefreshAmount,
            stagedRefreshAmount: null,
          };
        }
        return w;
      });
      const newState = { ...parsed, wallets: updatedWallets };
      localStorage.setItem('phantom_clone_state_v2', JSON.stringify(newState));
      return newState;
    }
    return INITIAL_STATE;
  });

  const [showAdmin, setShowAdmin] = useState(false);
  const [showWalletSwitcher, setShowWalletSwitcher] = useState(false);
  const [notifications, setNotifications] = useState<StagedNotification[]>([]);
  const [activeNotifications, setActiveNotifications] = useState<StagedNotification[]>([]);
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  const activeWallet = state.wallets.find(w => w.id === state.activeWalletId) || state.wallets[0];

  useEffect(() => {
    localStorage.setItem('phantom_clone_state_v2', JSON.stringify(state));
  }, [state]);

  // Handle scheduled notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const scheduled = notifications.filter(n => n.scheduledAt <= now);
      if (scheduled.length > 0) {
        setActiveNotifications(prev => [...prev, ...scheduled]);
        setNotifications(prev => prev.filter(n => n.scheduledAt > now));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [notifications]);

  const handleBalanceClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    
    if (clickCount.current >= 5) {
      setShowAdmin(true);
      clickCount.current = 0;
    } else {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 1000);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const removeNotification = (id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  };

  const switchWallet = (id: string) => {
    setState(prev => ({ ...prev, activeWalletId: id }));
    setShowWalletSwitcher(false);
  };

  const createNewWallet = () => {
    const newId = `wallet-${Date.now()}`;
    const newWallet: Wallet = {
      ...INITIAL_WALLET,
      id: newId,
      name: `Wallet ${state.wallets.length + 1}`,
    };
    setState(prev => ({
      ...prev,
      wallets: [...prev.wallets, newWallet],
      activeWalletId: newId,
    }));
    setShowWalletSwitcher(false);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-6 relative z-50">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Settings size={22} className="text-gray-400" />
        </button>
        
        <div className="relative">
          <div 
            onClick={() => setShowWalletSwitcher(!showWalletSwitcher)}
            className="flex items-center gap-1 cursor-pointer hover:bg-white/5 px-3 py-1 rounded-lg transition-colors"
          >
            <div className="w-4 h-4 bg-blue-400 rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-white rotate-45" />
            </div>
            <span className="font-semibold text-sm">{activeWallet.name}</span>
            <ChevronDown size={14} className={`text-gray-500 transition-transform ${showWalletSwitcher ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {showWalletSwitcher && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-[#1c1c1c] border border-white/10 rounded-2xl shadow-2xl p-2 overflow-hidden"
              >
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {state.wallets.map(w => (
                    <button 
                      key={w.id}
                      onClick={() => switchWallet(w.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${w.id === state.activeWalletId ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="w-8 h-8 bg-blue-400/20 text-blue-400 rounded-lg flex items-center justify-center">
                        <WalletIcon size={18} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{w.name}</p>
                        <p className="text-[10px] text-gray-500">{formatCurrency(w.totalBalance)}</p>
                      </div>
                      {w.id === state.activeWalletId && <CheckCircle2 size={16} className="text-purple-400" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/5 mt-2 pt-2">
                  <button 
                    onClick={createNewWallet}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-purple-400"
                  >
                    <PlusCircle size={18} />
                    <span className="text-sm font-semibold">Add Wallet</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <QrCode size={22} className="text-gray-400" />
        </button>
      </header>

      {/* Main Balance */}
      <main className="flex flex-col items-center mt-8 px-4">
        <div 
          onClick={handleBalanceClick}
          className="cursor-pointer active:scale-95 transition-transform select-none"
        >
          <h1 className="text-[56px] font-bold tracking-tight leading-none">
            {formatCurrency(activeWallet.totalBalance)}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-gray-500 font-medium">
          <span className={activeWallet.changeAmount >= 0 ? 'text-green-400' : 'text-red-400'}>
            {activeWallet.changeAmount >= 0 ? '+' : ''}{formatCurrency(activeWallet.changeAmount)}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs ${activeWallet.changePercent >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
            {activeWallet.changePercent >= 0 ? '+' : ''}{activeWallet.changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-10">
          <ActionButton icon={<Plus size={24} />} label="Receive" />
          <ActionButton icon={<Send size={22} className="-rotate-45 ml-1" />} label="Send" />
          <ActionButton icon={<DollarSign size={24} />} label="Buy" />
        </div>

        {/* Token List */}
        <div className="w-full mt-10 space-y-3">
          {activeWallet.tokens.map((token) => (
            <div key={token.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-black`}>
                  {token.icon ? (
                    <img src={token.icon} alt={token.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center font-bold text-lg ${token.color || 'bg-gray-700'}`}>
                      {token.symbol[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{token.name}</h3>
                  <p className="text-sm text-gray-500">{token.amount} {token.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(token.value)}</p>
                <p className="text-sm text-gray-500">$0.00</p>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors py-4">
          <SlidersHorizontal size={18} />
          <span className="text-sm font-medium">Manage token list</span>
        </button>
      </main>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdmin && (
          <AdminPanel 
            state={state} 
            setState={setState} 
            onClose={() => setShowAdmin(false)} 
            onScheduleNotification={(n) => setNotifications(prev => [...prev, n])}
          />
        )}
      </AnimatePresence>

      {/* Notification System */}
      <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {activeNotifications.map((n) => (
            // @ts-ignore
            <Notification key={n.id} notification={n} onDismiss={() => removeNotification(n.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 group">
      <div className="w-full aspect-square bg-white/5 group-hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors">
        <div className="text-purple-400 group-active:scale-90 transition-transform">
          {icon}
        </div>
      </div>
      <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function AdminPanel({ 
  state, 
  setState, 
  onClose,
  onScheduleNotification
}: { 
  state: AppState, 
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  onClose: () => void,
  onScheduleNotification: (n: StagedNotification) => void
}) {
  const [activeTab, setActiveTab] = useState<'balance' | 'wallets' | 'tokens' | 'notifs'>('balance');
  const activeWallet = state.wallets.find(w => w.id === state.activeWalletId)!;

  const updateActiveWallet = (updates: Partial<Wallet>) => {
    setState(prev => ({
      ...prev,
      wallets: prev.wallets.map(w => w.id === prev.activeWalletId ? { ...w, ...updates } : w)
    }));
  };

  const deleteWallet = (id: string) => {
    if (state.wallets.length <= 1) return;
    setState(prev => {
      const filtered = prev.wallets.filter(w => w.id !== id);
      return {
        ...prev,
        wallets: filtered,
        activeWalletId: id === prev.activeWalletId ? filtered[0].id : prev.activeWalletId
      };
    });
  };

  const addToken = () => {
    const newToken: Token = {
      id: `token-${Date.now()}`,
      name: 'New Token',
      symbol: 'TKN',
      amount: 0,
      value: 0,
      color: 'bg-gray-600'
    };
    updateActiveWallet({ tokens: [...activeWallet.tokens, newToken] });
  };

  const updateToken = (id: string, updates: Partial<Token>) => {
    updateActiveWallet({
      tokens: activeWallet.tokens.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  };

  const deleteToken = (id: string) => {
    updateActiveWallet({
      tokens: activeWallet.tokens.filter(t => t.id !== id)
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#1c1c1c] w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <SlidersHorizontal className="text-purple-400" />
            Admin Panel
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-xl">
          {(['balance', 'wallets', 'tokens', 'notifs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Total Balance ($)</label>
                <input 
                  type="number" 
                  value={activeWallet.totalBalance}
                  onChange={(e) => updateActiveWallet({ totalBalance: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Change ($)</label>
                  <input 
                    type="number" 
                    value={activeWallet.changeAmount}
                    onChange={(e) => updateActiveWallet({ changeAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Change (%)</label>
                  <input 
                    type="number" 
                    value={activeWallet.changePercent}
                    onChange={(e) => updateActiveWallet({ changePercent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Staged Refresh Balance ($)</label>
                <input 
                  type="number" 
                  placeholder="Leave empty for no change"
                  value={activeWallet.stagedRefreshAmount || ''}
                  onChange={(e) => updateActiveWallet({ stagedRefreshAmount: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          )}

          {activeTab === 'wallets' && (
            <div className="space-y-4">
              {state.wallets.map(w => (
                <div key={w.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={w.name}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        wallets: prev.wallets.map(wallet => wallet.id === w.id ? { ...wallet, name: e.target.value } : wallet)
                      }))}
                      className="bg-transparent border-none p-0 font-bold focus:ring-0 w-full"
                    />
                    <p className="text-[10px] text-gray-500">{w.id}</p>
                  </div>
                  <button 
                    onClick={() => deleteWallet(w.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newId = `wallet-${Date.now()}`;
                  setState(prev => ({
                    ...prev,
                    wallets: [...prev.wallets, { ...INITIAL_WALLET, id: newId, name: `Wallet ${prev.wallets.length + 1}` }]
                  }));
                }}
                className="w-full py-3 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add New Wallet
              </button>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-4">
              {activeWallet.tokens.map(t => (
                <div key={t.id} className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black overflow-hidden">
                      {t.icon ? <img src={t.icon} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700" />}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input 
                        type="text"
                        value={t.name}
                        placeholder="Name"
                        onChange={(e) => updateToken(t.id, { name: e.target.value })}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      />
                      <input 
                        type="text"
                        value={t.symbol}
                        placeholder="Symbol"
                        onChange={(e) => updateToken(t.id, { symbol: e.target.value })}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => deleteToken(t.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Amount</label>
                      <input 
                        type="number"
                        value={t.amount}
                        onChange={(e) => updateToken(t.id, { amount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Value ($)</label>
                      <input 
                        type="number"
                        value={t.value}
                        onChange={(e) => updateToken(t.id, { value: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Icon URL</label>
                      <input 
                        type="text"
                        value={t.icon || ''}
                        placeholder="https://..."
                        onChange={(e) => updateToken(t.id, { icon: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addToken}
                className="w-full py-3 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add Custom Token
              </button>
            </div>
          )}

          {activeTab === 'notifs' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => {}} // Local state for notif type handled in component
                  className={`flex-1 py-2 rounded-xl text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30`}
                >
                  Receive
                </button>
                <button 
                  className={`flex-1 py-2 rounded-xl text-sm font-medium bg-white/5 text-gray-400`}
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center italic">Notification settings are temporary per session</p>
              {/* Re-using the logic from previous version for simplicity in this tab */}
              <button 
                onClick={() => {
                  const n: StagedNotification = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'receive',
                    amount: 100,
                    symbol: 'SOL',
                    delaySeconds: 5,
                    scheduledAt: Date.now() + 5000,
                  };
                  onScheduleNotification(n);
                  onClose();
                }}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                Schedule Quick 5s Receive
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all active:scale-[0.98] mt-8"
        >
          Close Panel
        </button>
      </motion.div>
    </motion.div>
  );
}

interface NotificationProps {
  notification: StagedNotification;
  onDismiss: () => void;
}

function Notification({ notification, onDismiss }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#1c1c1c] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 pointer-events-auto cursor-pointer active:scale-[0.98] transition-transform"
      onClick={onDismiss}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notification.type === 'receive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {notification.type === 'receive' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm">
          {notification.type === 'receive' ? 'Received' : 'Sent'} {notification.amount} {notification.symbol}
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          {notification.type === 'receive' ? 'Confirmed transaction' : 'Transaction sent successfully'}
        </p>
      </div>
      <div className="text-gray-600">
        <CheckCircle2 size={20} />
      </div>
    </motion.div>
  );
}
