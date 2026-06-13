import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

const mockOpenAiCreate = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockOpenAiCreate } },
  })),
}));

const mockConfig = { get: jest.fn((key: string) => ({ 'openai.apiKey': 'sk-test', 'openai.model': 'gpt-4o', 'openai.maxTokens': 4096 }[key])) };

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService, { provide: ConfigService, useValue: mockConfig }],
    }).compile();
    service = module.get<AiService>(AiService);
  });

  it('should parse and return JSON response', async () => {
    mockOpenAiCreate.mockResolvedValue({ choices: [{ message: { content: '{"matches":[]}' } }] });
    const result = await service.chat<{ matches: unknown[] }>('test prompt');
    expect(result).toEqual({ matches: [] });
  });

  it('should throw InternalServerErrorException on API error', async () => {
    mockOpenAiCreate.mockRejectedValue(new Error('API error'));
    await expect(service.chat('test')).rejects.toThrow(InternalServerErrorException);
  });

  it('should throw InternalServerErrorException on invalid JSON', async () => {
    mockOpenAiCreate.mockResolvedValue({ choices: [{ message: { content: 'not json' } }] });
    await expect(service.chat('test')).rejects.toThrow(InternalServerErrorException);
  });
});
