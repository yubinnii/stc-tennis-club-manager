
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
import Navigation from './components/Navigation';
import { signUp, login, getCurrentUser } from './services/firebaseApi';

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
  const [routeHistory, setRouteHistory] = useState<AppRoute[]>([]);

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
    if (!data || !data.studentId || !data.name || !data.password) {
      window.alert('모든 정보를 입력해주세요.');
      return;
    }
    try {
      await signUp(data.name, data.studentId, data.password);
      window.alert('회원가입이 완료되었습니다. 로그인해주세요.');
      setCurrentRoute(AppRoute.LOGIN);
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        window.alert('이미 존재하는 학번입니다.');
      } else {
        window.alert('회원가입에 실패했습니다: ' + e.message);
      }
    }
  };

  const handleLogin = async (data?: Partial<User>) => {
    if (!data || !data.studentId || !data.password) {
      window.alert('학번과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const user = await login(data.studentId, data.password);
      setUser(user);
      setCurrentRoute(AppRoute.HOME);
    } catch (e: any) {
      window.alert('로그인에 실패했습니다: ' + e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await import('./services/firebaseApi').then(m => m.logout());
    } catch (e) {
      console.error(e);
    }
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
        {user && <Navigation activeRoute={currentRoute} navigate={setCurrentRoute} />}
      </div>
    </div>
  );
};

export default App;
