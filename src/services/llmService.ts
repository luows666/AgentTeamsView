// LLM Service - Multi-provider LLM API calling service
// Supports: OpenAI, Anthropic (Claude), DeepSeek, Ollama, and Custom providers

import { Settings, LLMProvider, CustomLLMConfig } from '../stores/agentStore';
import { Agent } from '../types';

// Message types for LLM conversations
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

// LLM Service class
export class LLMService {
  private settings: Settings;
  private customConfig?: CustomLLMConfig;

  constructor(settings: Settings, customConfig?: CustomLLMConfig) {
    this.settings = settings;
    this.customConfig = customConfig;
  }

  // Get the effective provider (use custom config if available)
  private getEffectiveProvider(): LLMProvider {
    return this.customConfig?.provider || this.settings.provider;
  }

  // Get the effective API key
  private getEffectiveApiKey(): string {
    return this.customConfig?.apiKey || this.settings.apiKey;
  }

  // Get the effective model
  private getEffectiveModel(): string {
    if (this.customConfig?.customModelName) {
      return this.customConfig.customModelName;
    }
    if (this.customConfig?.model && this.customConfig.model !== 'custom') {
      return this.customConfig.model;
    }
    return this.settings.model;
  }

  // Get the effective base URL
  private getEffectiveBaseUrl(): string | undefined {
    return this.customConfig?.customBaseUrl || this.settings.customBaseUrl;
  }

  // Build headers for API requests
  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const provider = this.getEffectiveProvider();
    const apiKey = this.getEffectiveApiKey();

