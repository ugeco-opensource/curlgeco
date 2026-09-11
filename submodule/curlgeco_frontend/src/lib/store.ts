"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { APP_STORAGE_KEY, LEGACY_APP_STORAGE_KEY } from "@/lib/runtime-config";
import type {
  AppSettings,
  ChatMessage,
  ChatParams,
  ChatThread,
  EndpointConfig,
  LogEntry,
  TestCase,
  TestResult,
} from "@/lib/types";

const defaultParams: ChatParams = {
  temperature: 0.6,
  maxTokens: 200,
  topP: 1,
  stream: true,
};

const defaultSettings: AppSettings = {
  defaultEndpointId: undefined,
  defaultModelId: undefined,
};

interface AppState {
  endpoints: EndpointConfig[];
  threads: ChatThread[];
  activeThreadId?: string;
  testCases: TestCase[];
  testResults: TestResult[];
  logs: LogEntry[];
  settings: AppSettings;
  addEndpoint: (endpoint: EndpointConfig) => void;
  updateEndpoint: (endpoint: EndpointConfig) => void;
  removeEndpoint: (id: string) => void;
  setDefaultEndpoint: (id?: string) => void;
  addThread: () => ChatThread;
  setActiveThread: (id: string) => void;
  updateThread: (thread: ChatThread) => void;
  removeThread: (id: string) => void;
  addMessage: (threadId: string, message: ChatMessage) => void;
  updateMessage: (threadId: string, messageId: string, content: string) => void;
  setThreadParams: (threadId: string, params: Partial<ChatParams>) => void;
  setThreadSystemPrompt: (threadId: string, prompt: string) => void;
  addTestCase: (testCase: TestCase) => void;
  updateTestCase: (testCase: TestCase) => void;
  removeTestCase: (id: string) => void;
  setTestResults: (results: TestResult[]) => void;
  clearTestResults: () => void;
  addLog: (entry: LogEntry) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const createThread = (): ChatThread => {
  const now = new Date().toISOString();
  return {
    id: nanoid(),
    title: "New Chat",
    systemPrompt: "You are a helpful assistant.",
    messages: [],
    params: { ...defaultParams },
    createdAt: now,
    updatedAt: now,
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      endpoints: [],
      threads: [],
      activeThreadId: undefined,
      testCases: [],
      testResults: [],
      logs: [],
      settings: defaultSettings,
      addEndpoint: (endpoint) =>
        set((state) => ({
          endpoints: [...state.endpoints, endpoint],
        })),
      updateEndpoint: (endpoint) =>
        set((state) => ({
          endpoints: state.endpoints.map((item) =>
            item.id === endpoint.id ? endpoint : item
          ),
        })),
      removeEndpoint: (id) =>
        set((state) => ({
          endpoints: state.endpoints.filter((item) => item.id !== id),
          settings:
            state.settings.defaultEndpointId === id
              ? { ...state.settings, defaultEndpointId: undefined }
              : state.settings,
        })),
      setDefaultEndpoint: (id) =>
        set((state) => ({
          settings: { ...state.settings, defaultEndpointId: id },
        })),
      addThread: () => {
        const thread = createThread();
        set((state) => ({
          threads: [thread, ...state.threads],
          activeThreadId: thread.id,
        }));
        return thread;
      },
      setActiveThread: (id) => set(() => ({ activeThreadId: id })),
      updateThread: (thread) =>
        set((state) => ({
          threads: state.threads.map((item) =>
            item.id === thread.id ? thread : item
          ),
        })),
      removeThread: (id) =>
        set((state) => ({
          threads: state.threads.filter((item) => item.id !== id),
          activeThreadId:
            state.activeThreadId === id
              ? state.threads.find((item) => item.id !== id)?.id
              : state.activeThreadId,
        })),
      addMessage: (threadId, message) =>
        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id !== threadId) return thread;
            const nextMessages = [...thread.messages, message];
            const title =
              thread.title === "New Chat" && message.role === "user"
                ? message.content.slice(0, 32)
                : thread.title;
            return {
              ...thread,
              title,
              messages: nextMessages,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
      updateMessage: (threadId, messageId, content) =>
        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id !== threadId) return thread;
            return {
              ...thread,
              messages: thread.messages.map((msg) =>
                msg.id === messageId ? { ...msg, content } : msg
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        })),
      setThreadParams: (threadId, params) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? { ...thread, params: { ...thread.params, ...params } }
              : thread
          ),
        })),
      setThreadSystemPrompt: (threadId, prompt) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? { ...thread, systemPrompt: prompt }
              : thread
          ),
        })),
      addTestCase: (testCase) =>
        set((state) => ({ testCases: [testCase, ...state.testCases] })),
      updateTestCase: (testCase) =>
        set((state) => ({
          testCases: state.testCases.map((item) =>
            item.id === testCase.id ? testCase : item
          ),
        })),
      removeTestCase: (id) =>
        set((state) => ({
          testCases: state.testCases.filter((item) => item.id !== id),
        })),
      setTestResults: (results) => set(() => ({ testResults: results })),
      clearTestResults: () => set(() => ({ testResults: [] })),
      addLog: (entry) =>
        set((state) => ({ logs: [entry, ...state.logs].slice(0, 250) })),
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
    }),
    {
      name: APP_STORAGE_KEY,
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          if (typeof window === "undefined") return null;
          return localStorage.getItem(key) ?? localStorage.getItem(LEGACY_APP_STORAGE_KEY);
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") return;
          localStorage.setItem(key, value);
          if (key === APP_STORAGE_KEY) {
            localStorage.removeItem(LEGACY_APP_STORAGE_KEY);
          }
        },
        removeItem: (key) => {
          if (typeof window === "undefined") return;
          localStorage.removeItem(key);
        },
      })),
      partialize: (state) => ({
        endpoints: state.endpoints,
        threads: state.threads,
        activeThreadId: state.activeThreadId,
        testCases: state.testCases,
        testResults: state.testResults,
        logs: state.logs,
        settings: state.settings,
      }),
    }
  )
);

export const ensureActiveThread = (threads: ChatThread[], activeId?: string) => {
  if (activeId && threads.some((thread) => thread.id === activeId)) {
    return activeId;
  }
  return threads[0]?.id;
};

export const getEndpointById = (state: AppState, id?: string) =>
  state.endpoints.find((item) => item.id === id);

export const makeSystemMessage = (prompt: string): ChatMessage => ({
  id: nanoid(),
  role: "system",
  content: prompt,
  createdAt: new Date().toISOString(),
});

export const makeUserMessage = (content: string): ChatMessage => ({
  id: nanoid(),
  role: "user",
  content,
  createdAt: new Date().toISOString(),
});

export const makeAssistantMessage = (): ChatMessage => ({
  id: nanoid(),
  role: "assistant",
  content: "",
  createdAt: new Date().toISOString(),
});
