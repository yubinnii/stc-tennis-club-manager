
import React, { useState, useEffect } from 'react';
import { AppRoute } from '../types';
import Navigation from '../components/Navigation';
import { getUserCanball, updateCanballPool, getCanballPool, addCanballToUser, getCanballReceivedUsers } from '../services/firebaseApi';

interface CanBallProps {
  navigate: (route: AppRoute) => void;
  userId: string;
  isAdmin?: boolean;
}

const CanBall: React.FC<CanBallProps> = ({ navigate, userId, isAdmin }) => {
  const [canBallData, setCanBallData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [receivedUsers, setReceivedUsers] = useState<any[]>([]);

  const now = new Date();
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const currentMonth = months[now.getMonth()];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    fetchCanballData();
    if (isAdmin) {
      fetchReceivedUsers();
    }
  }, []);

  const fetchCanballData = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const poolData = await getCanballPool(year, month);
      setCanBallData({
        canBallCount: poolData?.available || 0,
        received: false // TODO: 사용자별 수령 여부 확인
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedUsers = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const users = await getCanballReceivedUsers(year, month);
      setReceivedUsers(users);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReceive = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      // 사용자가 이미 이번 달 캔볼을 수령했는지 확인
      const userCanball = await getUserCanball(userId);
      const alreadyReceived = userCanball.some(
        (cb: any) => cb.year === year && cb.month === month
      );
      
      if (alreadyReceived) {
        window.alert('이미 이번 달 캔볼을 수령했습니다.');
        return;
      }
      
      // 캔볼 풀 확인
      const pool = await getCanballPool(year, month);
      if (!pool || pool.available <= 0) {
        window.alert('수령 가능한 캔볼이 없습니다.');
        return;
      }
      
      // 사용자에게 캔볼 추가
      await addCanballToUser(userId, year, month);
      
      // 풀 수량 감소
      await updateCanballPool(year, month, pool.available - 1);
      
      window.alert('캔볼을 수령했습니다!');
      await fetchCanballData();
      await fetchReceivedUsers();
      setCanBallData((prev: any) => ({ ...prev, received: true }));
    } catch (e) {
      console.error(e);
      window.alert('수령 실패: ' + (e as Error).message);
    }
  };

  const handleAdjust = async () => {
    if (adjustAmount === 0) {
      window.alert('조정 수량을 입력해주세요.');
      return;
    }
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      // 현재 수량 조회
      const currentPool = await getCanballPool(year, month);
      const currentAmount = currentPool?.available || 0;
      
      // 새로운 수량 계산 (현재 수량 + 조정값)
      const newAmount = Math.max(0, currentAmount + adjustAmount);
      
      // 업데이트
      await updateCanballPool(year, month, newAmount);
      
      const changeText = adjustAmount > 0 ? `+${adjustAmount}` : `${adjustAmount}`;
      window.alert(`캔볼 수량이 조정되었습니다. (${currentAmount} → ${newAmount})`);
      setAdjustAmount(0);
      setAdjusting(false);
      
      // 데이터 다시 로드
      await fetchCanballData();
    } catch (e) {
      console.error(e);
      window.alert('조정 실패: ' + (e as Error).message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-50 bg-[#0B5B41] text-white px-4 py-4 flex items-center shadow-md">
        <button onClick={() => navigate(AppRoute.HOME)} className="p-2 hover:bg-white/10 rounded-md"><span className="material-symbols-rounded text-white">arrow_back_ios_new</span></button>
        <div className="flex-1 text-center pr-8">
          <h1 className="text-lg font-bold">캔볼 수령</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto hide-scrollbar pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-full"><p className="text-gray-400">로딩 중...</p></div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-[#0B5B41] to-[#0a4a33] rounded-2xl p-8 shadow-md border border-green-700/20">
              <div className="text-center">
                <p className="text-sm text-white/70 mb-3 font-medium">{currentMonth} 캔볼 가용 수량</p>
                <div className="text-6xl font-bold text-white mb-2">{canBallData?.canBallCount || 0}</div>
                <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-xs text-white/80">현재 남은 캔볼</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleReceive}
                disabled={canBallData?.received}
                className={`w-full py-4 font-bold text-lg rounded-2xl transition-all transform ${
                  canBallData?.received
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#0B5B41] text-white hover:bg-[#0a4a33] active:scale-95 shadow-md'
                }`}
              >
                {canBallData?.received ? '✓ 이미 수령됨' : `${currentMonth} 캔볼 수령하기`}
              </button>
            </div>

            {isAdmin && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span className="material-symbols-rounded text-[#0B5B41] text-xl">tune</span>
                    <h3 className="font-bold text-gray-900">캔볼 수량 관리</h3>
                  </div>
                  {!adjusting ? (
                    <button
                      onClick={() => setAdjusting(true)}
                      className="w-full py-3 bg-[#0B5B41] text-white font-bold rounded-xl hover:bg-[#0a4a33] transition-all"
                    >
                      수량 조정하기
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">조정 수량</label>
                        <p className="text-xs text-gray-500">양수면 추가, 음수면 감소 (예: 5, -3)</p>
                      </div>
                      <input
                        type="number"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                        placeholder="예: 10 또는 -5"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B5B41] focus:ring-2 focus:ring-[#0B5B41]/20"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setAdjusting(false); setAdjustAmount(0); }}
                          className="flex-1 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleAdjust}
                          className="flex-1 py-2 bg-[#0B5B41] text-white font-bold rounded-xl hover:bg-[#0a4a33] transition-all"
                        >
                          적용
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <span className="material-symbols-rounded text-[#0B5B41] text-xl">check_circle</span>
                    <h3 className="font-bold text-gray-900">{currentMonth} 수령 회원 ({receivedUsers.length})</h3>
                  </div>
                  {receivedUsers.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {receivedUsers.map((user) => (
                        <div key={user.userId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                            <p className="text-[10px] text-gray-400">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4">아직 수령한 회원이 없습니다.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Navigation activeRoute={AppRoute.CANBALL} navigate={navigate} />
    </div>
  );
};

export default CanBall;
