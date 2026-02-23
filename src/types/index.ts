// Agent types for Agent Team management system

export type AgentStatus = 'idle' | 'working' | 'error' | 'offline';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type FormationType = 'circle' | 'matrix' | 'triangle' | 'herring' | 'custom';

export type EventType = 'system_initialized' | 'task_assigned' | 'task_completed' | 'status_changed' | 'agent_added' | 'agent_removed' | 'commander_changed' | 'formation_changed' | 'error';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  llmProvider: string;
  llmModel: string;
  // Custom configuration reference (stores the saved custom config ID)
  customConfigId?: string;
  // Custom provider settings (for backward compatibility)
  customModelName?: string;
  customBaseUrl?: string;
  systemPrompt: string;
  status: AgentStatus;
  isCommander: boolean;
  position: Position;
  note?: string;
  taskCount: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Formation {
  id: string;
  name: string;
  type: FormationType;
  positions: Position[];
  isActive: boolean;
}

export interface ExecutionEvent {
  id: string;
  type: EventType;
  agentId?: string;
  agentName?: string;
  taskId?: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Helper function to generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Default positions for agent formations
export const DEFAULT_FORMATIONS: Record<FormationType, Position[]> = {
  circle: [
    { x: 3, y: 0, z: 0 },
    { x: 2.12, y: 0, z: 2.12 },
    { x: 0, y: 0, z: 3 },
    { x: -2.12, y: 0, z: 2.12 },
    { x: -3, y: 0, z: 0 },
    { x: -2.12, y: 0, z: -2.12 },
    { x: 0, y: 0, z: -3 },
    { x: 2.12, y: 0, z: -2.12 },
  ],
  matrix: [
    { x: -1.5, y: 0, z: -1.5 },
    { x: 0, y: 0, z: -1.5 },
    { x: 1.5, y: 0, z: -1.5 },
    { x: -1.5, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 },
    { x: 1.5, y: 0, z: 0 },
    { x: -1.5, y: 0, z: 1.5 },
    { x: 0, y: 0, z: 1.5 },
    { x: 1.5, y: 0, z: 1.5 },
  ],
  triangle: [
    { x: 0, y: 0, z: -2.5 },
    { x: -2, y: 0, z: 0 },
    { x: -1, y: 0, z: 1.5 },
    { x: 1, y: 0, z: 1.5 },
    { x: 2, y: 0, z: 0 },
  ],
  herring: [
    { x: -4, y: 0, z: 0 },
    { x: -3, y: 0, z: 0.5 },
    { x: -2, y: 0, z: -0.5 },
    { x: -1, y: 0, z: 0.5 },
    { x: 0, y: 0, z: -0.5 },
    { x: 1, y: 0, z: 0.5 },
    { x: 2, y: 0, z: -0.5 },
    { x: 3, y: 0, z: 0.5 },
  ],
  custom: [],
};

// LLM Provider options
export const LLM_PROVIDERS = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'minimax', label: 'MiniMax' },
  { value: 'zhipu', label: '智谱 GLM' },
  { value: 'ollama', label: 'Ollama (本地)' },
  { value: 'custom', label: 'Custom (自定义)' },
] as const;

// LLM Model options by provider
export const LLM_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  minimax: ['abab6.5sab6.5-chat', 'abg-chat', 'abab5.5s-chat'],
  zhipu: ['glm-4', 'glm-4-flash', 'glm-4-plus', 'glm-3-turbo'],
  ollama: ['llama3', 'llama3.1', 'mistral', 'qwen2.5', 'custom'],
  custom: [],
};
