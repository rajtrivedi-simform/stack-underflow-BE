import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({ apiKey: config.get<string>('openai.apiKey') });
    this.model = config.get<string>('openai.model', 'gpt-4o');
    this.maxTokens = config.get<number>('openai.maxTokens', 4096);
  }

  async chat<T = unknown>(prompt: string): Promise<T> {
    let raw: string;
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant. Always respond with valid JSON matching the requested schema.',
          },
          { role: 'user', content: prompt },
        ],
      });
      raw = response.choices[0]?.message?.content ?? '{}';
    } catch (err) {
      throw new InternalServerErrorException(
        `OpenAI request failed: ${(err as Error).message}`,
      );
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new InternalServerErrorException('AI returned invalid JSON');
    }
  }
}
