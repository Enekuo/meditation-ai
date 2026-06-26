import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import {
  getUserData,
  createUserDoc,
  fsUpdateGeneralData,
  fsUpdatePositions,
} from '@/lib/firestoreService';

const GENERAL_KEY = 'portfolio_general_data';
const POSITIONS_KEY = 'portfolio_positions';

const DEFAULT_GENERAL = {
  cash: 0,
  benchmark: 'S&P500',
  benchmarkReturn: 0,
  currency: 'EUR',
  taxDividends: 0,
  taxGains: 0,
};

const PortfolioDataContext = createContext({
  generalData: DEFAULT_GENERAL,
  positions: [],
  isLoading: true,
  saveGeneralData: async () => {},
  savePositions: async () => {},
  migrationPending: false,
  resolveMigration: async () => {},
});

function readFromLocalStorage() {
  try {
    const general = JSON.parse(localStorage.getItem(GENERAL_KEY) || '{}');
    const positions = JSON.parse(localStorage.getItem(POSITIONS_KEY) || '[]');
    return {
      generalData: { ...DEFAULT_GENERAL, ...general },
      positions: Array.isArray(positions) ? positions : [],
    };
  } catch {
    return { generalData: { ...DEFAULT_GENERAL }, positions: [] };
  }
}

function hasLocalData() {
  try {
    const general = JSON.parse(localStorage.getItem(GENERAL_KEY) || '{}');
    const positions = JSON.parse(localStorage.getItem(POSITIONS_KEY) || '[]');
    return (
      Object.keys(general).length > 0 ||
      (Array.isArray(positions) && positions.length > 0)
    );
  } catch {
    return false;
  }
}

export function PortfolioDataProvider({ children }) {
  const { user, isAuthLoading } = useAuth();
  const [generalData, setGeneralData] = useState(DEFAULT_GENERAL);
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [migrationPending, setMigrationPending] = useState(false);
  const loadedUidRef = useRef(null);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      // Guest mode: read from localStorage
      const local = readFromLocalStorage();
      setGeneralData(local.generalData);
      setPositions(local.positions);
      setMigrationPending(false);
      setIsLoading(false);
      loadedUidRef.current = null;
      return;
    }

    const uid = user.uid;
    if (uid === loadedUidRef.current) return;
    loadedUidRef.current = uid;

    setIsLoading(true);
    getUserData(uid)
      .then(async (data) => {
        if (!data) {
          // First login — check for local data to migrate
          if (hasLocalData()) {
            setMigrationPending(true);
            setIsLoading(false);
            return;
          }
          await createUserDoc(
            uid,
            { displayName: user.displayName, email: user.email, photoURL: user.photoURL },
            { ...DEFAULT_GENERAL },
            [],
            {}
          );
          setGeneralData({ ...DEFAULT_GENERAL });
          setPositions([]);
        } else {
          setGeneralData({ ...DEFAULT_GENERAL, ...(data.generalData || {}) });
          setPositions(Array.isArray(data.positions) ? data.positions : []);
        }
        setIsLoading(false);
      })
      .catch(() => {
        // Firestore error: fall back to localStorage
        const local = readFromLocalStorage();
        setGeneralData(local.generalData);
        setPositions(local.positions);
        setIsLoading(false);
      });
  }, [user, isAuthLoading]);

  const resolveMigration = useCallback(
    async (choice) => {
      if (!user) return;
      const uid = user.uid;
      const local = readFromLocalStorage();
      const gData = choice === 'import' ? local.generalData : { ...DEFAULT_GENERAL };
      const gPositions = choice === 'import' ? local.positions : [];

      await createUserDoc(
        uid,
        { displayName: user.displayName, email: user.email, photoURL: user.photoURL },
        gData,
        gPositions,
        {}
      );
      setGeneralData(gData);
      setPositions(gPositions);
      setMigrationPending(false);
      setIsLoading(false);
    },
    [user]
  );

  const saveGeneralData = useCallback(
    async (data) => {
      setGeneralData(data);
      if (user) {
        await fsUpdateGeneralData(user.uid, data).catch(() => {});
      } else {
        localStorage.setItem(GENERAL_KEY, JSON.stringify(data));
      }
      window.dispatchEvent(new CustomEvent('portfolio-updated'));
    },
    [user]
  );

  const savePositions = useCallback(
    async (nextPositions) => {
      setPositions(nextPositions);
      if (user) {
        await fsUpdatePositions(user.uid, nextPositions).catch(() => {});
      } else {
        localStorage.setItem(POSITIONS_KEY, JSON.stringify(nextPositions));
      }
      window.dispatchEvent(new CustomEvent('portfolio-updated'));
    },
    [user]
  );

  return (
    <PortfolioDataContext.Provider
      value={{
        generalData,
        positions,
        isLoading,
        saveGeneralData,
        savePositions,
        migrationPending,
        resolveMigration,
      }}
    >
      {children}
    </PortfolioDataContext.Provider>
  );
}

export const usePortfolioData = () => useContext(PortfolioDataContext);
