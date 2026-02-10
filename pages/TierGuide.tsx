
import React, { useState } from 'react';
import { AppRoute } from '../types';
import Navigation from '../components/Navigation';

interface TierGuideProps {
  navigate: (route: AppRoute) => void;
}

const TierGuide: React.FC<TierGuideProps> = ({ navigate }) => {
  const [type, setType] = useState<'Singles' | 'Doubles'>('Singles');

  const singlesData = [
    { score: '6–0', winner: '+45', loser: '−45' },
    { score: '6–1', winner: '+41', loser: '−41' },
    { score: '6–2', winner: '+36', loser: '−36' },
    { score: '6–3', winner: '+30', loser: '−30' },
    { score: '6–4', winner: '+24', loser: '−24' },
    { score: '6–5', winner: '+18', loser: '−18' }
  ];

  const doublesData = [
    { score: '6–0', winner: '+15', loser: '−15' },
    { score: '6–1', winner: '+14', loser: '−14' },
    { score: '6–2', winner: '+12', loser: '−12' },
    { score: '6–3', winner: '+10', loser: '−10' },
    { score: '6–4', winner: '+8', loser: '−8' },
    { score: '6–5', winner: '+6', loser: '−6' }
  ];

  const tierThresholds = [
    { tier: 'Gold', min: 1550 },
    { tier: 'Silver', min: 1450 },
    { tier: 'Bronze', min: 0 }
  ];

  const data = type === 'Singles' ? singlesData : doublesData;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 bg-[#0B5B41] text-white px-2 py-4 flex items-center justify-between shadow-md pointer-events-auto">
        <button 
          onClick={() => navigate(AppRoute.HOME)}
          className="w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-lg active:bg-white/20 flex-shrink-0 pointer-events-auto cursor-pointer relative z-50"
          style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
        >
          <span className="material-symbols-rounded text-white text-2xl pointer-events-none">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold flex-1 text-center pointer-events-none">티어 기준</h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto hide-scrollbar pb-24">
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={() => setType('Singles')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${type === 'Singles' ? 'bg-[#0B5B41] text-white' : 'bg-slate-100 text-slate-700'}`}>
            단식
          </button>
          <button onClick={() => setType('Doubles')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${type === 'Doubles' ? 'bg-[#0B5B41] text-white' : 'bg-slate-100 text-slate-700'}`}>
            복식
          </button>
        </div>

        {/* 점수 기준표 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-[#0B5B41]">경기 결과별 점수</h2>
          <div className="space-y-3">
            {data.map((d, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-600">스코어</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{d.score}</p>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <p className="text-sm font-bold text-blue-600">승자</p>
                  <p className="text-lg font-bold text-blue-600 mt-1">{d.winner}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-red-600">패자</p>
                  <p className="text-lg font-bold text-red-600 mt-1">{d.loser}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 티어 기준 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-[#0B5B41]">티어 기준</h2>
          <div className="space-y-3">
            {tierThresholds.map((t, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r rounded-xl border-l-4" 
                style={{
                  background: t.tier === 'Gold' ? 'linear-gradient(to right, #fef3c7, #fef9e7)' : 
                              t.tier === 'Silver' ? 'linear-gradient(to right, #e2e8f0, #f1f5f9)' : 
                              'linear-gradient(to right, #fed7aa, #fef5e7)',
                  borderColor: t.tier === 'Gold' ? '#f59e0b' : 
                               t.tier === 'Silver' ? '#94a3b8' : 
                               '#ea580c'
                }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold" style={{
                      color: t.tier === 'Gold' ? '#f59e0b' : 
                             t.tier === 'Silver' ? '#64748b' : 
                             '#ea580c'
                    }}>
                      {t.tier === 'Gold' ? '👑' : t.tier === 'Silver' ? '🥈' : '🥉'}
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{t.tier}</p>
                      <p className="text-sm text-gray-600">{t.min.toLocaleString()}점 이상</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Navigation activeRoute={AppRoute.TIER_GUIDE} navigate={navigate} />
    </div>
  );
};

export default TierGuide;
