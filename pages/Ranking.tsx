
import React, { useState, useEffect } from 'react';
import { AppRoute, User } from '../types';
import { getAllUsers } from '../services/firebaseApi';

interface RankingProps {
  user: User;
  navigate: (route: AppRoute) => void;
  isAdmin?: boolean;
  onUpdateUser?: (user: User) => void;
}

const Ranking: React.FC<RankingProps> = ({ user, navigate, isAdmin, onUpdateUser }) => {
  const [type, setType] = useState<'singles' | 'doubles'>('singles');
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, [type]);

  const fetchRanking = async () => {
    try {
      const users = await getAllUsers();
      const sorted = [...users]
        .sort((a, b) => {
          const pointA = type === 'singles' ? (a.singlesPoint || 0) : (a.doublesPoint || 0);
          const pointB = type === 'singles' ? (b.singlesPoint || 0) : (b.doublesPoint || 0);
          if (pointB !== pointA) return pointB - pointA;
          const nameA = a.name || '';
          const nameB = b.name || '';
          if (nameA !== nameB) return nameA.localeCompare(nameB, 'ko');
          const idA = a.studentId || '';
          const idB = b.studentId || '';
          return idA.localeCompare(idB);
        });

      let currentRank = 1;
      let prevPoints: number | null = null;
      let itemsAtRank = 0;

      const ranked = sorted.map((u) => {
        const points = type === 'singles' ? (u.singlesPoint || 0) : (u.doublesPoint || 0);
        if (prevPoints === null || points !== prevPoints) {
          currentRank += itemsAtRank;
          itemsAtRank = 1;
          prevPoints = points;
        } else {
          itemsAtRank += 1;
        }
        return { ...u, rank: currentRank };
      });

      setRanking(ranked);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('모든 점수를 초기화하고 경기 기록을 삭제하시겠습니까?')) return;
    try {
      const { getAllUsers, updateUser, deleteAllMatches, getUser } = await import('../services/firebaseApi');
      const users = await getAllUsers();
      
      // 모든 경기 기록 삭제
      await deleteAllMatches();
      
      // 모든 사용자의 점수를 1500으로 초기화
      const calculateTier = (singlesPoint: number, doublesPoint: number) => {
        const avgPoint = (singlesPoint + doublesPoint) / 2;
        if (avgPoint >= 1550) return 'Gold';
        if (avgPoint >= 1450) return 'Silver';
        return 'Bronze';
      };

      for (const u of users) {
        await updateUser(u.id, {
          singlesPoint: 1500,
          doublesPoint: 1500,
          tier: calculateTier(1500, 1500)
        });
      }
      
      // 현재 사용자 정보 갱신
      if (onUpdateUser) {
        const updatedUser = await getUser(user.id);
        if (updatedUser) {
          onUpdateUser(updatedUser);
        }
      }
      
      window.alert('초기화되었습니다.');
      fetchRanking();
    } catch (e) {
      window.alert('초기화 실패: ' + (e as Error).message);
    }
  };

  const userRank = ranking.find(r => r.id === user.id) || ranking.find(r => r.studentId === user.studentId);
  const userPoints = type === 'singles' ? user.singlesPoint : user.doublesPoint;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 bg-[#0B5B41] text-white px-4 py-4 flex items-center shadow-md">
        <button onClick={() => navigate(AppRoute.HOME)} className="p-2 hover:bg-white/10 rounded-md"><span className="material-symbols-rounded text-white">arrow_back_ios_new</span></button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-lg font-bold">랭킹</h1>
        </div>
        {isAdmin && (
          <button 
            onClick={handleReset}
            className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg"
          >
            초기화
          </button>
        )}
      </header>

      <main className="flex-1 p-5 space-y-6 overflow-y-auto hide-scrollbar pb-24">
        {/* 본인 티어 카드 */}
        <section className="bg-gradient-to-br from-[#0B5B41] to-[#1a4d3d] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full"></div>
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src={user.avatar || '/avatar.png'} className="w-14 h-14 rounded-full border-2 border-white/30" alt={user.name} />
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.tier === 'Gold' ? 'bg-yellow-400/30 text-yellow-100' : 
                      user.tier === 'Silver' ? 'bg-slate-400/30 text-slate-100' :
                      'bg-orange-400/30 text-orange-100'
                    }`}>
                       <span className="material-symbols-rounded text-[14px]">workspace_premium</span>
                       {user.tier}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] opacity-60 uppercase tracking-widest">순위</p>
                   <p className="text-3xl font-bold">#{userRank?.rank || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <p className="text-[10px] uppercase opacity-60 tracking-wider">포인트</p>
                    <p className="text-xl font-bold mt-1">{userPoints?.toLocaleString() || '0'} <span className="text-xs font-normal opacity-70">점</span></p>
                 </div>
              </div>
           </div>
        </section>

        {/* 유형 선택 */}
        <section>
          <div className="flex bg-gray-200 p-1 rounded-lg gap-1">
             <button 
              onClick={() => setType('singles')}
              className={`flex-1 px-3 py-2 text-sm font-bold rounded-md transition-all ${type === 'singles' ? 'bg-white shadow-sm text-[#0B5B41]' : 'text-gray-600 bg-transparent'}`}
             >
               단식
             </button>
             <button 
              onClick={() => setType('doubles')}
              className={`flex-1 px-3 py-2 text-sm font-bold rounded-md transition-all ${type === 'doubles' ? 'bg-white shadow-sm text-[#0B5B41]' : 'text-gray-600 bg-transparent'}`}
             >
               복식
             </button>
          </div>
        </section>

        {/* 랭킹 리스트 */}
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="text-gray-400">로딩 중...</span>
          </div>
        ) : ranking.length === 0 ? (
          <div className="flex justify-center py-8">
            <span className="text-gray-400">랭킹 데이터가 없습니다.</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
             <div className="grid grid-cols-12 px-4 py-3 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2 text-center">순위</div>
                <div className="col-span-7">선수</div>
                <div className="col-span-3 text-right">포인트</div>
             </div>
             <div className="divide-y divide-gray-100">
                {ranking.map((member, idx) => {
                  const points = type === 'singles' ? member.singlesPoint : member.doublesPoint;
                  const isCurrentUser = user.id === member.id;
                  return (
                    <div 
                      key={member.id} 
                      className={`grid grid-cols-12 px-4 py-3.5 items-center transition-colors ${
                        isCurrentUser ? 'bg-green-50 border-l-2 border-green-500' : 'hover:bg-gray-50'
                      }`}
                    >
                       <div className="col-span-2 flex justify-center">
                          {member.rank <= 3 ? (
                            <span className={`material-symbols-rounded text-lg ${member.rank === 1 ? 'text-yellow-500' : member.rank === 2 ? 'text-gray-400' : 'text-orange-600'}`}>
                              workspace_premium
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-gray-400">#{member.rank}</span>
                          )}
                       </div>
                       <div className="col-span-7 flex items-center gap-3">
                          <img src={member.avatar || '/avatar.png'} className="w-8 h-8 rounded-full bg-gray-100" alt={member.name} />
                          <div>
                            <p className={`text-sm font-bold ${isCurrentUser ? 'text-[#0B5B41]' : 'text-gray-800'}`}>
                              {member.name}
                              {isCurrentUser && ' (본인)'}
                            </p>
                            <p className={`text-[10px] font-medium ${
                              member.tier === 'Gold' ? 'text-yellow-600' :
                              member.tier === 'Silver' ? 'text-slate-500' :
                              'text-orange-600'
                            }`}>
                              {member.tier}
                            </p>
                          </div>
                       </div>
                       <div className="col-span-3 text-right">
                          <span className="text-sm font-mono font-bold text-gray-900">{points ? points.toLocaleString() : '-'}</span>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Ranking;
