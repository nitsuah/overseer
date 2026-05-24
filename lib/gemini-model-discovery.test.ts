import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearModelCache,
  DEFAULT_GEMINI_MODEL,
  discoverWorkingModel,
  getConfiguredModel,
  getModelCandidates,
  getWorkingModel,
} from './gemini-model-discovery';

const {
  mockGenerateContent,
  mockGetGenerativeModel,
  MockGoogleGenerativeAI,
} = vi.hoisted(() => {
  const generateContent = vi.fn();
  const getGenerativeModel = vi.fn();
  const googleConstructor = vi.fn(function (this: unknown) {
    return {
      getGenerativeModel,
    };
  });

  return {
    mockGenerateContent: generateContent,
    mockGetGenerativeModel: getGenerativeModel,
    MockGoogleGenerativeAI: googleConstructor,
  };
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: MockGoogleGenerativeAI,
}));

vi.mock('./log', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('gemini-model-discovery', () => {
  const originalGeminiModelName = process.env.GEMINI_MODEL_NAME;
  const originalGeminiModel = process.env.GEMINI_MODEL;

  beforeEach(() => {
    vi.clearAllMocks();
    clearModelCache();

    process.env.GEMINI_MODEL_NAME = originalGeminiModelName;
    process.env.GEMINI_MODEL = originalGeminiModel;

    mockGetGenerativeModel.mockImplementation(({ model }: { model: string }) => ({
      generateContent: () => mockGenerateContent(model),
    }));
  });

  it('should return configured model from GEMINI_MODEL_NAME', () => {
    process.env.GEMINI_MODEL_NAME = 'models/custom-model';
    process.env.GEMINI_MODEL = 'models/fallback-model';

    expect(getConfiguredModel()).toBe('models/custom-model');
  });

  it('should fallback to GEMINI_MODEL then default model', () => {
    delete process.env.GEMINI_MODEL_NAME;
    process.env.GEMINI_MODEL = 'models/env-model';
    expect(getConfiguredModel()).toBe('models/env-model');

    delete process.env.GEMINI_MODEL;
    expect(getConfiguredModel()).toBe(DEFAULT_GEMINI_MODEL);
  });

  it('should discover the configured model when it works', async () => {
    process.env.GEMINI_MODEL_NAME = 'models/gemini-2.5-flash';
    mockGenerateContent.mockResolvedValue({});

    const model = await discoverWorkingModel('fake-key');

    expect(model).toBe('models/gemini-2.5-flash');
    expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'models/gemini-2.5-flash' });
  });

  it('should fallback to another candidate when configured model fails', async () => {
    process.env.GEMINI_MODEL_NAME = 'models/unavailable-model';
    mockGenerateContent.mockImplementation(async (model: string) => {
      if (model === 'models/gemini-2.0-flash') {
        return {};
      }
      throw new Error('model unavailable');
    });

    const model = await discoverWorkingModel('fake-key');
    expect(model).toBe('models/gemini-2.0-flash');
  });

  it('should return cached discovered model on subsequent calls', async () => {
    process.env.GEMINI_MODEL_NAME = 'models/gemini-2.5-flash';
    mockGenerateContent.mockResolvedValue({});

    const first = await discoverWorkingModel('fake-key');
    mockGenerateContent.mockRejectedValue(new Error('should not be called'));
    const second = await discoverWorkingModel('fake-key');

    expect(first).toBe('models/gemini-2.5-flash');
    expect(second).toBe('models/gemini-2.5-flash');
  });

  it('should return configured model if discovery fails in getWorkingModel', async () => {
    process.env.GEMINI_MODEL_NAME = 'models/configured-fallback';
    mockGenerateContent.mockRejectedValue(new Error('all failed'));

    const model = await getWorkingModel('fake-key');
    expect(model).toBe('models/configured-fallback');
  });

  it('should force refresh when requested', async () => {
    process.env.GEMINI_MODEL_NAME = 'models/first';
    mockGenerateContent.mockResolvedValue({});
    await getWorkingModel('fake-key');

    process.env.GEMINI_MODEL_NAME = 'models/second';
    mockGenerateContent.mockImplementation(async (model: string) => {
      if (model === 'models/second') {
        return {};
      }
      throw new Error('fail');
    });

    const model = await getWorkingModel('fake-key', true);
    expect(model).toBe('models/second');
  });

  it('should expose model candidates for diagnostics', () => {
    const candidates = getModelCandidates();
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]).toBe(DEFAULT_GEMINI_MODEL);
  });
});