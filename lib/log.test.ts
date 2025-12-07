import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debug, info, warn } from './log';

describe('log', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  const originalEnv = process.env;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    process.env = originalEnv;
  });

  describe('debug', () => {
    it('should log with DEBUG prefix', () => {
      // The isDebug is evaluated at module load time, so we test the actual behavior
      debug('test message');
      // In test environment, NODE_ENV is not 'production', so debug should log
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG]', 'test message');
    });

    it('should log multiple arguments', () => {
      debug('message', 123, { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG]', 'message', 123, { key: 'value' });
    });
  });

  describe('info', () => {
    it('should always log info messages', () => {
      info('info message');
      expect(consoleLogSpy).toHaveBeenCalledWith('info message');
    });

    it('should log multiple arguments', () => {
      info('message', 456, ['array']);
      expect(consoleLogSpy).toHaveBeenCalledWith('message', 456, ['array']);
    });
  });

  describe('warn', () => {
    it('should always log warn messages', () => {
      warn('warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('warning message');
    });

    it('should log multiple arguments', () => {
      warn('warning', 789, null);
      expect(consoleWarnSpy).toHaveBeenCalledWith('warning', 789, null);
    });
  });
});
