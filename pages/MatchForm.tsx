
import React, { useState, useEffect } from 'react';
import { AppRoute, User } from '../types';
import { getAllUsers, createMatch, getUser, updateUser } from '../services/firebaseApi';

// 점수 계산 로직
function calculatePoints(score: string, isWinner: boolean, isSingles: boolean): number {
  const [winnerScore, loserScore] = score.split('-').map(s => parseInt(s.trim()));
  const diff = winnerScore - loserScore;
  
  if (isSingles) {
    // 단식 점수표
    const pointsMap: { [key: number]: number } = {
      6: 45, 5: 41, 4: 36, 3: 30, 2: 24, 1: 18
    };
    const points = pointsMap[diff] || 18;
    return isWinner ? points : -points;
  } else {
    // 복식 점수표
    const pointsMap: { [key: number]: number } = {
      6: 15, 5: 14, 4: 12, 3: 10, 2: 8, 1: 6
    };
    const points = pointsMap[diff] || 6;
    return isWinner ? points : -points;
  }
}

function calculateTier(singlesPoint: number, doublesPoint: number): 'Gold' | 'Silver' | 'Bronze' {
  const avgPoint = (singlesPoint + doublesPoint) / 2;
  if (avgPoint >= 1550) return 'Gold';
  if (avgPoint >= 1450) return 'Silver';
  return 'Bronze';
}

interface MatchFormProps {
  userId: string;
  user: User;
  navigate: (route: AppRoute) => void;
  onUpdateUser?: (user: User) => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ userId, user, navigate, onUpdateUser }) => {
  const [type, setType] = useState<'Singles' | 'Doubles'>('Singles');
  const [users, setUsers] = useState<any[]>([]);
  const [winnerId, setWinnerId] = useState('');
  const [loserId, setLoserId] = useState('');
  const [winnerIdSecond, setWinnerIdSecond] = useState('');
  const [loserIdSecond, setLoserIdSecond] = useState('');
  const [score, setScore] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (e) {
      console.error(e);
    }
  };

  // Simple searchable select component
  const maskStudentId = (id: string) => {
    if (!id || id.length < 8) return id;
    return id.substring(0, 4) + '####' + id.substring(id.length - 2);
  };

  const SearchSelect: React.FC<{
    value: string;
    onChange: (v: string) => void;
    options: any[];
    placeholder?: string;
  }> = ({ value, onChange, options, placeholder }) => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');

    useEffect(() => {
      setFilter('');
    }, [open]);

    const selected = options.find(o => o.id === value);
    const filtered = options.filter(o => o.name.toLowerCase().includes(filter.toLowerCase()));

    return (
      <div className="relative">
        <input
          type="text"
          value={open ? filter : (selected ? `${selected.name} (${maskStudentId(selected.studentId)})` : '')}
          onFocus={() => setOpen(true)}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg max-h-48 overflow-y-auto shadow-lg">
            {filtered.length === 0 ? (
              <div className="p-2 text-sm text-gray-400">검색 결과가 없습니다.</div>
            ) : (
              filtered.map(o => (
                <button
                  key={o.id}
                  onClick={() => { onChange(o.id); setOpen(false); }}
                  className="w-full text-left p-3 hover:bg-slate-100"
                >
                  <div className="font-medium">{o.name}</div>
                  <div className="text-xs text-gray-400">{maskStudentId(o.studentId)}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!winnerId || !loserId || !score) {
      window.alert('모든 필드를 입력해주세요.');
      return;
    }
    if (type === 'Doubles' && (!winnerIdSecond || !loserIdSecond)) {
      window.alert('복식의 경우 모든 선수를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const isSingles = type === 'Singles';
      
      // 매치 생성
      const now = new Date();
      await createMatch({
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0],
        type,
        winner: type === 'Doubles' ? [winnerId, winnerIdSecond] : [winnerId],
        loser: type === 'Doubles' ? [loserId, loserIdSecond] : [loserId],
        score,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      });

      // 점수 계산 및 업데이트
      const pointChange = calculatePoints(score, true, isSingles);
      const playerIds = type === 'Doubles' 
        ? [winnerId, winnerIdSecond, loserId, loserIdSecond]
        : [winnerId, loserId];

      for (const playerId of playerIds) {
        const player = await getUser(playerId);
        if (!player) continue;

        const isWinner = playerId === winnerId || playerId === winnerIdSecond;
        const points = isWinner ? pointChange : -pointChange;

        let newSinglesPoint = player.singlesPoint;
        let newDoublesPoint = player.doublesPoint;

        if (isSingles) {
          newSinglesPoint = Math.max(0, player.singlesPoint + points);
        } else {
          newDoublesPoint = Math.max(0, player.doublesPoint + points);
        }

        await updateUser(playerId, {
          singlesPoint: newSinglesPoint,
          doublesPoint: newDoublesPoint,
          tier: calculateTier(newSinglesPoint, newDoublesPoint)
        });
      }

      window.alert('경기 결과가 저장되었습니다.');
      setWinnerId('');
      setLoserId('');
      setWinnerIdSecond('');
      setLoserIdSecond('');
      setScore('');
      
      // 현재 사용자 정보 갱신
      const updatedUser = await getUser(user.id);
      if (updatedUser && onUpdateUser) {
        onUpdateUser(updatedUser);
      }
    } catch (e) {
      console.error(e);
      window.alert('저장 실패: ' + (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 bg-[#0B5B41] text-white px-4 py-4 flex items-center shadow-md">
        <button onClick={() => navigate(AppRoute.HOME)} className="p-2 hover:bg-white/10 rounded-md"><span className="material-symbols-rounded text-white">arrow_back_ios_new</span></button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-lg font-bold">경기 결과 입력</h1>
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

        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-bold mb-2">승자</label>
            <SearchSelect value={winnerId} onChange={setWinnerId} options={users} placeholder="이름 또는 학번으로 검색" />
          </div>

          {type === 'Doubles' && (
            <div>
              <label className="block text-sm font-bold mb-2">승자 2</label>
              <SearchSelect value={winnerIdSecond} onChange={setWinnerIdSecond} options={users} placeholder="이름 또는 학번으로 검색" />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2">패자</label>
            <SearchSelect value={loserId} onChange={setLoserId} options={users} placeholder="이름 또는 학번으로 검색" />
          </div>

          {type === 'Doubles' && (
            <div>
              <label className="block text-sm font-bold mb-2">패자 2</label>
              <SearchSelect value={loserIdSecond} onChange={setLoserIdSecond} options={users} placeholder="이름 또는 학번으로 검색" />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2">스코어 (예: 6-4)</label>
            <input value={score} onChange={(e) => setScore(e.target.value)} type="text" placeholder="6-4" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>

          <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 bg-[#0B5B41] text-white font-bold rounded-2xl hover:bg-[#0a4a33] disabled:bg-gray-300 shadow-md">
            {submitting ? '저장 중...' : '결과 저장'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default MatchForm;
