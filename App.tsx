
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GAME_ICONS, BET_MULTIPLIER, INITIAL_BALANCE } from './constants';
import { GameStatus, Bet, HistoryItem, WalletState } from './types';
import { Wallet, Trophy, History, Coins, ArrowRight, X, Smartphone, Building2, CreditCard, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [wallet, setWallet] = useState<WalletState>({
    balance: INITIAL_BALANCE,
    totalWon: 0,
    totalBet: 0
  });
  const [currentBets, setCurrentBets] = useState<Bet[]>([]);
  const [selectedBetAmount, setSelectedBetAmount] = useState<number>(100);
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [winningIconId, setWinningIconId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");

  // --- Gemini Integration for Predictions ---
  const fetchPrediction = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a mystical game assistant for a betting game with 12 icons: ${GAME_ICONS.map(i => i.name).join(', ')}. 
        Give a short (1 sentence) mysterious prediction about which icon might be lucky next. Be poetic.`,
      });
      setAiInsight(response.text || "The stars are aligning for a great win.");
    } catch (e) {
      setAiInsight("Fortune favors the bold tonight.");
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  // --- Handlers ---
  const placeBet = (iconId: string) => {
    if (gameStatus !== 'idle') return;
    if (wallet.balance < selectedBetAmount) {
      alert("Insufficient balance!");
      return;
    }

    setWallet(prev => ({
      ...prev,
      balance: prev.balance - selectedBetAmount,
      totalBet: prev.totalBet + selectedBetAmount
    }));

    setCurrentBets(prev => {
      const existing = prev.find(b => b.iconId === iconId);
      if (existing) {
        return prev.map(b => b.iconId === iconId ? { ...b, amount: b.amount + selectedBetAmount } : b);
      }
      return [...prev, { iconId, amount: selectedBetAmount }];
    });
  };

  const clearBets = () => {
    if (gameStatus !== 'idle') return;
    const totalCurrentBet = currentBets.reduce((sum, b) => sum + b.amount, 0);
    setWallet(prev => ({
      ...prev,
      balance: prev.balance + totalCurrentBet,
      totalBet: prev.totalBet - totalCurrentBet
    }));
    setCurrentBets([]);
  };

  const startGame = () => {
    if (currentBets.length === 0 || gameStatus !== 'idle') return;
    
    setGameStatus('spinning');
    
    // Simulate mysterious reveal
    setTimeout(() => {
      const winner = GAME_ICONS[Math.floor(Math.random() * GAME_ICONS.length)];
      setWinningIconId(winner.id);
      setGameStatus('revealing');
      
      setTimeout(() => {
        setGameStatus('result');
        processResult(winner.id);
      }, 2000);
    }, 1500);
  };

  const processResult = (winnerId: string) => {
    const winningBet = currentBets.find(b => b.iconId === winnerId);
    const payout = winningBet ? winningBet.amount * BET_MULTIPLIER : 0;
    
    if (payout > 0) {
      setWallet(prev => ({
        ...prev,
        balance: prev.balance + payout,
        totalWon: prev.totalWon + payout
      }));
    }

    const historyEntry: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      bets: [...currentBets],
      winningIconId: winnerId,
      winAmount: payout,
      payout: payout
    };

    setHistory(prev => [historyEntry, ...prev].slice(0, 20));
    fetchPrediction(); // New prediction for next round
  };

  const resetGame = () => {
    setGameStatus('idle');
    setWinningIconId(null);
    setCurrentBets([]);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 p-2 rounded-xl shadow-lg shadow-yellow-500/20">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500">
            LUCKY SLIP
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <History className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Balance</span>
              <span className="text-lg font-black text-green-400">₹{wallet.balance.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setShowWalletModal(true)}
              className="bg-green-500 hover:bg-green-400 text-black p-2 rounded-xl transition-all shadow-lg shadow-green-500/20"
            >
              <Wallet className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-6xl mx-auto p-6 flex flex-col items-center">
        
        {/* Prediction Banner */}
        <div className="w-full mb-8 glass rounded-3xl p-4 flex items-center justify-center gap-3 border-yellow-500/30">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <p className="italic text-yellow-100 text-center font-medium">"{aiInsight}"</p>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 w-full mb-12">
          {GAME_ICONS.map((icon) => {
            const bet = currentBets.find(b => b.iconId === icon.id);
            const isWinner = winningIconId === icon.id;
            return (
              <button
                key={icon.id}
                disabled={gameStatus !== 'idle'}
                onClick={() => placeBet(icon.id)}
                className={`group relative h-48 rounded-[2.5rem] transition-all duration-300 transform 
                  ${gameStatus === 'idle' ? 'hover:-translate-y-2 active:scale-95' : ''}
                  ${isWinner && gameStatus === 'result' ? 'ring-4 ring-yellow-400 scale-105 shadow-[0_0_50px_rgba(234,179,8,0.5)]' : 'glass hover:bg-white/10'}
                  overflow-hidden flex flex-col items-center justify-center`}
              >
                {/* 3D Background Gradient */}
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${icon.color} group-hover:opacity-20 transition-opacity`} />
                
                {/* Icon Rendering */}
                <span className={`text-7xl mb-2 transition-transform duration-500 ${gameStatus === 'spinning' ? 'animate-bounce' : 'group-hover:scale-110'} animate-float`}>
                  {icon.emoji}
                </span>
                
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                  {icon.name}
                </span>

                {/* Bet Indicator */}
                {bet && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black font-black px-3 py-1 rounded-full text-xs animate-pulse shadow-lg shadow-yellow-500/30">
                    ₹{bet.amount}
                  </div>
                )}

                {/* Status Overlay */}
                {isWinner && gameStatus === 'result' && (
                  <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center">
                    <div className="bg-yellow-500 text-black px-4 py-1 rounded-full font-black text-sm rotate-12">WINNER</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Reveal Mechanism Visual */}
        {gameStatus !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
            <div className="max-w-md w-full glass rounded-[3rem] p-8 border-yellow-500/30 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <h2 className="text-2xl font-black text-yellow-500 mb-8 tracking-widest uppercase italic">
                {gameStatus === 'spinning' ? 'Mixing Slips...' : gameStatus === 'revealing' ? 'Opening Slip...' : 'Result Revealed!'}
              </h2>
              
              {/* Slip Animation */}
              <div className={`relative w-48 h-64 bg-white rounded-lg shadow-2xl transition-all duration-1000 transform 
                ${gameStatus === 'revealing' ? 'rotate-3 scale-110' : ''}
                ${gameStatus === 'spinning' ? 'animate-bounce' : ''}`}>
                <div className="absolute top-0 left-0 w-full h-8 bg-gray-200 rounded-t-lg border-b border-gray-300" />
                <div className="flex flex-col items-center justify-center h-full p-4">
                  {gameStatus === 'revealing' || gameStatus === 'result' ? (
                    <div className="animate-in zoom-in spin-in-90 duration-700 flex flex-col items-center">
                      <span className="text-9xl">{GAME_ICONS.find(i => i.id === winningIconId)?.emoji}</span>
                      <p className="mt-4 text-black font-black text-2xl uppercase tracking-tighter">
                        {GAME_ICONS.find(i => i.id === winningIconId)?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                       <span className="text-4xl animate-pulse text-gray-300 font-black">?</span>
                    </div>
                  )}
                </div>
              </div>

              {gameStatus === 'result' && (
                <div className="mt-12 w-full flex flex-col gap-4">
                   {currentBets.find(b => b.iconId === winningIconId) ? (
                     <div className="text-center">
                        <p className="text-4xl font-black text-green-400 mb-2">YOU WON! 🎉</p>
                        <p className="text-xl text-white">Payout: ₹{currentBets.find(b => b.iconId === winningIconId)!.amount * BET_MULTIPLIER}</p>
                     </div>
                   ) : (
                     <p className="text-center text-red-400 text-2xl font-black italic">Better luck next time!</p>
                   )}
                   <button 
                    onClick={resetGame}
                    className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black text-lg hover:bg-yellow-400 transition-colors mt-4"
                   >
                     CLOSE
                   </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="fixed bottom-0 left-0 w-full glass border-t border-white/10 p-6 z-30">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Bet Multipliers */}
            <div className="flex items-center gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {[10, 50, 100, 500, 1000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setSelectedBetAmount(amt)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${selectedBetAmount === amt ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-400 hover:text-white'}`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={clearBets}
                disabled={gameStatus !== 'idle'}
                className="flex-1 md:flex-none px-6 py-4 rounded-2xl font-black bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all uppercase tracking-widest text-sm"
              >
                Clear
              </button>
              <button 
                onClick={startGame}
                disabled={gameStatus !== 'idle' || currentBets.length === 0}
                className={`flex-1 md:flex-none px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 uppercase tracking-tighter
                  ${gameStatus === 'idle' && currentBets.length > 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:scale-105 shadow-xl shadow-yellow-500/30' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                Place Bets <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            {/* Current Bet Summary */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Stake</span>
                <span className="text-xl font-black text-white">₹{currentBets.reduce((s, b) => s + b.amount, 0)}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Coins className="text-yellow-500" />
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="max-w-md w-full glass rounded-[3rem] p-8 relative">
            <button onClick={() => setShowWalletModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black mb-8 italic">Wallet Hub</h2>
            
            <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-[2.5rem] mb-8 shadow-2xl shadow-green-500/20">
              <div className="flex justify-between items-start mb-6">
                <Building2 className="w-8 h-8 text-white/50" />
                <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Verified User</span>
              </div>
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-1">Available Funds</p>
              <p className="text-5xl font-black text-white tracking-tighter">₹{wallet.balance.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="flex flex-col items-center gap-3 p-6 glass rounded-3xl border-white/5 hover:border-green-500/50 transition-all group">
                <Smartphone className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase text-gray-300">UPI Pay</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 glass rounded-3xl border-white/5 hover:border-blue-500/50 transition-all group">
                <Building2 className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase text-gray-300">Net Bank</span>
              </button>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between p-4 bg-white/5 rounded-2xl items-center border border-white/5">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-yellow-500 w-5 h-5" />
                    <span className="font-bold text-gray-300">Total Winnings</span>
                  </div>
                  <span className="font-black text-green-400">₹{wallet.totalWon.toLocaleString()}</span>
               </div>
               <div className="flex justify-between p-4 bg-white/5 rounded-2xl items-center border border-white/5">
                  <div className="flex items-center gap-3">
                    <Coins className="text-gray-400 w-5 h-5" />
                    <span className="font-bold text-gray-300">Volume Played</span>
                  </div>
                  <span className="font-black text-gray-100">₹{wallet.totalBet.toLocaleString()}</span>
               </div>
            </div>

            <button 
              onClick={() => {
                setWallet(prev => ({ ...prev, balance: prev.balance + 1000 }));
                alert("₹1000 Added via Mock UPI!");
              }}
              className="w-full mt-8 bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-colors shadow-xl"
            >
              ADD ₹1000 INSTANTLY
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="max-w-2xl w-full glass rounded-[3rem] p-8 max-h-[80vh] overflow-hidden flex flex-col relative">
            <button onClick={() => setShowHistoryModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black mb-8 italic">Game History</h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-bold uppercase italic tracking-widest">No rounds played yet</div>
              ) : (
                history.map((item) => {
                  const winner = GAME_ICONS.find(i => i.id === item.winningIconId);
                  return (
                    <div key={item.id} className="glass p-5 rounded-3xl border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="text-4xl w-16 h-16 glass rounded-2xl flex items-center justify-center border-white/10">
                            {winner?.emoji}
                          </div>
                          <div>
                            <p className="font-black text-lg uppercase tracking-tight">{winner?.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`text-xl font-black ${item.winAmount > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                            {item.winAmount > 0 ? `+₹${item.winAmount}` : '- ₹' + item.bets.reduce((s, b) => s + b.amount, 0)}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.winAmount > 0 ? 'Jackpot!' : 'Missed'}</p>
                       </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
