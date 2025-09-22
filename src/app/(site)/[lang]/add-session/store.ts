import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Benefit {
  name: string;
}

export interface SessionData {
  // Step 1
  sessionTitle: string;
  sessionCategory: string;
  expertiseLevel: string;
  sessionType: string;
  minParticipants: number;
  maxParticipants: number;

  // Step 2
  sessionDate: Date | null;
  startTime: Date | null;
  timeZone: string;
  duration: number;
  basePrice: number;

  // Step 3
  description: string;
  tags: string[];
  isCircleCommunity: boolean;

  // Step 4
  coverImage: string;
  galleryImages: string[];
  hostImage: string;

  // Additional fields
  userImage?: string;
  userName?: string;
  additionalBenefits: Benefit[];
}

// Add a new type for session expiry
interface SessionExpiry {
  timestamp: number;
  expiryMinutes: number;
}

// Update the interface to include expiry
interface SessionStore {
  sessionData: SessionData;
  localGalleryFiles: File[];
  selectedCoverIndex: number;
  expiry: SessionExpiry;
  validationErrors: {
    [key: string]: string;
  };
  updateValidationErrors: (errors: {[key: string]: string}) => void;
  clearValidationErrors: () => void;
  updateSession: (data: Partial<SessionData>) => void;
  resetSession: () => void;
  setLocalGalleryFiles: (files: File[]) => void;
  setSelectedCoverIndex: (index: number) => void;
  checkAndResetExpiry: () => void;
}

// Set expiry time to 60 minutes
const EXPIRY_MINUTES = 60;

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessionData: {
        // Initialize all fields with default values
        sessionTitle: "",
        sessionCategory: "",
        expertiseLevel: "",
        sessionType: "Group",
        minParticipants: 1,
        maxParticipants: 10,
        sessionDate: null,
        startTime: null,
        timeZone: "CET",
        duration: 1,
        basePrice: 39,
        description: "",
        coverImage: "",
        galleryImages: [],
        hostImage: "",
        tags: [],
        additionalBenefits: [],
        isCircleCommunity: false,
      },
      localGalleryFiles: [],
      selectedCoverIndex: 0, // Default to the first image
      expiry: {
        timestamp: Date.now(),
        expiryMinutes: EXPIRY_MINUTES
      },
      validationErrors: {},
      updateValidationErrors: (errors) => 
        set((state) => ({
          validationErrors: {
            ...state.validationErrors,
            ...errors
          }
        })),
      clearValidationErrors: () => 
        set((state) => ({
          validationErrors: {}
        })),
      updateSession: (data) => {
        const store = get();
        store.checkAndResetExpiry();
        set((state) => ({
          sessionData: {
            ...state.sessionData,
            ...data,
          },
        }));
      },
      resetSession: () => {
        set(() => ({
          sessionData: {
            sessionTitle: "",
            sessionCategory: "",
            expertiseLevel: "",
            sessionType: "Group",
            minParticipants: 1,
            maxParticipants: 10,
            sessionDate: null,
            startTime: null,
            timeZone: "CET",
            duration: 1,
            basePrice: 39,
            description: "",
            coverImage: "",
            galleryImages: [],
            hostImage: "",
            tags: [],
            additionalBenefits: [],
            isCircleCommunity: false,
          },
          localGalleryFiles: [],
          selectedCoverIndex: 0, // Reset to the first image
          expiry: {
            timestamp: Date.now(),
            expiryMinutes: EXPIRY_MINUTES
          }
        }));
      },
      setLocalGalleryFiles: (files) => {
        const store = get();
        store.checkAndResetExpiry();
        set(() => ({
          localGalleryFiles: files,
        }));
      },
      setSelectedCoverIndex: (index) => {
        const store = get();
        store.checkAndResetExpiry();
        set(() => ({
          selectedCoverIndex: index,
        }));
      },
      checkAndResetExpiry: () => {
        const store = get();
        const now = Date.now();
        const expiryTime = store.expiry.timestamp + (store.expiry.expiryMinutes * 60 * 1000);
        
        if (now > expiryTime) {
          store.resetSession();
        } else {
          set(() => ({
            expiry: {
              timestamp: Date.now(),
              expiryMinutes: EXPIRY_MINUTES
            }
          }));
        }
      }
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionData: {
          ...state.sessionData,
          sessionDate: null,
          startTime: null,
          galleryImages: [],
          coverImage: "",
        },
        selectedCoverIndex: state.selectedCoverIndex,
        localGalleryFiles: [],
        expiry: state.expiry
      }),
    }
  )
);
