
import React, { useState, useEffect } from 'react';
import { AppRoute, User } from '../types';
import Navigation from '../components/Navigation';
import { getMatchesByUser } from '../services/firebaseApi';

interface MyScoresProps {
  user: User;
  navigate: (route: AppRoute) => void;
}

const calculatePoints = (type: string, score: string): number => {
  const parts = score.split('-').map(s => parseInt(s.trim()));
  if (parts.length !== 2) return type === 'Singles' ? 30 : 10;
  
  const [winnerScore, loserScore] = parts;
  const diff = winnerScore - loserScore;
  
  if (type === 'Singles') {
    const pointsMap: { [key: number]: number } = {
      6: 45, 5: 41, 4: 36, 3: 30, 2: 24, 1: 18
    };
    return pointsMap[diff] || 30;
  } else {
    const pointsMap: { [key: number]: number } = {
      6: 15, 5: 14, 4: 12, 3: 10, 2: 8, 1: 6
    };
    return pointsMap[diff] || 10;
  }
};

interface ScoreHistory {
  id: string;
  date: string;
  type: 'Singles' | 'Doubles';
  isWinner: boolean;
  pointChange: number;
  finalPoints: number;
  teamMembers: string[];
  opponentMembers: string[];
  score: string;
}

const MyScores: React.FC<MyScoresProps> = ({ user, navigate }) => {
  const [type, setType] = useState<'Singles' | 'Doubles'>('Singles');
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScoreHistory();
  }, [user.id]);

  const fetchScoreHistory = async () => {
    try {
      const matches = await getMatchesByUser(user.id);
      
      let rawHistory = matches.map((m: any) => {
        const isWinner = m.winner.includes(user.id);
        const basePointChange = calculatePoints(m.type, m.score);
        const pointChange = isWinner ? basePointChange : -basePointChange;

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
          opponentMembers,
          score: m.score
        };
      });
      
      rawHistory.sort((a: any, b: any) => a.timestamp - b.timestamp);
      
      const singlesTotal = rawHistory
        .filter((h: any) => h.type === 'Singles')
        .reduce((sum: number, h: any) => sum - h.pointChange, 0);
      const doublesTotal = rawHistory
        .filter((h: any) => h.type === 'Doubles')
        .reduce((sum: number, h: any) => sum - h.pointChange, 0);
      
      let singlesPoints = user.singlesPoint - singlesTotal;
      let doublesPoints = user.doublesPoint - doublesTotal;
      
      const historyWithFinalPoints = rawHistory
        .map((h: any) => {
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
        .sort((a: any, b: any) => b.timestamp - a.timestamp);
      
      setScoreHistory(historyWithFinalPoints);
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
                  {/* 날짜, 점수, 스코어 */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-600">{history.date}</p>
                      <p className="text-xs text-gray-400 mt-1">{history.score}</p>
                    </div>
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
