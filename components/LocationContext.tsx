"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readUserLocationFromStorage,
  writeUserLocationToStorage,
  USER_LOCATION_STORAGE_KEY,
  type UserLocationData,
} from "@/lib/user-location";

type LocationContextValue = {
  location: UserLocationData | null;
  setLocation: (data: UserLocationData) => void;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<UserLocationData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLocationState(readUserLocationFromStorage());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === USER_LOCATION_STORAGE_KEY || e.key === null) {
        setLocationState(readUserLocationFromStorage());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLocation = useCallback((data: UserLocationData) => {
    writeUserLocationToStorage(data);
    setLocationState(data);
    setModalOpen(false);
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const value = useMemo(
    () => ({
      location,
      setLocation,
      modalOpen,
      openModal,
      closeModal,
    }),
    [location, setLocation, modalOpen, openModal, closeModal],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocationContext must be used within LocationProvider");
  }
  return ctx;
}
