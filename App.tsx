
import React, { useState, useEffect } from 'react';
import { AppRoute, User } from './types';
import Login from './pages/Login';
import Home from './pages/Home';
import CanBall from './pages/CanBall';
import MatchForm from './pages/MatchForm';
import History from './pages/History';
import Ranking from './pages/Ranking';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import TierGuide from './pages/TierGuide';
import MyScores from './pages/MyScores';

const MOCK_USER: User = {
  id: 'user_1',
  name: '김현우',
  studentId: '2023123456',
  rank: 14,
  tier: 'Silver',
  singlesPoint: 1480,
  doublesPoint: 1510,
  isAdmin: true,
  avatar: 'https://picsum.photos/seed/user1/100/100',
  role: 'admin',
  status: 'approved'
};

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.LOGIN);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([MOCK_USER]);

  useEffect(() => {
    // If we're logged in, go home.
    // Simplified for demo: Login/signup set MOCK_USER.
  }, []);

  const createUser = (data: Partial<User>): User => ({
    id: data.id ?? `user_${Date.now()}`,
    name: data.name ?? '회원',
    studentId: data.studentId ?? '0000000000',
    rank: data.rank ?? 999,
    tier: data.tier ?? 'Bronze',
    singlesPoint: data.singlesPoint ?? 1000,
    doublesPoint: data.doublesPoint ?? 1000,
    isAdmin: data.isAdmin ?? false,
    avatar: data.avatar ?? `https://picsum.photos/seed/${Math.floor(Math.random()*10000)}/100/100`,
    role: data.role ?? 'member',
    status: data.status ?? 'approved'
  });

  const handleSignup = async (data?: Partial<User>) => {
    if (!data || !data.studentId || !data.name) return;
    try {
      const resp = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, studentId: data.studentId, password: data.studentId, role: data.role })
      });
      if (resp.status === 201) {
        const result = await resp.json();
        if (result.status === 'pending') {
          window.alert('관리자 신청이 접수되었습니다. 관리자 승인 후 로그인이 가능합니다.');
        } else {
          window.alert('회원가입이 완료되었습니다. 로그인해주세요.');
        }
        setCurrentRoute(AppRoute.LOGIN);
      } else if (resp.status === 409) {
        window.alert('이미 존재하는 학번입니다.');
      } else {
        window.alert('회원가입에 실패했습니다.');
      }
    } catch (e) {
      window.alert('서버에 연결할 수 없습니다.');
    }
  };

  const handleLogin = async (data?: Partial<User>) => {
    if (!data || !data.studentId) {
      // fallback to mock for quick demo
      setUser(MOCK_USER);
      setCurrentRoute(AppRoute.HOME);
      return;
    }

    try {
      const resp = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: data.studentId, password: data.studentId })
      });
      if (!resp.ok) {
        const err = await resp.json();
        if (resp.status === 403 && err.error === 'pending_approval') {
          window.alert('관리자 승인 대기 중입니다. 승인 후 로그인이 가능합니다.');
        } else if (resp.status === 401) {
          window.alert('학번 또는 비밀번호가 올바르지 않습니다.');
        } else {
          window.alert('로그인에 실패했습니다.');
        }
        return;
      }
      const u = await resp.json();
      setUser(u);
      setCurrentRoute(AppRoute.HOME);
    } catch (e) {
      window.alert('서버에 연결할 수 없습니다.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRoute(AppRoute.LOGIN);
  };

  const renderPage = () => {
    if (!user && currentRoute !== AppRoute.LOGIN && currentRoute !== AppRoute.SIGNUP) {
      return <Login onLogin={handleLogin} navigate={setCurrentRoute} />
    }

    switch (currentRoute) {
      case AppRoute.LOGIN:
        return <Login onLogin={handleLogin} navigate={setCurrentRoute} />
      case AppRoute.SIGNUP:
        return <Signup onSignup={handleSignup} navigate={setCurrentRoute} />
      case AppRoute.HOME:
        return <Home user={user!} navigate={setCurrentRoute} />;
      case AppRoute.CANBALL:
        return <CanBall userId={user!.id} isAdmin={user!.isAdmin} navigate={setCurrentRoute} />;
      case AppRoute.PROFILE:
        return <Profile user={user!} navigate={setCurrentRoute} onLogout={handleLogout} onUpdateUser={(u: User) => setUser(u)} />;
      case AppRoute.MATCH_FORM:
        return <MatchForm userId={user!.id} user={user!} navigate={setCurrentRoute} onUpdateUser={(u: User) => setUser(u)} />;
      case AppRoute.HISTORY:
        return <History isAdmin={user!.isAdmin} navigate={setCurrentRoute} user={user!} onUpdateUser={(u: User) => setUser(u)} />;
      case AppRoute.RANKING:
        return <Ranking user={user!} isAdmin={user!.isAdmin} navigate={setCurrentRoute} />;
      case AppRoute.ADMIN:
        return <Admin navigate={setCurrentRoute} />;
      case AppRoute.TIER_GUIDE:
        return <TierGuide navigate={setCurrentRoute} />;
      case AppRoute.MY_SCORES:
        return <MyScores user={user!} navigate={setCurrentRoute} />;
      default:
        return <Home user={user!} navigate={setCurrentRoute} />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-slate-50 dark:bg-black font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#121212] min-h-screen flex flex-col relative shadow-2xl overflow-hidden">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
