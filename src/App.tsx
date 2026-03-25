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
  PlusCircle,
  Ghost
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

const PHANTOM_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAYFBMVEWYhuX//fj///mUgeSWhOWSf+SRfeT8+/ju6/Wwoun5+Pjz8Paml+eNeeO2qeqfjuaklOfWz/D29Pfc1vHg2vLKwe6qm+iaieXn4/S/tOyKdePQyO+8sOvDuOzr5/XFvO2COE5gAAAFGUlEQVR4nO2b65ayOgyGJWkLBTkjeJ77v8tdGVFBBptC8Vtr9/03jMhjmubQls3GycnJycnJycnJycnJycnJuthD3yZpxVCITbqtZaIk66wRAr8MxDE75PsgKkIfADw/jIJ9nmw4fsliKNLktIdO3k3dH8GuxvXthYhJFXkdzFAA4T7hq2Ix0STln0AdFgQJX20QEdNd5E8S3bm8qlnHWChk7mkQ/WKFiVgBCeVex0jPQbzYthWLZTXtSSNUJ7u24lnpk4h+qXbcHhJudpSBe1J5B1u2YpgUJkitrbZ2/IqnpSHSjeraWEBi7EB3plcqC87Om8rcTC0UNEuHdn4OZyHdqPJlvYqJ0zwztVDhdklTYXadjdSaakGvErJYgskDfzko/Jk/dHeq80JexeJ8KSYPymWgMN0vhaSgonQRJox0q6b3z71fArnA/ONSMzoB+GEfQlU34Vvuhp/5xQLf6jIVl3orX2MZQC7r+jCwM+zj2UxnzWQHJeeqLRbZgwGKTKgrPC573wDhcS6T1GUK7n06bu83gJf8jhNjg3kyc/qJRLcogLp7lAofv1fyzndQ9j86L9Ogro8rQz1uYncEkA+LiJ5bQTLHVNpj18/+aXC7C/znF4m8B3WYAYWZfrqD3cuD2swNxTPJ8Z8e1IyYQGHqQ7V+DdFz5vNLD+pkDMWagJBb4PRuqeej+a4PZVwoDOfxB6iXNJu2bg3e5jHJRLkMVP97PkNFjz4Fk3tIeNYoolhk+PoG16FKuicdqztU1UHxcz+k78wsxRNq/QTFfbGHy0eaOf8+HNO+dxrOPszobQtcU4EM4+RxK/hJjCobNgPvNK09TXoECE9JfVvXe16B6izlafgDzSJ6nBswdWuvny4Z5j68GDHpwxsYiqWzlgs+M/kG9RQtahpAXemVZz952oCi98iqcLQNRY8IaHnw1IQkt1hITS90qIDajLKN3Zl3g6qohuKVbSZ6OmbSt8300vboGkp30WAGEzV0DuoeO1AlMXQ29g2lSgSan5OrTRMm6uoU91aAymlVp/Wk10JJ2twj9XmmTAXNzfGwhqGIPUO8iqEymqHkGoYiujnSOmIzJuIeFqMssRhD5f+em0NY06J5vMgW1QcoYnHOGtuVucGuqO3+s4WirmvgChVnQN1pT60XLUCuOJn9yElvQe0XCLAnr7TEBJf69MnR/wNk5Lb4SOj2pr0P/LH/g2ewTobaSBBNL6hBPlZs9Jb+NcVq7S0Yv560FFxxZPyMFs67lW8NqF06fVBR4giT0VES7XgO1XEyeMCF49A9TY+9Cc3eSvVHYqqauMWieLhjbLpnxU9aUMqhkE9AQSmGPxAgqA03YoQWFKjBmaq7YN9+2cv2AoB/Sk03HPUs1a7h/D1Ru62Y26bHXUWeme/2a/Xr7eAoQ/wVsvMuj2CT7KMwDMoknXPsGzVWW7oNPTaakcC7vLgOxkcujjNPyGu0V499srEfoNxZLn+udCTijdtJSQyXj2/ubOMc/HG6O1YO8/QOll5f63mFVNk5Ujrt6YMD0ng7fvpQWNbCzgF4NnXyB4pzP/4xrMso9P2wiMpzY+8NBvyzIAG4pm9OjIJtpaxTZvUdFMbGTaWG5zD+Vg5jaP11HRw71qJcJs8sniH/TKXcapjfwzJb7y2OcarsBD1Fu/rLSJv2HZjLPlBZS82qa3lJv/bCUl+Miyar63qbYvxNV3rTv/MSnJOTk5OTk5OTk5OTk5PT/1D/AWp6QhyNaDjCAAAAAElFTkSuQmCC";

