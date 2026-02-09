
import React from 'react';
import { AppRoute } from '../types';

interface LoginProps {
  onLogin: (data?: Partial<import('../types').User>) => void;
  navigate: (route: AppRoute) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, navigate }) => {
  const [studentId, setStudentId] = React.useState('');
  const [password, setPassword] = React.useState('');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      <div className="z-10 w-full flex flex-col items-center">
        <div className="mb-8 w-32 h-32 bg-[#0B5B41] rounded-full flex items-center justify-center shadow-xl border-4 border-white">
           <div className="text-white font-display text-4xl font-bold">STC</div>
        </div>

        <div className="text-center mb-10">
          <h2 className="font-display text-xs tracking-[0.3em] text-gray-400 uppercase border-b border-gray-200 pb-2 mb-2">SungKyunKwan Univ.</h2>
          <h1 className="font-display text-4xl font-bold text-gray-900 tracking-widest">TENNIS CLUB</h1>
        </div>

        <div className="w-full bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">학번</label>
            <input 
              type="text" 
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 2023123456" 
              className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B5B41] focus:border-transparent"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">비밀번호</label>
              <button className="text-[10px] text-gray-400 hover:text-gray-600 underline">비밀번호를 잊으셨나요?</button>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-4 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B5B41] focus:border-transparent"
            />
          </div>

          <button 
            onClick={() => onLogin({ studentId })}
            className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all transform active:scale-[0.98] tracking-widest uppercase"
          >
            로그인
          </button>

          <div className="relative pt-4 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-gray-100"></div>
            <span className="relative px-4 bg-white text-[10px] text-gray-400 uppercase tracking-widest">처음이신가요?</span>
          </div>

          <button onClick={() => navigate(AppRoute.SIGNUP)} className="w-full py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            회원가입
          </button>
        </div>

        <p className="mt-12 text-[10px] uppercase tracking-widest text-gray-300 font-medium">
          © 2026 SUNGKYUNKWAN UNIVERSITY TENNIS CLUB
        </p>
      </div>
    </div>
  );
};

export default Login;