    switch (provider) {
      case 'openai':
      case 'deepseek':
      case 'minimax':
      case 'zhipu':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'ollama':
        // Ollama typically doesn't need auth for local
        break;
      case 'custom':
        // Custom provider - use the provided API key as-is
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }
        break;
    }

    return headers;
  }

  // Get the appropriate API endpoint
  private getApiEndpoint(): string {
    const provider = this.getEffectiveProvider();
    let baseUrl = this.getEffectiveBaseUrl();
    const model = this.getEffectiveModel();

    // Helper: Check if URL already contains a path
    const hasPath = (url: string): boolean => {
      return url.includes('/v1/') || url.includes('/v4/') || url.includes('/chat') || url.includes('/completions') || url.includes('/messages');
    };

    // Process baseUrl with protocol
    const processBaseUrl = (url: string): string => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return url.replace(/\/$/, '');
    };

    // If baseUrl is provided, check if it already has a path
    if (baseUrl) {
      baseUrl = processBaseUrl(baseUrl);

      // If user provided full URL with path, use as-is
      if (hasPath(baseUrl)) {
        console.log('[LLM Service] Using user-provided endpoint:', baseUrl);
        return baseUrl;
      }
    }

    switch (provider) {
      case 'openai':
        return baseUrl ? `${baseUrl}/v1/chat/completions` : 'https://api.openai.com/v1/chat/completions';
      case 'anthropic':
        return baseUrl ? `${baseUrl}/v1/messages` : 'https://api.anthropic.com/v1/messages';
      case 'deepseek':
        return baseUrl ? `${baseUrl}/v1/chat/completions` : 'https://api.deepseek.com/v1/chat/completions';
      case 'minimax':
        // MiniMax uses /v1/text/chatcompletion_v2
        return baseUrl ? `${baseUrl}/v1/text/chatcompletion_v2` : 'https://api.minimax.chat/v1/text/chatcompletion_v2';
      case 'zhipu':
        // 智谱 GLM uses /api/paas/v4/chat/completions
        return baseUrl ? `${baseUrl}/v4/chat/completions` : 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      case 'ollama':
        return baseUrl || 'http://localhost:11434';
      case 'custom':
        return baseUrl ? (hasPath(baseUrl) ? baseUrl : `${baseUrl}/v1/chat/completions`) : '';
      default:
        return '';
    }
  }

  // Build request body for different providers
  private buildRequestBody(messages: LLMMessage[], temperature = 0.7, maxTokens = 2048): object {
    const provider = this.getEffectiveProvider();
    const model = this.getEffectiveModel();

    switch (provider) {
      case 'openai':
      case 'deepseek':
      case 'minimax':
      case 'zhipu':
      case 'custom':
        return {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        };
      case 'anthropic':
        // Convert messages format for Anthropic
        const anthropicMessages = messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          }));
        // Get system prompt if exists
        const systemMessage = messages.find((m) => m.role === 'system');
        return {
          model,
          messages: anthropicMessages,
          max_tokens: maxTokens,
          ...(systemMessage && { system: systemMessage.content }),
        };
      case 'ollama':
        return {
          model,
          messages,
          stream: false,
        };
      default:
        return {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        };
    }
  }

  // Parse response from different providers
  private parseResponse(data: any, provider: string): LLMResponse {
    switch (provider) {
      case 'openai':
      case 'deepseek':
      case 'minimax':
      case 'zhipu':
      case 'custom':
        return {
          content: data.choices[0]?.message?.content || '',
          model: data.model,
          usage: data.usage,
        };
      case 'anthropic':
        return {
          content: data.content[0]?.text || '',
          model: data.model,
          usage: {
            promptTokens: data.usage?.input_tokens || 0,
            completionTokens: data.usage?.output_tokens || 0,
            totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
          },
        };
      case 'ollama':
        return {
          content: data.message?.content || '',
          model: data.model,
        };
      default:
        return {
          content: '',
          model: this.getEffectiveModel(),
        };
    }
  }

  // Main chat method
  async chat(
    messages: LLMMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<LLMResponse> {
    const provider = this.getEffectiveProvider();
    const endpoint = this.getApiEndpoint();
    const apiKey = this.getEffectiveApiKey();
    const model = this.getEffectiveModel();

    // Debug logging
    console.log('[LLM Service] Chat request:', {
      provider,
      endpoint,
      model,
      hasApiKey: !!apiKey,
      hasBaseUrl: !!this.getEffectiveBaseUrl(),
    });

    // Validate API key
    if (!apiKey && provider !== 'ollama') {
      throw new Error(`API key is required for ${provider} provider`);
    }

    // Validate endpoint for custom provider
    if (provider === 'custom' && !endpoint) {
      throw new Error('Custom base URL is required for custom provider. Please check your settings.');
    }

    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2048;

    const body = this.buildRequestBody(messages, temperature, maxTokens);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LLM Service] API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          endpoint,
        });
        throw new Error(`API error (${response.status}): ${errorText}\nEndpoint: ${endpoint}`);
      }

      const data = await response.json();
      return this.parseResponse(data, provider);
    } catch (error) {
      if (error instanceof Error) {
        // Add more context to the error
        const errorMessage = error.message;
        if (!errorMessage.includes('Endpoint:')) {
          error.message = `${errorMessage}\n[Debug] Provider: ${provider}, Endpoint: ${endpoint}, Model: ${model}`;
        }
        throw error;
      }
      throw new Error('Failed to call LLM API');
    }
  }

  // Streaming chat method
  async *streamChat(
    messages: LLMMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): AsyncGenerator<LLMStreamChunk> {
    const provider = this.getEffectiveProvider();
    const endpoint = this.getApiEndpoint();
    const apiKey = this.getEffectiveApiKey();

    // Validate API key
    if (!apiKey && provider !== 'ollama') {
      throw new Error(`API key is required for ${provider} provider`);
    }

    // Streaming is only supported for OpenAI-compatible APIs
    if (provider === 'anthropic') {
      // Anthropic doesn't support streaming in the same way
      // Fall back to non-streaming
      const response = await this.chat(messages, options);
      yield { content: response.content, done: true };
      return;
    }

    const temperature = options?.temperature ?? 0.7;
    const maxTokens = options?.maxTokens ?? 2048;

    const body = this.buildRequestBody(messages, temperature, maxTokens);
    // Enable streaming
    if (body && typeof body === 'object' && 'stream' in body) {
      (body as any).stream = true;
    } else if (provider === 'openai' || provider === 'deepseek' || provider === 'custom') {
      (body as any).stream = true;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') {
            yield { content: '', done: true };
            return;
          }

          try {
            const data = JSON.parse(dataStr);
            let content = '';

            if (provider === 'openai' || provider === 'deepseek' || provider === 'custom') {
              content = data.choices[0]?.delta?.content || '';
            } else if (provider === 'ollama') {
              content = data.message?.content || '';
            }

            if (content) {
              yield { content, done: false };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      yield { content: '', done: true };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to stream from LLM API');
    }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Simple test with a minimal message
      const response = await this.chat(
        [
          { role: 'user', content: 'Hi' },
        ],
        { temperature: 0.5, maxTokens: 50 }
      );

      if (response.content && response.content.length > 0) {
        return { success: true, message: 'Connection successful!' };
      } else {
        return { success: false, message: 'Empty response from API' };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Connection failed: ${message}` };
    }
  }
}

// Factory function to create LLM service
export function createLLMService(
  settings: Settings,
  agent?: Agent,
  customConfigs?: CustomLLMConfig[]
): LLMService {
  // If agent has a custom config, use it
  if (agent?.customConfigId && customConfigs) {
    const config = customConfigs.find((c) => c.id === agent.customConfigId);
    if (config) {
      return new LLMService(settings, config);
    }
  }

  // Otherwise use global settings
  return new LLMService(settings);
}

// Build context for commander agent chat
export function buildCommanderContext(
  commander: Agent | null,
  agents: Agent[],
  tasks: { title: string; status: string }[]
): LLMMessage[] {
  const messages: LLMMessage[] = [];

  // System prompt
  let systemContent = commander?.systemPrompt || '';
  if (!systemContent) {
    systemContent = `You are ${commander?.name || 'the Commander'}, a helpful AI assistant managing a team of agents.

Your role is to coordinate tasks, provide status updates, and assist the user with their requests.

`;
  }

  // Add team context
  systemContent += `\n\n## Current Team Status:\n`;
  systemContent += `Total Agents: ${agents.length}\n`;
  agents.forEach((agent) => {
    systemContent += `- ${agent.name} (${agent.role}): ${agent.status}\n`;
  });

  // Add tasks context
  systemContent += `\n## Active Tasks:\n`;
  if (tasks.length === 0) {
    systemContent += `No active tasks.\n`;
  } else {
    tasks.slice(0, 10).forEach((task) => {
      systemContent += `- ${task.title}: ${task.status}\n`;
    });
  }

  messages.push({ role: 'system', content: systemContent });

  return messages;
}

// Export default for convenience
export default LLMService;