const INITIAL_WALLET: Wallet = {
  id: 'wallet-1',
  name: 'Wallet 1',
  totalBalance: 0,
  changeAmount: 0,
  changePercent: 0,
  tokens: DEFAULT_TOKENS,
  stagedRefreshAmount: null,
};

const INITIAL_STATE: AppState = {
  wallets: [INITIAL_WALLET],
  activeWalletId: 'wallet-1',
  userName: '',
  hasCompletedWelcome: false,
  themeColor: '#AB9FF2', // Phantom Purple
};

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('phantom_clone_state_v7');
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
      localStorage.setItem('phantom_clone_state_v7', JSON.stringify(newState));
      return newState;
    }
    return INITIAL_STATE;
  });

  const [showAdmin, setShowAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showWalletSwitcher, setShowWalletSwitcher] = useState(false);
  const [notifications, setNotifications] = useState<StagedNotification[]>([]);
  const [activeNotifications, setActiveNotifications] = useState<StagedNotification[]>([]);
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  const activeWallet = state.wallets.find(w => w.id === state.activeWalletId) || state.wallets[0];

  useEffect(() => {
    localStorage.setItem('phantom_clone_state_v7', JSON.stringify(state));
  }, [state]);

  // Handle scheduled notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const scheduled = notifications.filter(n => n.scheduledAt <= now);
      if (scheduled.length > 0) {
        // Update balances for receive notifications
        scheduled.forEach(n => {
          if (n.type === 'receive') {
            setState(prev => ({
              ...prev,
              wallets: prev.wallets.map(w => w.id === prev.activeWalletId ? {
                ...w,
                totalBalance: w.totalBalance + (n.amount * 100), // Simplified: 1 token = $100 for demo
                tokens: w.tokens.map(t => t.symbol === n.symbol ? { ...t, amount: t.amount + n.amount, value: t.value + (n.amount * 100) } : t)
              } : w)
            }));
          }
        });
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

  if (!state.hasCompletedWelcome) {
    return (
      <WelcomePage 
        themeColor={state.themeColor}
        onComplete={(name) => setState(prev => ({ ...prev, userName: name, hasCompletedWelcome: true }))} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-purple-500/30">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-6 relative z-50">
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
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
          <ActionButton icon={<Plus size={24} />} label="Receive" onClick={() => setShowReceive(true)} />
          <ActionButton icon={<Send size={22} className="-rotate-45 ml-1" />} label="Send" onClick={() => setShowSend(true)} />
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

      {/* Modals */}
      <AnimatePresence>
        {showAdmin && (
          <AdminPanel 
            state={state} 
            setState={setState} 
            onClose={() => setShowAdmin(false)} 
            onScheduleNotification={(n) => setNotifications(prev => [...prev, n])}
          />
        )}
        {showSettings && (
          <SettingsPanel 
            state={state} 
            setState={setState} 
            onClose={() => setShowSettings(false)} 
          />
        )}
        {showReceive && (
          <ReceiveModal 
            activeWallet={activeWallet}
            onClose={() => setShowReceive(false)}
            onSchedule={(n) => setNotifications(prev => [...prev, n])}
            themeColor={state.themeColor}
          />
        )}
        {showSend && (
          <SendModal 
            activeWallet={activeWallet}
            onClose={() => setShowSend(false)}
            onSend={(amount, symbol) => {
              setState(prev => ({
                ...prev,
                wallets: prev.wallets.map(w => w.id === prev.activeWalletId ? {
                  ...w,
                  totalBalance: w.totalBalance - (amount * 100), // Simplified: 1 token = $100 for demo
                  tokens: w.tokens.map(t => t.symbol === symbol ? { ...t, amount: t.amount - amount, value: t.value - (amount * 100) } : t)
                } : w)
              }));
              const n: StagedNotification = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'send',
                amount,
                symbol,
                delaySeconds: 0,
                scheduledAt: Date.now(),
              };
              setActiveNotifications(prev => [...prev, n]);
            }}
            themeColor={state.themeColor}
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

function WelcomePage({ onComplete, themeColor }: { onComplete: (name: string) => void, themeColor: string }) {
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[160px] rounded-full pointer-events-none opacity-10" style={{ backgroundColor: themeColor }} />
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none opacity-5" style={{ backgroundColor: themeColor }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md text-center relative z-10"
      >
        <div className="mb-12 flex justify-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-32 h-32 rounded-[40px] flex items-center justify-center shadow-2xl overflow-hidden p-4"
            style={{ backgroundColor: themeColor, boxShadow: `0 24px 48px -12px ${themeColor}44` }}
          >
            <img 
              src={PHANTOM_LOGO} 
              alt="Phantom" 
              className="w-full h-full object-contain" 
              referrerPolicy="no-referrer" 
            />
          </motion.div>
        </div>
        
        <motion.h1 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-extrabold mb-4 tracking-tight"
        >
          Phantom
        </motion.h1>
        <motion.p 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mb-14 text-xl font-medium"
        >
          A wallet you'll love.
        </motion.p>

        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <div className="text-left">
            <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.25em] ml-3 mb-3 block">Display Name</label>
            <input 
              type="text" 
              placeholder="What's your name?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl px-7 py-6 text-2xl focus:outline-none focus:bg-white/10 transition-all placeholder:text-gray-700"
              style={{ borderColor: name.trim() ? `${themeColor}66` : 'rgba(255,255,255,0.1)' }}
            />
          </div>

          <button 
            onClick={() => name.trim() && onComplete(name.trim())}
            disabled={!name.trim()}
            className="w-full text-black font-black py-6 rounded-3xl text-xl transition-all active:scale-[0.98] shadow-2xl"
            style={{ 
              backgroundColor: themeColor, 
              opacity: name.trim() ? 1 : 0.2,
              boxShadow: name.trim() ? `0 12px 40px -8px ${themeColor}66` : 'none'
            }}
          >
            Create Wallet
          </button>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-xs text-gray-600 font-bold tracking-wide"
        >
          SECURE & DECENTRALIZED
        </motion.p>
      </motion.div>
    </div>
  );
}

function SettingsPanel({ 
  state, 
  setState, 
  onClose 
}: { 
  state: AppState, 
  setState: React.Dispatch<React.SetStateAction<AppState>>,
  onClose: () => void 
}) {
  const [tempName, setTempName] = useState(state.userName);

  const handleSave = () => {
    setState(prev => ({ ...prev, userName: tempName }));
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#1c1c1c] w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="text-gray-400" />
            Settings
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center font-bold text-xl">
              {tempName[0]?.toUpperCase() || 'P'}
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
              <input 
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-transparent border-none p-0 font-bold focus:ring-0 w-full text-lg text-white"
                placeholder="Enter name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Preferences</h3>
            <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/5">
              <SettingsItem icon={<Bell size={18} />} label="Notifications" value="Enabled" />
              <SettingsItem icon={<DollarSign size={18} />} label="Currency" value="USD" />
              <SettingsItem icon={<SlidersHorizontal size={18} />} label="Theme" value="Dark" last />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Theme Color</h3>
            <div className="flex gap-3 px-1">
              {['#AB9FF2', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].map(color => (
                <button 
                  key={color}
                  onClick={() => setState(prev => ({ ...prev, themeColor: color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${state.themeColor === color ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button 
              onClick={handleSave}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              Save Changes
            </button>

            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                  localStorage.removeItem('phantom_clone_state_v7');
                  window.location.reload();
                }
              }}
              className="w-full py-4 text-red-400 font-bold hover:bg-red-400/5 rounded-2xl transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingsItem({ icon, label, value, last }: { icon: React.ReactNode, label: string, value: string, last?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer ${!last ? 'border-bottom border-white/5' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="text-gray-500">{icon}</div>
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-sm text-gray-500">{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className="w-full aspect-square bg-white/5 group-hover:bg-white/10 rounded-2xl flex items-center justify-center transition-colors">
        <div className="text-purple-400 group-active:scale-90 transition-transform">
          {icon}
        </div>
      </div>
      <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">{label}</span>
    </button>
  );
}

function ReceiveModal({ activeWallet, onClose, onSchedule, themeColor }: { activeWallet: Wallet, onClose: () => void, onSchedule: (n: StagedNotification) => void, themeColor: string }) {
  const [amount, setAmount] = useState('100');
  const [symbol, setSymbol] = useState('SOL');
  const [delay, setDelay] = useState('5');

  const handleReceive = () => {
    const n: StagedNotification = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'receive',
      amount: parseFloat(amount) || 0,
      symbol: symbol,
      delaySeconds: parseInt(delay) || 0,
      scheduledAt: Date.now() + (parseInt(delay) || 0) * 1000,
    };
    onSchedule(n);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#1c1c1c] w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Receive Assets</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Select Token</label>
            <div className="flex gap-2">
              {['SOL', 'ETH', 'MATIC'].map(s => (
                <button 
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${symbol === s ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                  style={symbol === s ? { borderColor: themeColor } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Amount to Receive</label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-xl font-bold"
              style={{ borderColor: themeColor + '44' }}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Delay (seconds)</label>
            <input 
              type="number"
              value={delay}
              onChange={(e) => setDelay(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button 
            onClick={handleReceive}
            className="w-full py-4 rounded-2xl font-bold text-black transition-all active:scale-[0.98] mt-4"
            style={{ backgroundColor: themeColor }}
          >
            Schedule Receive
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SendModal({ activeWallet, onClose, onSend, themeColor }: { activeWallet: Wallet, onClose: () => void, onSend: (amount: number, symbol: string) => void, themeColor: string }) {
  const [amount, setAmount] = useState('10');
  const [symbol, setSymbol] = useState('SOL');

  const handleSend = () => {
    onSend(parseFloat(amount) || 0, symbol);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#1c1c1c] w-full max-w-md rounded-3xl p-6 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Send Assets</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Select Token</label>
            <div className="flex gap-2">
              {['SOL', 'ETH', 'MATIC'].map(s => (
                <button 
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${symbol === s ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                  style={symbol === s ? { borderColor: themeColor } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Amount to Send</label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-xl font-bold"
              style={{ borderColor: themeColor + '44' }}
            />
          </div>

          <button 
            onClick={handleSend}
            className="w-full py-4 rounded-2xl font-bold text-black transition-all active:scale-[0.98] mt-4"
            style={{ backgroundColor: themeColor }}
          >
            Send Assets
          </button>
        </div>
      </motion.div>
    </motion.div>
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
    const newTokens = activeWallet.tokens.map(t => t.id === id ? { ...t, ...updates } : t);
    const newTotalBalance = newTokens.reduce((acc, t) => acc + t.value, 0);
    updateActiveWallet({
      tokens: newTokens,
      totalBalance: newTotalBalance
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
