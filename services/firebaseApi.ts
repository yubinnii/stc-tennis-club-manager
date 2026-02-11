import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, MatchRecord, ApprovalRequest } from '../types';

// ============ 유틸 함수 ============

function calculateTier(singlesPoint: number, doublesPoint: number): 'Gold' | 'Silver' | 'Bronze' {
  const avgPoint = (singlesPoint + doublesPoint) / 2;
  if (avgPoint >= 1550) return 'Gold';
  if (avgPoint >= 1450) return 'Silver';
  return 'Bronze';
}

// ============ 인증 ============

export const signUp = async (name: string, studentId: string, password: string, role: 'member' | 'admin' = 'member') => {
  const email = `${studentId}@stc-tennis.local`;
  console.log('SignUp called with role:', role);
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  const singlesPoint = 1500;
  const doublesPoint = 1500;
  
  const newUser: User = {
    id: userCredential.user.uid,
    name,
    studentId,
    rank: 0,
    tier: calculateTier(singlesPoint, doublesPoint),
    singlesPoint,
    doublesPoint,
    isAdmin: false,
    avatar: '/default-profile.png',
    role,
    status: 'pending',
  };
  
  console.log('Creating user with role:', newUser.role);
  await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
  
  // 승인 요청 생성
  const approvalId = `approval_${Date.now()}`;
  await setDoc(doc(db, 'approvals', approvalId), {
    id: approvalId,
    userId: userCredential.user.uid,
    name,
    studentId,
    role,
    status: 'pending',
    createdAt: new Date().toISOString(),
    avatar: '/default-profile.png',
  });
  
  return newUser;
};

export const login = async (studentId: string, password: string) => {
  const email = `${studentId}@stc-tennis.local`;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  return userDoc.data() as User;
};

export const logout = async () => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        resolve(userDoc.data() as User | null);
      } else {
        resolve(null);
      }
      unsubscribe();
    });
  });
};

// ============ 유저 관리 ============

export const getUser = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.data() as User | undefined;
};

export const getUserByStudentId = async (studentId: string) => {
  const q = query(collection(db, 'users'), where('studentId', '==', studentId));
  const snapshot = await getDocs(q);
  return snapshot.docs[0]?.data() as User | undefined;
};

export const getAllUsers = async () => {
  const q = query(collection(db, 'users'), orderBy('rank', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as User);
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  await updateDoc(doc(db, 'users', userId), updates as any);
};

// ============ 매치 기록 ============

export const createMatch = async (matchData: Omit<MatchRecord, 'id'>) => {
  const matchId = `match_${Date.now()}`;
  await setDoc(doc(db, 'matches', matchId), {
    id: matchId,
    ...matchData,
  });
  return matchId;
};

export const getMatches = async () => {
  const q = query(collection(db, 'matches'), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as MatchRecord);
};

export const getMatchesByUser = async (userId: string) => {
  const q = query(
    collection(db, 'matches'),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => doc.data() as MatchRecord)
    .filter((match) => match.winner.includes(userId) || match.loser.includes(userId));
};

export const updateMatch = async (matchId: string, updates: Partial<MatchRecord>) => {
  await updateDoc(doc(db, 'matches', matchId), updates as any);
};

export const deleteMatch = async (matchId: string) => {
  await deleteDoc(doc(db, 'matches', matchId));
};

// ============ 승인 요청 ============

export const getApprovals = async (): Promise<ApprovalRequest[]> => {
  const q = query(
    collection(db, 'approvals'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ApprovalRequest);
};

export const approveUser = async (approvalId: string, userId: string, role: 'admin' | 'member' = 'member') => {
  await updateDoc(doc(db, 'approvals', approvalId), { status: 'approved' });
  await updateDoc(doc(db, 'users', userId), {
    role,
    status: 'approved',
  });
};

export const rejectUser = async (approvalId: string) => {
  await updateDoc(doc(db, 'approvals', approvalId), { status: 'rejected' });
};

// ============ Can Ball 풀 관리 ============

export const getCanballPool = async (year: number, month: number) => {
  const q = query(
    collection(db, 'canball_pool'),
    where('year', '==', year),
    where('month', '==', month)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs[0]?.data() || null;
};

export const updateCanballPool = async (year: number, month: number, available: number) => {
  const existing = await getCanballPool(year, month);
  const docId = existing?.id || `pool_${year}_${month}`;
  
  await setDoc(doc(db, 'canball_pool', docId), {
    id: docId,
    year,
    month,
    available,
    createdAt: new Date().toISOString(),
  });
};

export const getUserCanball = async (userId: string) => {
  const q = query(collection(db, 'canball_user'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
};

export const addCanballToUser = async (userId: string, year: number, month: number) => {
  const docId = `canball_${userId}_${year}_${month}`;
  await setDoc(doc(db, 'canball_user', docId), {
    id: docId,
    userId,
    year,
    month,
    createdAt: new Date().toISOString(),
  });
};

export const getCanballReceivedUsers = async (year: number, month: number) => {
  const q = query(
    collection(db, 'canball_user'),
    where('year', '==', year),
    where('month', '==', month)
  );
  const snapshot = await getDocs(q);
  const canballRecords = snapshot.docs.map((doc) => doc.data());
  
  // 각 기록에 대해 사용자 정보 조회
  const usersWithInfo = await Promise.all(
    canballRecords.map(async (record: any) => {
      const user = await getUser(record.userId);
      return {
        userId: record.userId,
        name: user?.name,
        avatar: user?.avatar,
        studentId: user?.studentId,
        createdAt: record.createdAt,
      };
    })
  );
  
  return usersWithInfo;
};

// ============ 프로필 이미지 업로드 ============

export const uploadAvatar = async (userId: string, avatarDataUrl: string) => {
  // Firestore에 Base64 데이터로 직접 저장
  await updateDoc(doc(db, 'users', userId), {
    avatar: avatarDataUrl
  });
  
  return avatarDataUrl;
};
