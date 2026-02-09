import React, { useState } from 'react';
import { AppRoute, User } from '../types';
import Navigation from '../components/Navigation';

interface ProfileProps {
  user: User;
  navigate: (route: AppRoute) => void;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, navigate, onLogout }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatar);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // If file is large, resize/compress it client-side to avoid large payloads
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_WIDTH = 1024;

    const readAndSet = (f: File) => {
      const r = new FileReader();
      r.onload = () => setAvatarPreview(String(r.result));
      r.readAsDataURL(f);
    };

    if (file.size > MAX_SIZE) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const ratio = Math.min(1, MAX_WIDTH / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * ratio);
          canvas.height = Math.round(img.height * ratio);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // compress to JPEG at 0.8 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setAvatarPreview(dataUrl);
          } else {
            // fallback
            readAndSet(file);
          }
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      readAndSet(file);
    }
  };

  const handleUpload = async () => {
    if (!avatarPreview) return;
    setUploading(true);
    try {
      const resp = await fetch(`http://localhost:4000/users/${user.id}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarPreview })
      });
      if (!resp.ok) {
        window.alert('업로드에 실패했습니다.');
        return;
      }
      const updated = await resp.json();
      window.alert('프로필 사진이 업데이트되었습니다.');
      // update app-level user if callback provided
      if ((onUpdateUser as any) && typeof onUpdateUser === 'function') {
        onUpdateUser(updated);
      }
      // update local preview and navigate home
      setAvatarPreview(updated.avatar);
      navigate(AppRoute.HOME);
    } catch (e) {
      window.alert('서버에 연결할 수 없습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="bg-[#0B5B41] text-white py-6 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(AppRoute.HOME)} className="p-2 hover:bg-white/10 rounded-md"><span className="material-symbols-rounded">arrow_back_ios_new</span></button>
          <h1 className="text-lg font-bold">내 정보</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto hide-scrollbar pb-24">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <img src={avatarPreview} alt={user.name} className="w-20 h-20 rounded-full object-cover border" />
            <div>
              <p className="font-bold text-lg">{user.name}</p>
              <p className="text-sm text-gray-500">{user.studentId}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <input type="file" accept="image/*" onChange={handleFile} />
            <div className="flex gap-2">
              <button onClick={handleUpload} disabled={uploading} className="py-2 px-4 bg-[#0B5B41] text-white rounded-xl">{uploading ? '업로드중...' : '프로필 업로드'}</button>
              <button onClick={onLogout} className="py-2 px-4 bg-slate-100 rounded-xl">로그아웃</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-4 text-lg">내 티어</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* 단식 티어 */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-center">
              <p className="text-xs font-bold text-gray-500 mb-2">단식</p>
              <div className="flex justify-center mb-2">
                <span className="text-2xl">
                  {user.tier === 'Gold' ? '👑' : user.tier === 'Silver' ? '🥈' : '🥉'}
                </span>
              </div>
              <p className="font-bold text-gray-900">{user.tier}</p>
              <p className="text-xs text-gray-600 mt-1">{user.singlesPoint.toLocaleString()}점</p>
            </div>

            {/* 복식 티어 */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-center">
              <p className="text-xs font-bold text-gray-500 mb-2">복식</p>
              <div className="flex justify-center mb-2">
                <span className="text-2xl">
                  {user.tier === 'Gold' ? '👑' : user.tier === 'Silver' ? '🥈' : '🥉'}
                </span>
              </div>
              <p className="font-bold text-gray-900">{user.tier}</p>
              <p className="text-xs text-gray-600 mt-1">{user.doublesPoint.toLocaleString()}점</p>
            </div>
          </div>
        </div>
      </main>

      <Navigation activeRoute={AppRoute.PROFILE} navigate={navigate} />
    </div>
  );
};

export default Profile;
