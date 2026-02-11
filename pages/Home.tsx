
import React, { useEffect } from 'react';
import { AppRoute, User } from '../types';
import Navigation from '../components/Navigation';

interface HomeProps {
  user: User;
  navigate: (route: AppRoute) => void;
}

const Home: React.FC<HomeProps> = ({ user, navigate }) => {
  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="relative bg-[#0B5B41] text-white pt-10 pb-12 px-6 rounded-b-[3rem] shadow-xl overflow-hidden shrink-0">
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-md mb-4 p-1 overflow-hidden">
            <div className="text-xl font-display font-bold">STC</div>
          </div>
          <h1 className="font-display text-sm tracking-[0.2em] opacity-80 uppercase">SUNGKYUNKWAN UNIV.</h1>
          <h2 className="font-display text-3xl font-bold tracking-wider mt-1 text-center">TENNIS CLUB</h2>

          <div className="mt-6 flex items-center gap-3 bg-white/10 backdrop-blur-lg px-5 py-2.5 rounded-full border border-white/20">
            <img src={user.avatar} className="w-9 h-9 rounded-full border border-white object-cover" alt="Avatar" />
            <div className="text-left">
              <p className="text-[10px] opacity-70 leading-tight">반갑습니다,</p>
              <p className="text-sm font-semibold leading-tight">{user.name} 님</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-8 overflow-y-auto hide-scrollbar pb-24">
        <section>
          <div className="flex justify-between items-center mb-5 px-1">
            <h3 className="text-xl font-bold text-gray-900">대시보드</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate(AppRoute.CANBALL)} className="group relative bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 text-left h-36 flex flex-col justify-between overflow-hidden active:scale-95">
              <div className="absolute top-[-10px] right-[-10px] w-16 h-16 bg-green-50 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              <span className="material-symbols-rounded text-3xl text-green-600 z-10">sports_tennis</span>
              <div className="z-10">
                <p className="font-bold text-lg text-gray-800">캔볼 수령</p>
                <p className="text-[10px] text-gray-400 mt-0.5">이 달의 캔볼 수령</p>
              </div>
            </button>

            <button onClick={() => navigate(AppRoute.MATCH_FORM)} className="group relative bg-[#0B5B41] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all text-left h-36 flex flex-col justify-between overflow-hidden active:scale-95">
              <div className="absolute top-[-10px] right-[-10px] w-16 h-16 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              <span className="material-symbols-rounded text-3xl text-white z-10">edit_note</span>
              <div className="z-10">
                <p className="font-bold text-lg text-white">경기 결과 입력</p>
                <p className="text-[10px] text-white/60 mt-0.5">매치 점수 등록</p>
              </div>
            </button>

            <button onClick={() => navigate(AppRoute.HISTORY)} className="group relative bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 text-left h-36 flex flex-col justify-between overflow-hidden active:scale-95">
              <div className="absolute top-[-10px] right-[-10px] w-16 h-16 bg-blue-50 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              <span className="material-symbols-rounded text-3xl text-blue-600 z-10">history</span>
              <div className="z-10">
                <p className="font-bold text-lg text-gray-800">경기 기록</p>
                <p className="text-[10px] text-gray-400 mt-0.5">지난 경기 보기</p>
              </div>
            </button>

            <button onClick={() => navigate(AppRoute.RANKING)} className="group relative bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 text-left h-36 flex flex-col justify-between overflow-hidden active:scale-95">
              <div className="absolute top-[-10px] right-[-10px] w-16 h-16 bg-amber-50 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              <span className="material-symbols-rounded text-3xl text-amber-500 z-10">leaderboard</span>
              <div className="z-10">
                <p className="font-bold text-lg text-gray-800">랭킹 보기</p>
                <p className="text-[10px] text-gray-400 mt-0.5">티어와 순위 확인</p>
              </div>
            </button>
          </div>
        </section>

        {(user.isAdmin || user.role === 'admin') && (
          <section className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4 px-1 opacity-50">
               <span className="material-symbols-rounded text-sm">admin_panel_settings</span>
               <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">관리자 메뉴</h3>
            </div>
            <button 
              onClick={() => navigate(AppRoute.ADMIN)}
              className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <span className="material-symbols-rounded">person_add</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">가입 승인 대기</p>
                  <p className="text-[10px] text-gray-400">신규 회원 요청 확인</p>
                </div>
              </div>
            </button>
          </section>
        )}
      </main>

      <Navigation activeRoute={AppRoute.HOME} navigate={navigate} />
    </div>
  );
};

export default Home;

