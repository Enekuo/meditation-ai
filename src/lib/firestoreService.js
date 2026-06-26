import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const userRef = (uid) => doc(db, 'users', uid);

export async function getUserData(uid) {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserDoc(uid, profile, generalData = {}, positions = [], settings = {}) {
  await setDoc(userRef(uid), {
    displayName: profile.displayName || '',
    email: profile.email || '',
    photoURL: profile.photoURL || null,
    createdAt: serverTimestamp(),
    generalData,
    positions,
    settings,
  });
}

export async function fsUpdateGeneralData(uid, generalData) {
  await updateDoc(userRef(uid), { generalData });
}

export async function fsUpdatePositions(uid, positions) {
  await updateDoc(userRef(uid), { positions });
}

export async function fsUpdateSettings(uid, settings) {
  await updateDoc(userRef(uid), { settings });
}
