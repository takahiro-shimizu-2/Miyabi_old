/**
 * WebhookServer - Session Status Communication Server
 *
 * Receives session status from Water Spider and provides recommendations
 * Port: 3002 (to avoid conflict with local-env-collector on 3001)
 */

import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();
const PORT = 3002;

// Middleware
app.use(express.json());

// In-memory session state
interface SessionState {
  sessionId: string;
  status: 'running' | 'idle' | 'stopped' | 'error';
  lastActivity: number;
  idleTime: number;
  needsContinue: boolean;
  continueCount: number; // Track how many times continue was sent
  lastContinue?: number;
}

const sessionStates = new Map<string, SessionState>();

/**
 * Sanitize user input for safe logging (prevent log injection)
 */
function sanitizeForLog(value: unknown): string {
  const str = String(value ?? '');
  // Remove newlines, carriage returns, and ANSI escape sequences
  return str
    .replace(/[\r\n]/g, ' ')
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
    .slice(0, 200);
}

/**
 * POST /api/session/status
 * Receive session status update from Water Spider
 */
app.post('/api/session/status', (req: Request, res: Response): void => {
  const { timestamp, sessions } = req.body;

  if (!Array.isArray(sessions)) {
    res.status(400).json({ error: 'sessions must be an array' });
    return;
  }

  console.log(`📥 [${sanitizeForLog(timestamp)}] Received status update for ${sessions.length} sessions`);

  // Update session states
  sessions.forEach((session: any) => {
    const sessionId = sanitizeForLog(session.sessionId);
    const existing = sessionStates.get(sessionId);
    sessionStates.set(sessionId, {
      ...session,
      sessionId,
      continueCount: existing?.continueCount || 0,
      lastContinue: existing?.lastContinue,
    });

    console.log(`   - ${sessionId}: ${sanitizeForLog(session.status)} (idle: ${Number(session.idleTime) || 0}ms)`);
  });

  res.json({ status: 'ok', received: sessions.length });
});

/**
 * POST /api/session/:id/continue
 * Notify that continue signal was sent
 */
app.post('/api/session/:id/continue', (req: Request, res: Response) => {
  const id = sanitizeForLog(req.params.id);
  const { timestamp } = req.body;

  console.log(`📤 [${sanitizeForLog(timestamp)}] Continue signal sent to ${id}`);

  const session = sessionStates.get(id);
  if (session) {
    session.continueCount++;
    session.lastContinue = Date.now();
    sessionStates.set(id, session);

    console.log(`   Continue count: ${session.continueCount}`);
  }

  res.json({ status: 'ok', sessionId: id });
});

/**
 * GET /api/session/:id/recommendation
 * Get recommendation for session (should we continue?)
 */
app.get('/api/session/:id/recommendation', (req: Request, res: Response) => {
  const id = String(req.params.id);

  const session = sessionStates.get(id);

  if (!session) {
    return res.json({
      action: 'wait',
      message: 'Session not found',
    });
  }

  // Simple recommendation logic
  if (session.needsContinue) {
    return res.json({
      action: 'continue',
      message: '継続してください',
    });
  }

  return res.json({
    action: 'wait',
    message: 'まだ実行中です',
  });
});

/**
 * GET /api/sessions
 * Get all session states (for monitoring dashboard)
 */
app.get('/api/sessions', (_req: Request, res: Response) => {
  const sessions = Array.from(sessionStates.values());
  res.json({
    timestamp: new Date().toISOString(),
    total: sessions.length,
    sessions,
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Start server
 */
function startServer(): void {
  app.listen(PORT, () => {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║     🕷️  Miyabi Water Spider Webhook Server                 ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log('');
    console.log('📡 Endpoints:');
    console.log(`   POST /api/session/status - Receive session status`);
    console.log(`   POST /api/session/:id/continue - Notify continue signal`);
    console.log(`   GET  /api/session/:id/recommendation - Get recommendation`);
    console.log(`   GET  /api/sessions - Get all sessions`);
    console.log(`   GET  /health - Health check`);
    console.log('');
    console.log('🔄 Ready to receive session updates from Water Spider');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down webhook server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down webhook server...');
  process.exit(0);
});

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer };
