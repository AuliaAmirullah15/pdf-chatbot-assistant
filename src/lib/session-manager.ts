import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export interface SessionData {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  documents: Map<string, any>;
  chatHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  vectorStore: any;
}

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up inactive sessions every 30 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 30 * 60 * 1000);
  }

  async getOrCreateSession(): Promise<SessionData> {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("session-id")?.value;

    // If no session ID or session doesn't exist, create a new one
    if (!sessionId || !this.sessions.has(sessionId)) {
      sessionId = uuidv4();
      const newSession: SessionData = {
        id: sessionId,
        createdAt: new Date(),
        lastActivity: new Date(),
        documents: new Map(),
        chatHistory: [],
        vectorStore: null,
      };

      this.sessions.set(sessionId, newSession);

      // Set cookie for the session
      cookieStore.set("session-id", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: "/",
      });
    }

    const session = this.sessions.get(sessionId)!;
    session.lastActivity = new Date();
    return session;
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
    return session || null;
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private cleanupInactiveSessions() {
    const now = new Date();
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > sessionTimeout) {
        console.log(`Cleaning up inactive session: ${sessionId}`);
        this.sessions.delete(sessionId);
      }
    }
  }

  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}

// Create singleton instance
export const sessionManager = new SessionManager();
