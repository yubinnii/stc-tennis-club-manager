
import React, { useState, useEffect } from 'react';
import { AppRoute, User } from '../types';
import Navigation from '../components/Navigation';

interface MyScoresProps {
  user: User;
  navigate: (route: AppRoute) => void;
}

// Backend의 calculatePoints와 동일한 로직
const calculatePoints = (type: string, score: string): number => {
  const parts = score.split('-').map(s => parseInt(s.trim()));
  if (parts.length !== 2) return type === 'Singles' ? 30 : 10;
  
  const [winnerScore, loserScore] = parts;
  
  if (type === 'Singles') {
    switch (loserScore) {
      case 0: return 45;
      case 1: return 41;
      case 2: return 36;
      case 3: return 30;
      case 4: return 24;
      case 5: return 18;
      default: return 30;
    }
  } else {
    switch (loserScore) {
      case 0: return 15;
      case 1: return 14;
      case 2: return 12;
      case 3: return 10;
      case 4: return 8;
      case 5: return 6;
      default: return 10;
    }
  }
};

interface ScoreHistory {
  id: string;
  date: string;
  type: 'Singles' | 'Doubles';
  isWinner: boolean;
  pointChange: number;
  finalPoints: number; // 변화 후 최종 점수
  teamMembers: string[]; // 현재 사용자 팀
  opponentMembers: string[]; // 상대팀
}

const MyScores: React.FC<MyScoresProps> = ({ user, navigate }) => {
  const [type, setType] = useState<'Singles' | 'Doubles'>('Singles');
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScoreHistory();
  }, []);

  const fetchScoreHistory = async () => {
    try {
      const resp = await fetch('http://localhost:4000/matches');
      if (resp.ok) {
        const matches = await resp.json();
        
        // 현재 사용자의 경기만 필터링하고 점수 변화 계산
        let rawHistory = matches
          .filter((m: any) => m.winnerId === user.id || m.loserId === user.id || m.winnerIdSecond === user.id || m.loserIdSecond === user.id)
          .map((m: any) => {
            const isWinner = m.winnerId === user.id || m.winnerIdSecond === user.id;
            
            // calculatePoints 함수를 사용하여 정확한 포인트 계산
            const basePointChange = calculatePoints(m.type, m.score);
            const pointChange = isWinner ? basePointChange : -basePointChange;

            // 현재 사용자가 속한 팀과 상대팀 구성
            let teamMembers: string[] = [];
            let opponentMembers: string[] = [];
            
            if (m.type === 'Singles') {
              if (isWinner) {
                teamMembers = [m.winnerName];
                opponentMembers = [m.loserName];
              } else {
                teamMembers = [m.loserName];
                opponentMembers = [m.winnerName];
              }
            } else {
              if (isWinner) {
                teamMembers = [m.winnerName, m.winnerNameSecond].filter(Boolean);
                opponentMembers = [m.loserName, m.loserNameSecond].filter(Boolean);
              } else {
                teamMembers = [m.loserName, m.loserNameSecond].filter(Boolean);
                opponentMembers = [m.winnerName, m.winnerNameSecond].filter(Boolean);
              }
            }
            
            return {
              id: m.id,
              timestamp: new Date(m.createdAt).getTime(),
              dateStr: new Date(m.createdAt).toLocaleDateString('ko-KR'),
              type: m.type,
              isWinner,
              pointChange,
              teamMembers,
              opponentMembers
            };
          });
        
        // 오래된 것부터 정렬 (점수 누적 계산용)
        rawHistory.sort((a: any, b: any) => a.timestamp - b.timestamp);
        
        // 점수 누적 계산
        let currentSinglesPoints = user.singlesPoint;
        let currentDoublesPoints = user.doublesPoint;
        
        // 오래된 것부터 역산하여 시작점 구하기
        const singlesTotal = rawHistory.filter((h: any) => h.type === 'Singles').reduce((sum: number, h: any) => sum - h.pointChange, 0);
        const doublesTotal = rawHistory.filter((h: any) => h.type === 'Doubles').reduce((sum: number, h: any) => sum - h.pointChange, 0);
        
        let singlesPoints = currentSinglesPoints - singlesTotal;
        let doublesPoints = currentDoublesPoints - doublesTotal;
        
        const historyWithFinalPoints = rawHistory.map((h: any) => {
          if (h.type === 'Singles') {
            singlesPoints += h.pointChange;
            return {
              ...h,
              date: h.dateStr,
              finalPoints: singlesPoints
            };
          } else {
            doublesPoints += h.pointChange;
            return {
              ...h,
              date: h.dateStr,
              finalPoints: doublesPoints
            };
          }
        })
        // 최신순으로 정렬
        .sort((a: any, b: any) => b.timestamp - a.timestamp);
        
        setScoreHistory(historyWithFinalPoints);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = scoreHistory.filter(h => h.type === type);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 bg-[#0B5B41] text-white px-4 py-4 flex items-center shadow-md">
        <button onClick={() => navigate(AppRoute.HOME)} className="p-2 hover:bg-white/10 rounded-md"><span className="material-symbols-rounded text-white">arrow_back_ios_new</span></button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-lg font-bold">내 점수</h1>
        </div>
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

        {loading ? (
          <div className="flex justify-center items-center h-full"><p className="text-gray-400">로딩 중...</p></div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex justify-center items-center h-full"><p className="text-gray-400">점수 기록이 없습니다.</p></div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((history) => (
              <div key={history.id} className={`bg-white p-5 rounded-2xl border-2 shadow-sm hover:shadow-md transition ${history.isWinner ? 'border-blue-400' : 'border-red-400'}`}>
                <div className="space-y-3">
                  {/* 날짜와 점수 */}
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-sm font-bold text-gray-600">{history.date}</p>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`px-3 py-1 rounded-lg font-bold text-sm ${history.pointChange > 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                        {history.pointChange > 0 ? '+' : ''}{history.pointChange}
                      </div>
                      <p className="text-xs text-gray-500">→ {history.finalPoints.toLocaleString()}점</p>
                    </div>
                  </div>

                  {/* 경기 팀 정보 */}
                  <div className="grid grid-cols-3 gap-2 items-center text-center text-sm">
                    {/* 현재 사용자 팀 */}
                    <div>
                      {history.teamMembers.map((name, idx) => (
                        <p key={idx} className="font-bold text-gray-900">{name}</p>
                      ))}
                    </div>

                    {/* vs */}
                    <div>
                      <p className="text-gray-400 font-bold">vs</p>
                    </div>

                    {/* 상대팀 */}
                    <div>
                      {history.opponentMembers.map((name, idx) => (
                        <p key={idx} className="font-bold text-gray-600">{name}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Navigation activeRoute={AppRoute.MY_SCORES} navigate={navigate} />
    </div>
  );
};

export default MyScores;
