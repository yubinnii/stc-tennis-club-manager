
import React, { useState, useEffect } from 'react';
import { AppRoute, User } from '../types';

interface HistoryProps {
  navigate: (route: AppRoute) => void;
  isAdmin?: boolean;
  user?: User;
  onUpdateUser?: (user: User) => void;
}

const History: React.FC<HistoryProps> = ({ navigate, isAdmin, user, onUpdateUser }) => {
  const [filter, setFilter] = useState<'Singles' | 'Doubles'>('Singles');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      const resp = await fetch('http://localhost:4000/matches');
      if (resp.ok) {
        const data = await resp.json();
        setMatches(data.filter((m: any) => m.type === filter));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('경기 기록을 삭제하시겠습니까?')) return;
    try {
      const resp = await fetch(`http://localhost:4000/matches/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        window.alert('삭제되었습니다.');
        fetchMatches();
        
        // 사용자 정보 갱신
        if (user && onUpdateUser) {
          try {
            const userResp = await fetch('http://localhost:4000/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ studentId: user.studentId, password: user.studentId })
            });
            if (userResp.ok) {
              const updatedUser = await userResp.json();
              onUpdateUser(updatedUser);
            }
          } catch (e) {
            console.error('사용자 정보 갱신 실패:', e);
          }
        }
      }
    } catch (e) {
      window.alert('삭제 실패');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 bg-[#0B5B41] text-white px-4 py-4 flex items-center shadow-md">
        <button onClick={() => navigate(AppRoute.HOME)} className="p-2 hover:bg-white/10 rounded-md"><span className="material-symbols-rounded text-white">arrow_back_ios_new</span></button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-lg font-bold">경기 기록</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto hide-scrollbar pb-24">
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={() => { setFilter('Singles'); setLoading(true); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${filter === 'Singles' ? 'bg-[#0B5B41] text-white' : 'bg-slate-100 text-slate-700'}`}>
            단식
          </button>
          <button onClick={() => { setFilter('Doubles'); setLoading(true); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${filter === 'Doubles' ? 'bg-[#0B5B41] text-white' : 'bg-slate-100 text-slate-700'}`}>
            복식
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-full"><p className="text-gray-400">로딩 중...</p></div>
        ) : matches.length === 0 ? (
          <div className="flex justify-center items-center h-full"><p className="text-gray-400">경기 기록이 없습니다.</p></div>
        ) : (
          <div className="space-y-3">
            {matches.map((m: any) => (
              <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-end gap-3 justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#0B5B41]">{m.winnerName}</p>
                        {m.winnerNameSecond && <p className="text-lg font-bold text-[#0B5B41]">{m.winnerNameSecond}</p>}
                        <p className="text-2xl font-bold text-gray-900 mt-1">{m.score.split('-')[0]?.trim() || '0'}</p>
                      </div>
                      <div className="text-2xl font-bold text-gray-300">-</div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-600">{m.loserName}</p>
                        {m.loserNameSecond && <p className="text-lg font-bold text-gray-600">{m.loserNameSecond}</p>}
                        <p className="text-2xl font-bold text-gray-900 mt-1">{m.score.split('-')[1]?.trim() || '0'}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">{new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg font-bold text-sm transition">
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
