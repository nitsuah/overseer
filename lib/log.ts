// Simple logger with debug gating via OVERSEER_DEBUG or NODE_ENV
const isDebug = process.env.OVERSEER_DEBUG === 'true' || process.env.NODE_ENV !== 'production';

export function debug(...args: unknown[]) {
  if (isDebug) {
    // Prefix to make it obvious these are debug logs
    console.log('[DEBUG]', ...args);
  }
}

export function info(...args: unknown[]) {
  console.log(...args);
}

export function warn(...args: unknown[]) {
  console.warn(...args);
}

const logger = { debug, info, warn };
export default logger;
