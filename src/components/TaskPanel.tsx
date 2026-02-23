import React, { useState, useCallback } from 'react';
import { HolographicPanel, HoloButton } from './HolographicPanel';
import { useAgentStore } from '../stores/agentStore';
import { Task, TaskStatus, TaskPriority, Agent } from '../types';
import { useTranslation } from '../i18n';

interface TaskCardProps {
  task: Task;
  agent?: Agent;
  onClick: () => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: '#00ff88',
  medium: '#00f0ff',
  high: '#ff9500',
  urgent: '#ff3366',
};

const statusColumns: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'pending', title: 'toDo', color: '#00f0ff' },
  { status: 'in_progress', title: 'inProgress', color: '#ff9500' },
  { status: 'completed', title: 'done', color: '#00ff88' },
];

const TaskCard: React.FC<TaskCardProps> = ({ task, agent, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(0, 20, 40, 0.6)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.6)';
        e.currentTarget.style.background = 'rgba(0, 40, 60, 0.7)';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
        e.currentTarget.style.background = 'rgba(0, 20, 40, 0.6)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {/* Priority indicator */}
      <div
        style={{
          width: '4px',
          height: '100%',
          position: 'absolute',
          left: 0,
          top: 0,
          background: priorityColors[task.priority],
          borderTopLeftRadius: '6px',
          borderBottomLeftRadius: '6px',
        }}
      />

      <div style={{ paddingLeft: '8px' }}>
        {/* Title */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#00f0ff',
            marginBottom: '4px',
            textShadow: '0 0 5px rgba(0, 240, 255, 0.5)',
          }}
        >
          {task.title}
        </div>

        {/* Description */}
        {task.description && (
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '8px',
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {task.description}
          </div>
        )}

        {/* Footer: Priority & Assignee */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: priorityColors[task.priority],
              textShadow: `0 0 5px ${priorityColors[task.priority]}`,
              border: `1px solid ${priorityColors[task.priority]}`,
              padding: '2px 6px',
              borderRadius: '3px',
            }}
          >
            {task.priority}
          </span>

          {agent && (
            <span
              style={{
                fontSize: '9px',
                color: '#8b5cf6',
                textShadow: '0 0 5px rgba(139, 92, 246, 0.5)',
              }}
            >
              @{agent.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  agents: Agent[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, agents }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim(),
      status: 'pending',
      priority,
      assignedAgentId: assignedAgentId || undefined,
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssignedAgentId('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 10, 30, 0.98) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.5)',
          borderRadius: '12px',
          padding: '24px',
          width: '400px',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)',
        }}
      >
        <div
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#00f0ff',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '20px',
            textShadow: '0 0 10px #00f0ff',
          }}
        >
          {t('newTask')}
        </div>

        {/* Title */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {t('title')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('title')}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(0, 40, 60, 0.5)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '4px',
              color: '#00f0ff',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {t('description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('description')}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(0, 40, 60, 0.5)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '4px',
              color: '#00f0ff',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>

        {/* Priority */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {t('priority')}
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: priority === p ? `${priorityColors[p]}20` : 'rgba(0, 40, 60, 0.5)',
                  border: `1px solid ${priority === p ? priorityColors[p] : 'rgba(0, 240, 255, 0.3)'}`,
                  borderRadius: '4px',
                  color: priority === p ? priorityColors[p] : 'rgba(255, 255, 255, 0.5)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                {t(p as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Assign to Agent */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {t('assignToOptional')}
          </label>
          <select
            value={assignedAgentId}
            onChange={(e) => setAssignedAgentId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(0, 40, 60, 0.5)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '4px',
              color: '#00f0ff',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">{t('unassigned')}</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} ({agent.role})
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <HoloButton variant="primary" onClick={handleSubmit}>
            {t('addTask')}
          </HoloButton>
          <HoloButton variant="secondary" onClick={onClose}>
            {t('cancel')}
          </HoloButton>
        </div>
      </div>
    </div>
  );
};

interface TaskDetailModalProps {
  task: Task;
  agent?: Agent;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  agent,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.95) 0%, rgba(0, 10, 30, 0.98) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.5)',
          borderRadius: '12px',
          padding: '24px',
          width: '450px',
          boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#00f0ff',
                textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                marginBottom: '8px',
              }}
            >
              {task.title}
            </div>
            <span
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: priorityColors[task.priority],
                textShadow: `0 0 5px ${priorityColors[task.priority]}`,
                border: `1px solid ${priorityColors[task.priority]}`,
                padding: '3px 8px',
                borderRadius: '3px',
              }}
            >
              {task.priority}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            x
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <div
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1.6,
              marginBottom: '20px',
              padding: '12px',
              background: 'rgba(0, 40, 60, 0.3)',
              borderRadius: '6px',
              borderLeft: '3px solid #00f0ff',
            }}
          >
            {task.description}
          </div>
        )}

        {/* Details grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              padding: '12px',
              background: 'rgba(0, 40, 60, 0.3)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              {t('status')}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: '#00f0ff',
                textShadow: '0 0 5px rgba(0, 240, 255, 0.5)',
              }}
            >
              {task.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(0, 40, 60, 0.3)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              {t('assignedTo')}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: agent ? '#8b5cf6' : 'rgba(255, 255, 255, 0.5)',
                textShadow: agent ? '0 0 5px rgba(139, 92, 246, 0.5)' : 'none',
              }}
            >
              {agent ? agent.name : t('unassigned')}
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(0, 40, 60, 0.3)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              {t('created')}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {new Date(task.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(0, 40, 60, 0.3)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              {t('updated')}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {new Date(task.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {task.status === 'pending' && (
            <HoloButton
              variant="primary"
              onClick={() => onStatusChange('in_progress')}
            >
              {t('startTask')}
            </HoloButton>
          )}
          {task.status === 'in_progress' && (
            <HoloButton
              variant="primary"
              onClick={() => onStatusChange('completed')}
            >
              {t('complete')}
            </HoloButton>
          )}
          {task.status === 'completed' && (
            <HoloButton
              variant="secondary"
              onClick={() => onStatusChange('pending')}
            >
              {t('reopen')}
            </HoloButton>
          )}
          <HoloButton variant="secondary" onClick={onClose}>
            {t('close')}
          </HoloButton>
        </div>
      </div>
    </div>
  );
};

export const TaskPanel: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, agents, addTask, updateTaskStatus } = useAgentStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleAddTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      addTask(taskData);
    },
    [addTask]
  );

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateTaskStatus(taskId, status);
      setSelectedTask((prev) => (prev?.id === taskId ? { ...prev, status } : prev));
    },
    [updateTaskStatus]
  );

  const getAgentById = useCallback(
    (agentId?: string) => {
      return agentId ? agents.find((a) => a.id === agentId) : undefined;
    },
    [agents]
  );

  return (
    <div style={{ position: 'absolute', left: '20px', top: '80px', right: '20px', bottom: '20px' }}>
      <HolographicPanel
        title={t('taskBoard')}
        position="center"
        width="100%"
        height="100%"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
            {tasks.length} {t('totalTasks')}
          </div>
          <HoloButton variant="primary" onClick={() => setIsAddModalOpen(true)}>
            {t('addTask')}
          </HoloButton>
        </div>

        {/* Kanban Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            height: 'calc(100% - 60px)',
          }}
        >
          {statusColumns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.status);
            return (
              <div
                key={column.status}
                style={{
                  background: 'rgba(0, 20, 40, 0.4)',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: `2px solid ${column.color}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: column.color,
                      textShadow: `0 0 10px ${column.color}`,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    {t(column.title as any)}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: column.color,
                      background: `${column.color}20`,
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingRight: '4px',
                  }}
                >
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      agent={getAgentById(task.assignedAgentId)}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '11px',
                      }}
                    >
                      {t('noTasks')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </HolographicPanel>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
        agents={agents}
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          agent={getAgentById(selectedTask.assignedAgentId)}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={(status) => handleStatusChange(selectedTask.id, status)}
        />
      )}
    </div>
  );
};

export default TaskPanel;
