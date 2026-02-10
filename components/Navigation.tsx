
import React from 'react';
import { AppRoute } from '../types';

interface NavigationProps {
  activeRoute: AppRoute;
  navigate: (route: AppRoute) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeRoute, navigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-2 py-4 pb-8 flex justify-around items-center z-50 max-w-md mx-auto pointer-events-auto">
      <button 
        onClick={() => navigate(AppRoute.HOME)}
        className={`flex flex-col items-center gap-1.5 transition-colors pointer-events-auto ${activeRoute === AppRoute.HOME ? 'text-[#0B5B41]' : 'text-slate-300'}`}
      >
        <span className={`material-symbols-rounded text-2xl ${activeRoute === AppRoute.HOME ? 'filled' : ''}`}>home</span>
        <span className="text-[10px] font-bold">홈</span>
      </button>

      <button 
        onClick={() => navigate(AppRoute.TIER_GUIDE)}
        className={`flex flex-col items-center gap-1.5 transition-colors pointer-events-auto ${activeRoute === AppRoute.TIER_GUIDE ? 'text-[#0B5B41]' : 'text-slate-300'}`}
      >
        <span className={`material-symbols-rounded text-2xl ${activeRoute === AppRoute.TIER_GUIDE ? 'filled' : ''}`}>info</span>
        <span className="text-[10px] font-bold">티어기준</span>
      </button>

      <div className="relative -top-8">
        <button 
          onClick={() => navigate(AppRoute.MATCH_FORM)}
          className="w-14 h-14 bg-[#0B5B41] text-white rounded-full shadow-lg shadow-green-900/30 flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all pointer-events-auto"
        >
          <span className="material-symbols-rounded text-3xl">add</span>
        </button>
      </div>

      <button 
        onClick={() => navigate(AppRoute.MY_SCORES)}
        className={`flex flex-col items-center gap-1.5 transition-colors pointer-events-auto ${activeRoute === AppRoute.MY_SCORES ? 'text-[#0B5B41]' : 'text-slate-300'}`}
      >
        <span className={`material-symbols-rounded text-2xl ${activeRoute === AppRoute.MY_SCORES ? 'filled' : ''}`}>trending_up</span>
        <span className="text-[10px] font-bold">내 점수</span>
      </button>

      <button 
        onClick={() => navigate(AppRoute.PROFILE)}
        className={`flex flex-col items-center gap-1.5 transition-colors pointer-events-auto ${activeRoute === AppRoute.PROFILE ? 'text-[#0B5B41]' : 'text-slate-300'}`}
      >
        <span className={`material-symbols-rounded text-2xl ${activeRoute === AppRoute.PROFILE ? 'filled' : ''}`}>person</span>
        <span className="text-[10px] font-bold">내 정보</span>
      </button>
    </nav>
  );
};

export default Navigation;
