/**
 * セッション管理ストア（Zustand）
 * 各住民の回答・診断結果・進捗を管理
 */

import { create } from 'zustand';

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useStore = create((set) => ({
    receivedSessions: [],

  addReceivedDiagnosis: (sessionData) => {
    set((state) => ({
      receivedSessions: [
        ...state.receivedSessions,
        {
          ...sessionData,
          receivedAt: new Date().toISOString(),
        },
      ],
    }));
  },

  clearReceivedSessions: () => {
    set({ receivedSessions: [] });
  },
  currentSession: {
    id: generateSessionId(),
    userName: '',
    answers: {},
    diagnosis: null,
    progress: 0,
    createdAt: new Date().toISOString(),
    metadata: {},
  },

  sessions: [],
  searchDB: null,

  startSession: (userName) => {
    set((state) => ({
      currentSession: {
        id: generateSessionId(),
        userName,
        answers: {},
        diagnosis: null,
        progress: 0,
        createdAt: new Date().toISOString(),
        metadata: {},
      },
    }));
  },

  addAnswer: (questionId, answer) => {
    set((state) => {
      const totalQuestions = 6; // Q1-Q6
      const answeredCount = Object.keys(state.currentSession.answers).length + 1;
      const progress = Math.round((answeredCount / totalQuestions) * 100);

      return {
        currentSession: {
          ...state.currentSession,
          answers: {
            ...state.currentSession.answers,
            [questionId]: answer,
          },
          progress: Math.min(progress, 100),
        },
      };
    });
  },

  setDiagnosis: (diagnosis) => {
    set((state) => ({
      currentSession: {
        ...state.currentSession,
        diagnosis,
        progress: 100,
      },
    }));
  },

  saveSession: () => {
    set((state) => ({
      sessions: [...state.sessions, state.currentSession],
      currentSession: {
        id: generateSessionId(),
        userName: '',
        answers: {},
        diagnosis: null,
        progress: 0,
        createdAt: new Date().toISOString(),
        metadata: {},
      },
    }));
  },

  uploadSearchDB: (rawData) => {
    set({ searchDB: rawData });
  },

  exportJSON: () => {
    // getCurrentState() で現在のストア状態を取得
    const state = useStore.getState();
    return JSON.stringify(state.currentSession, null, 2);
  },

  getAllSessions: () => {
    return useStore.getState().sessions;
  },
}));
