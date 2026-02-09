import React from 'react';
import { AppRoute } from '../types';

interface SignupProps {
  onSignup: (data?: Partial<import('../types').User>) => void;
  navigate: (route: AppRoute) => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, navigate }) => {
  const [name, setName] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'member' | 'admin'>('member');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50 relative overflow-hidden">
      <div className="z-10 w-full flex flex-col items-center">
        <h2 className="font-display text-2xl font-bold mb-6">회원가입</h2>

        <div className="w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="이름" className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl" />
          <input value={studentId} onChange={(e) => setStudentId(e.target.value)} type="text" placeholder="학번" className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="비밀번호" className="w-full p-3 bg-gray-50 border-gray-200 rounded-xl" />

          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest">회원 유형</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="member" checked={role === 'member'} onChange={(e) => setRole(e.target.value as 'member')} />
                <span className="text-sm">일반 회원</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="admin" checked={role === 'admin'} onChange={(e) => setRole(e.target.value as 'admin')} />
                <span className="text-sm">관리자 신청</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate(AppRoute.LOGIN)} className="flex-1 py-3 border border-gray-200 rounded-xl">취소</button>
            <button onClick={() => onSignup({ name, studentId, role })} className="flex-1 py-3 bg-black text-white rounded-xl">회원가입</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
