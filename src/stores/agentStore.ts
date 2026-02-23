import { create } from 'zustand';
import {
  Agent,
  Task,
  Formation,
  ExecutionEvent,
  AgentStatus,
  TaskStatus,
  FormationType,
  generateId,
  DEFAULT_FORMATIONS,
} from '../types';
import { LLMService, createLLMService } from '../services/llmService';

// localStorage key
const STORAGE_KEY = 'agent-team-data';

// Settings types
export type LLMProvider = 'openai' | 'anthropic' | 'deepseek' | 'ollama' | 'custom';

// Custom configuration for agents
export interface CustomLLMConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  apiKey: string;
  model: string;
  customModelName?: string;
  customBaseUrl?: string;
  createdAt: string;
}

export interface Settings {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  // Custom provider configuration
  customModelName?: string;
  customBaseUrl?: string;
}

// Stored data type (excludes runtime state like animations)
interface StoredData {
  agents: Agent[];
  tasks: Task[];
  formations: Formation[];
  settings: Settings;
  formationType: FormationType;
  isHeatmapEnabled: boolean;
  commanderId: string | null;
  selectedAgentId: string | null;
}

// Load state from localStorage
const loadState = (): Partial<StoredData> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return null;
};

// Save state to localStorage
const saveState = (state: StoredData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

// Initial empty state (no preset agents)
const initialAgents: Agent[] = [];
const initialTasks: Task[] = [];

interface AgentStore {
  // State
  agents: Agent[];
  tasks: Task[];
  formations: Formation[];
  selectedAgentId: string | null;
  commanderId: string | null;
  events: ExecutionEvent[];

  // Settings state
  settings: Settings;

  // Custom LLM configurations for agents
  savedCustomConfigs: CustomLLMConfig[];

  // Formation state
  formationType: FormationType;
  isHeatmapEnabled: boolean;

  // Task animation state
  activeTaskAnimations: Array<{
    taskId: string;
    fromAgentId: string;
    toAgentId: string;
    startTime: number;
  }>;
  completingTaskIds: string[];

  // Agent actions
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'taskCount' | 'isCommander'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  setCommander: (agentId: string) => void;
  selectAgent: (agentId: string | null) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  assignTask: (taskId: string, agentId: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;

  // Task animation actions
  assignTaskToAgent: (taskId: string, fromAgentId: string, toAgentId: string) => void;
  completeTaskAnimation: (taskId: string) => void;
  clearTaskAnimation: (taskId: string) => void;
  clearCompletingTask: (taskId: string) => void;

  // Formation actions
  setFormation: (formation: Formation) => void;
  setActiveFormation: (formationId: string) => void;
  setFormationType: (type: FormationType) => void;

  // Heatmap actions
  toggleHeatmap: () => void;
  setHeatmapEnabled: (enabled: boolean) => void;

  // Event actions
  addEvent: (event: Omit<ExecutionEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void;

  // Custom LLM config actions
  addCustomConfig: (config: Omit<CustomLLMConfig, 'id' | 'createdAt'>) => void;
  updateCustomConfig: (id: string, updates: Partial<CustomLLMConfig>) => void;
  deleteCustomConfig: (id: string) => void;

  // LLM Service helper
  createLLMServiceForAgent: (agentId?: string) => LLMService | null;
  testLLMConnection: () => Promise<{ success: boolean; message: string }>;

  // Persistence actions
  loadState: () => void;
  saveState: () => void;
}

// Initial formations (default presets, can be customized by user)
const initialFormations: Formation[] = [
  {
    id: 'f1',
    name: 'Circle Formation',
    type: 'circle',
    positions: DEFAULT_FORMATIONS.circle,
    isActive: true,
  },
  {
    id: 'f2',
    name: 'Matrix Formation',
    type: 'matrix',
    positions: DEFAULT_FORMATIONS.matrix,
    isActive: false,
  },
  {
    id: 'f3',
    name: 'Triangle Formation',
    type: 'triangle',
    positions: DEFAULT_FORMATIONS.triangle,
    isActive: false,
  },
  {
    id: 'f4',
    name: 'Herring Formation',
    type: 'herring',
    positions: DEFAULT_FORMATIONS.herring,
    isActive: false,
  },
];

// Initial settings
const initialSettings: Settings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o',
  customModelName: '',
  customBaseUrl: '',
};

// Custom configs storage key
const CUSTOM_CONFIGS_KEY = 'agentTeamCustomConfigs';

// Load custom configs from localStorage
const loadCustomConfigs = (): CustomLLMConfig[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_CONFIGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load custom configs:', error);
  }
  return [];
};

// Save custom configs to localStorage
const saveCustomConfigs = (configs: CustomLLMConfig[]) => {
  try {
    localStorage.setItem(CUSTOM_CONFIGS_KEY, JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to save custom configs:', error);
  }
};

// Load persisted state from localStorage
const persistedState = loadState();

// Helper function to save state to localStorage
const persistCurrentState = (state: AgentStore) => {
  const dataToSave: StoredData = {
    agents: state.agents,
    tasks: state.tasks,
    formations: state.formations,
    settings: state.settings,
    formationType: state.formationType,
    isHeatmapEnabled: state.isHeatmapEnabled,
    commanderId: state.commanderId,
    selectedAgentId: state.selectedAgentId,
  };
  saveState(dataToSave);
};

export const useAgentStore = create<AgentStore>((set, get) => ({
  // Initial state - use persisted data or defaults
  agents: persistedState?.agents ?? initialAgents,
  tasks: persistedState?.tasks ?? initialTasks,
  formations: persistedState?.formations ?? initialFormations,
  selectedAgentId: persistedState?.selectedAgentId ?? null,
  commanderId: persistedState?.commanderId ?? null,

  // Events are not persisted - start fresh each session
  events: [
    {
      id: 'e1',
      type: 'system_initialized',
      message: 'Agent Team system initialized',
      timestamp: new Date().toISOString(),
    },
  ],

  // Settings state
  settings: persistedState?.settings ?? initialSettings,

  // Custom LLM configs state
  savedCustomConfigs: loadCustomConfigs(),

  // Formation state
  formationType: persistedState?.formationType ?? 'circle',
  isHeatmapEnabled: persistedState?.isHeatmapEnabled ?? false,

  // Task animation state
  activeTaskAnimations: [],
  completingTaskIds: [],

  // Agent actions
  addAgent: (agentData) => {
    const newAgent: Agent = {
      ...agentData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      taskCount: 0,
      isCommander: false,
      // Calculate position based on current agent count
      position: { x: 0, y: 0, z: 0 },
    };

    set((state) => {
      const newState = {
        agents: [...state.agents, newAgent],
      };
      // Auto-save to localStorage
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    get().addEvent({
      type: 'agent_added',
      agentId: newAgent.id,
      agentName: newAgent.name,
      message: `Agent ${newAgent.name} has been added to the team`,
    });
  },

  updateAgent: (id, updates) => {
    set((state) => {
      const newState = {
        agents: state.agents.map((agent) =>
          agent.id === id ? { ...agent, ...updates } : agent
        ),
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });
  },

  deleteAgent: (id) => {
    const agent = get().agents.find((a) => a.id === id);
    set((state) => {
      const newState = {
        agents: state.agents.filter((agent) => agent.id !== id),
        selectedAgentId: state.selectedAgentId === id ? null : state.selectedAgentId,
        commanderId: state.commanderId === id ? null : state.commanderId,
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    if (agent) {
      get().addEvent({
        type: 'agent_removed',
        agentId: id,
        agentName: agent.name,
        message: `Agent ${agent.name} has been removed from the team`,
      });
    }
  },

  setCommander: (agentId) => {
    set((state) => {
      const newState = {
        agents: state.agents.map((agent) => ({
          ...agent,
          isCommander: agent.id === agentId,
        })),
        commanderId: agentId,
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    const agent = get().agents.find((a) => a.id === agentId);
    if (agent) {
      get().addEvent({
        type: 'commander_changed',
        agentId,
        agentName: agent.name,
        message: `${agent.name} has been set as the commander`,
      });
    }
  },

  selectAgent: (agentId) => {
    set((state) => {
      const newState = { selectedAgentId: agentId };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });
  },

  updateAgentStatus: (id, status) => {
    const agent = get().agents.find((a) => a.id === id);
    set((state) => {
      const newState = {
        agents: state.agents.map((agent) =>
          agent.id === id ? { ...agent, status } : agent
        ),
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    if (agent) {
      get().addEvent({
        type: 'status_changed',
        agentId: id,
        agentName: agent.name,
        message: `${agent.name} status changed to ${status}`,
      });
    }
  },

  // Task actions
  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const newState = { tasks: [...state.tasks, newTask] };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    get().addEvent({
      type: 'task_assigned',
      taskId: newTask.id,
      message: `New task "${newTask.title}" created`,
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const newState = {
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        ),
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const newState = { tasks: state.tasks.filter((task) => task.id !== id) };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });
  },

  assignTask: (taskId, agentId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    const agent = get().agents.find((a) => a.id === agentId);

    set((state) => {
      const newState = {
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, assignedAgentId: agentId } : task
        ),
        agents: state.agents.map((agent) =>
          agent.id === agentId ? { ...agent, taskCount: agent.taskCount + 1 } : agent
        ),
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    if (task && agent) {
      get().addEvent({
        type: 'task_assigned',
        agentId,
        agentName: agent.name,
        taskId,
        message: `Task "${task.title}" assigned to ${agent.name}`,
      });
    }
  },

  updateTaskStatus: (id, status) => {
    const task = get().tasks.find((t) => t.id === id);
    const updates: Partial<Task> = { status };

    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    set((state) => {
      const newState = {
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        ),
        // If task is completed, decrement the agent's task count
        agents: task?.assignedAgentId
          ? state.agents.map((agent) =>
              agent.id === task.assignedAgentId && status === 'completed'
                ? { ...agent, taskCount: Math.max(0, agent.taskCount - 1) }
                : agent
            )
          : state.agents,
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    if (task) {
      get().addEvent({
        type: 'task_completed',
        agentId: task.assignedAgentId,
        taskId: id,
        message: `Task "${task.title}" status changed to ${status}`,
      });
    }
  },

  // Task animation actions
  assignTaskToAgent: (taskId, fromAgentId, toAgentId) => {
    // Add task animation to active animations
    set((state) => ({
      activeTaskAnimations: [
        ...state.activeTaskAnimations,
        {
          taskId,
          fromAgentId,
          toAgentId,
          startTime: Date.now(),
        },
      ],
    }));

    const task = get().tasks.find((t) => t.id === taskId);
    const toAgent = get().agents.find((a) => a.id === toAgentId);

    // Assign the task
    if (task && toAgent) {
      get().assignTask(taskId, toAgentId);

      get().addEvent({
        type: 'task_assigned',
        agentId: toAgentId,
        agentName: toAgent.name,
        taskId,
        message: `Task "${task.title}" is being assigned to ${toAgent.name}`,
      });
    }
  },

  completeTaskAnimation: (taskId) => {
    // Mark task as completing to show completion effect
    set((state) => ({
      completingTaskIds: [...state.completingTaskIds, taskId],
      activeTaskAnimations: state.activeTaskAnimations.filter(
        (anim) => anim.taskId !== taskId
      ),
    }));

    const task = get().tasks.find((t) => t.id === taskId);
    if (task) {
      // Update task status to completed
      get().updateTaskStatus(taskId, 'completed');
    }
  },

  clearTaskAnimation: (taskId) => {
    set((state) => ({
      activeTaskAnimations: state.activeTaskAnimations.filter(
        (anim) => anim.taskId !== taskId
      ),
    }));
  },

  clearCompletingTask: (taskId) => {
    set((state) => ({
      completingTaskIds: state.completingTaskIds.filter((id) => id !== taskId),
    }));
  },

  // Formation actions
  setFormation: (formation) => {
    set((state) => {
      const newState = {
        formations: state.formations.some((f) => f.id === formation.id)
          ? state.formations.map((f) => (f.id === formation.id ? formation : f))
          : [...state.formations, formation],
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    get().addEvent({
      type: 'formation_changed',
      message: `Formation "${formation.name}" updated`,
    });
  },

  setActiveFormation: (formationId) => {
    set((state) => {
      const newState = {
        formations: state.formations.map((f) => ({
          ...f,
          isActive: f.id === formationId,
        })),
      };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    const formation = get().formations.find((f) => f.id === formationId);
    if (formation) {
      get().addEvent({
        type: 'formation_changed',
        message: `Active formation changed to "${formation.name}"`,
      });
    }
  },

  setFormationType: (type) => {
    set((state) => {
      const newState = { formationType: type };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    get().addEvent({
      type: 'formation_changed',
      message: `Formation type changed to "${type}"`,
    });
  },

  // Heatmap actions
  toggleHeatmap: () => {
    set((state) => {
      const newState = { isHeatmapEnabled: !state.isHeatmapEnabled };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    const isEnabled = get().isHeatmapEnabled;
    get().addEvent({
      type: 'system_initialized',
      message: isEnabled ? 'Heatmap enabled' : 'Heatmap disabled',
    });
  },

  setHeatmapEnabled: (enabled) => {
    set((state) => {
      const newState = { isHeatmapEnabled: enabled };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });
  },

  // Event actions
  addEvent: (eventData) => {
    const newEvent: ExecutionEvent = {
      ...eventData,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      events: [newEvent, ...state.events].slice(0, 100), // Keep last 100 events
    }));
  },

  clearEvents: () => {
    set({ events: [] });
  },

  // Settings actions
  updateSettings: (updates) => {
    set((state) => {
      const newState = { settings: { ...state.settings, ...updates } };
      persistCurrentState({ ...state, ...newState });
      return newState;
    });

    const settings = get().settings;
    get().addEvent({
      type: 'system_initialized',
      message: `Settings updated: ${updates.provider || settings.provider} / ${updates.model || settings.model}`,
    });
  },

  // Custom LLM config actions
  addCustomConfig: (configData) => {
    const newConfig: CustomLLMConfig = {
      ...configData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const newState = {
        savedCustomConfigs: [...state.savedCustomConfigs, newConfig],
      };
      saveCustomConfigs(newState.savedCustomConfigs);
      return newState;
    });

    get().addEvent({
      type: 'system_initialized',
      message: `Custom config "${newConfig.name}" added`,
    });
  },

  updateCustomConfig: (id, updates) => {
    set((state) => {
      const newState = {
        savedCustomConfigs: state.savedCustomConfigs.map((config) =>
          config.id === id ? { ...config, ...updates } : config
        ),
      };
      saveCustomConfigs(newState.savedCustomConfigs);
      return newState;
    });
  },

  deleteCustomConfig: (id) => {
    const config = get().savedCustomConfigs.find((c) => c.id === id);
    set((state) => {
      const newState = {
        savedCustomConfigs: state.savedCustomConfigs.filter((config) => config.id !== id),
      };
      saveCustomConfigs(newState.savedCustomConfigs);
      return newState;
    });

    if (config) {
      get().addEvent({
        type: 'system_initialized',
        message: `Custom config "${config.name}" deleted`,
      });
    }
  },

  // LLM Service helper - create LLM service for a specific agent or global
  createLLMServiceForAgent: (agentId?: string) => {
    const state = get();
    const settings = state.settings;

    // If agentId is provided, try to find agent's custom config
    if (agentId) {
      const agent = state.agents.find((a) => a.id === agentId);
      if (agent?.customConfigId) {
        const config = state.savedCustomConfigs.find((c) => c.id === agent.customConfigId);
        if (config) {
          return new LLMService(settings, config);
        }
      }
    }

    // Fall back to global settings
    return new LLMService(settings);
  },

  // Test LLM connection
  testLLMConnection: async () => {
    const state = get();
    const settings = state.settings;

    // Check if API key is configured
    if (!settings.apiKey && settings.provider !== 'ollama') {
      return { success: false, message: 'API key not configured. Please set up your API key in Settings.' };
    }

    if (settings.provider === 'custom' && !settings.customBaseUrl) {
      return { success: false, message: 'Custom base URL not configured. Please set up your custom API endpoint in Settings.' };
    }

    try {
      const llmService = new LLMService(settings);
      return await llmService.testConnection();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Connection failed: ${message}` };
    }
  },

  // Persistence actions
  loadState: () => {
    const loaded = loadState();
    if (loaded) {
      set((state) => ({
        agents: loaded.agents ?? state.agents,
        tasks: loaded.tasks ?? state.tasks,
        formations: loaded.formations ?? state.formations,
        settings: loaded.settings ?? state.settings,
        formationType: loaded.formationType ?? state.formationType,
        isHeatmapEnabled: loaded.isHeatmapEnabled ?? state.isHeatmapEnabled,
        commanderId: loaded.commanderId ?? state.commanderId,
        selectedAgentId: loaded.selectedAgentId ?? state.selectedAgentId,
      }));
    }
  },

  saveState: () => {
    const state = get();
    persistCurrentState(state);
  },
}));

export default useAgentStore;
