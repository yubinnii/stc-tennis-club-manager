
import React, { useEffect, useState } from 'react';
import { AppRoute, ApprovalRequest } from '../types';
import Navigation from '../components/Navigation';
import { getAllApprovals, approveUser, rejectUser } from '../services/firebaseApi';

interface AdminProps {
  navigate: (route: AppRoute) => void;
}

const Admin: React.FC<AdminProps> = ({ navigate }) => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    const fetchApprovalsData = async () => {
      try {
        const data = await getAllApprovals();
        setApprovals(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovalsData();
  }, []);

  const fetchApprovalsData = async () => {
    try {
      const data = await getAllApprovals();
      setApprovals(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (id: string, userId: string, role: 'admin' | 'member') => {
    try {
      await approveUser(id, userId, role);
      window.alert('승인되었습니다.');
      await fetchApprovalsData();
    } catch (e) {
      window.alert('승인 실패');
    }
  };

  const handleReject = async (id: string, userId: string) => {
    try {
      await rejectUser(id, userId);
      window.alert('거절되었습니다.');
      await fetchApprovalsData();
    } catch (e) {
      window.alert('거절 실패');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="relative bg-[#0B5B41] text-white pt-8 pb-10 px-6 rounded-b-[2rem] shadow-lg overflow-hidden shrink-0">
        <div className="relative z-10 flex items-center gap-4">
          <button onClick={() => navigate(AppRoute.HOME)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <span className="material-symbols-rounded text-white">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold text-white">관리자 가입 승인</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto hide-scrollbar pb-24">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setTab('pending')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${tab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
              가입 대기
            </button>
            <button onClick={() => setTab('approved')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${tab === 'approved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
              승인됨
            </button>
            <button onClick={() => setTab('rejected')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${tab === 'rejected' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
              거절됨
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">로딩 중...</p>
          </div>
        ) : tab === 'pending' ? (
          approvals.filter(a => !a.status || a.status === 'pending').length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-400">승인 대기 중인 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.filter(a => !a.status || a.status === 'pending').map(req => (
                <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {req.avatar ? (
                        <img src={req.avatar} className="w-12 h-12 rounded-full border border-gray-100" alt="Av" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {req.name[0]}
                        </div>
                      )}
                      {req.role === 'admin' && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-100 border border-white rounded-full flex items-center justify-center text-purple-600">
                          <span className="material-symbols-rounded text-[12px]">verified_user</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900">{req.name}</h3>
                      <p className="text-[10px] text-gray-400">학번: {req.studentId}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold ${req.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                        {req.role === 'admin' ? '관리자 신청' : '일반 회원'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleReject(req.id, req.userId || '')} className="flex-1 py-2.5 bg-gray-50 text-gray-500 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-rounded text-lg">close</span>
                      거절
                    </button>
                    <button onClick={() => handleApprove(req.id, req.userId || '', req.role as 'admin' | 'member')} className="flex-1 py-2.5 bg-[#0B5B41] text-white font-bold text-sm rounded-xl hover:bg-[#0a4a33] transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-rounded text-lg">check</span>
                      승인
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'approved' ? (
          approvals.filter(a => a.status === 'approved').length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-400">승인됨 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.filter(a => a.status === 'approved').map(req => (
                <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {req.avatar ? (
                        <img src={req.avatar} className="w-12 h-12 rounded-full border border-gray-100" alt="Av" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {req.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900">{req.name}</h3>
                      <p className="text-[10px] text-gray-400">학번: {req.studentId}</p>
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-600">승인됨</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          approvals.filter(a => a.status === 'rejected').length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-400">거절됨 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.filter(a => a.status === 'rejected').map(req => (
                <div key={req.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {req.avatar ? (
                        <img src={req.avatar} className="w-12 h-12 rounded-full border border-gray-100" alt="Av" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {req.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-900">{req.name}</h3>
                      <p className="text-[10px] text-gray-400">학번: {req.studentId}</p>
                      <div className="mt-1.5 inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600">거절됨</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>

      <Navigation activeRoute={AppRoute.ADMIN} navigate={navigate} />
    </div>
  );
};

export default Admin;
