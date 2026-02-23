import React, { useEffect, useRef, useCallback, useState } from 'react';
import { HolographicPanel, HoloButton } from './HolographicPanel';
import { useAgentStore } from '../stores/agentStore';
import { ExecutionEvent, Agent } from '../types';
import { useTranslation } from '../i18n';

interface Message {
  id: string;
  type: 'event' | 'command' | 'agent_communication' | 'system';
  sender?: string;
  senderName?: string;
  recipient?: string;
  recipientName?: string;
  content: string;
  timestamp: string;
  isCommanderCommand?: boolean;
}

const getEventColor = (type: string): string => {
  switch (type) {
    case 'task_assigned':
      return '#00f0ff';
    case 'task_completed':
      return '#00ff88';
    case 'status_changed':
      return '#ff9500';
    case 'agent_added':
      return '#8b5cf6';
    case 'agent_removed':
      return '#ff3366';
    case 'commander_changed':
      return '#ffd700';
    case 'formation_changed':
      return '#00f0ff';
    case 'error':
      return '#ff3366';
    default:
      return '#00f0ff';
  }
};

const getEventIcon = (type: string): string => {
  switch (type) {
    case 'task_assigned':
      return '[TASK]';
    case 'task_completed':
      return '[DONE]';
    case 'status_changed':
      return '[STATUS]';
    case 'agent_added':
      return '[JOIN]';
    case 'agent_removed':
      return '[LEFT]';
    case 'commander_changed':
      return '[CMD]';
    case 'formation_changed':
      return '[FORM]';
    case 'error':
      return '[ERR]';
    default:
      return '[INFO]';
  }
};

interface MessageItemProps {
  message: Message;
  agent?: Agent;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, agent }) => {
  const isCommander = message.isCommanderCommand;

  return (
    <div
      style={{
        padding: '10px 12px',
        marginBottom: '8px',
        background: isCommander
          ? 'rgba(255, 215, 0, 0.1)'
          : message.type === 'agent_communication'
          ? 'rgba(139, 92, 246, 0.1)'
          : 'rgba(0, 20, 40, 0.3)',
        borderLeft: isCommander
          ? '3px solid #ffd700'
          : message.type === 'agent_communication'
          ? '3px solid #8b5cf6'
          : '3px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '0 6px 6px 0',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isCommander
          ? 'rgba(255, 215, 0, 0.15)'
          : message.type === 'agent_communication'
          ? 'rgba(139, 92, 246, 0.15)'
          : 'rgba(0, 40, 60, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isCommander
          ? 'rgba(255, 215, 0, 0.1)'
          : message.type === 'agent_communication'
          ? 'rgba(139, 92, 246, 0.1)'
          : 'rgba(0, 20, 40, 0.3)';
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Sender */}
          {message.senderName && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: isCommander ? '#ffd700' : '#00f0ff',
                textShadow: isCommander
                  ? '0 0 10px rgba(255, 215, 0, 0.5)'
                  : '0 0 5px rgba(0, 240, 255, 0.5)',
              }}
            >
              {message.senderName}
            </span>
          )}
          {message.senderName && message.recipientName && (
            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px' }}>
              →
            </span>
          )}
          {message.recipientName && (
            <span
              style={{
                fontSize: '11px',
                color: '#8b5cf6',
                textShadow: '0 0 5px rgba(139, 92, 246, 0.5)',
              }}
            >
              {message.recipientName}
            </span>
          )}
          {message.type === 'system' && (
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              SYSTEM
            </span>
          )}
        </div>

        {/* Timestamp */}
        <span
          style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Message content */}
      <div
        style={{
          fontSize: '12px',
          color: isCommander
            ? '#ffd700'
            : message.type === 'agent_communication'
            ? 'rgba(255, 255, 255, 0.9)'
            : 'rgba(255, 255, 255, 0.7)',
          lineHeight: 1.5,
        }}
      >
        {isCommander && (
          <span
            style={{
              color: '#ffd700',
              fontWeight: 'bold',
              marginRight: '6px',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            }}
          >
            [COMMAND]
          </span>
        )}
        {message.content}
      </div>

      {/* Agent info if available */}
      {agent && message.type === 'agent_communication' && (
        <div
          style={{
            marginTop: '6px',
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              padding: '1px 4px',
              background: 'rgba(139, 92, 246, 0.2)',
              borderRadius: '2px',
              color: '#8b5cf6',
            }}
          >
            {agent.role}
          </span>
          <span
            style={{
              padding: '1px 4px',
              background:
                agent.status === 'working'
                  ? 'rgba(0, 255, 136, 0.2)'
                  : 'rgba(0, 240, 255, 0.2)',
              borderRadius: '2px',
              color: agent.status === 'working' ? '#00ff88' : '#00f0ff',
            }}
          >
            {agent.status.toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

interface MessagePanelProps {
  onClose?: () => void;
}

export const MessagePanel: React.FC<MessagePanelProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { events, agents, commanderId, addEvent, clearEvents } = useAgentStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'commander' | 'tasks'>('all');

  // Convert events to messages
  const messages: Message[] = events.map((event) => {
    const isCommanderEvent = event.agentId === commanderId;
    const sender = event.agentId ? agents.find((a) => a.id === event.agentId) : undefined;

    return {
      id: event.id,
      type: isCommanderEvent && event.type === 'commander_changed' ? 'command' : 'event',
      sender: event.agentId,
      senderName: event.agentName,
      content: event.message,
      timestamp: event.timestamp,
      isCommanderCommand: isCommanderEvent && event.type === 'commander_changed',
    };
  });

  // Simulate some agent communications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add some agent communications
      if (Math.random() > 0.7 && agents.length > 1) {
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        const otherAgents = agents.filter((a) => a.id !== randomAgent.id);
        if (otherAgents.length > 0) {
          const recipient = otherAgents[Math.floor(Math.random() * otherAgents.length)];
          const communications = [
            `Completed task analysis for the current sprint`,
            `Ready to receive next assignment`,
            `Processing data from the queue`,
            `Synchronizing with team members`,
            `Running diagnostics on module`,
          ];
          addEvent({
            type: 'status_changed',
            agentId: randomAgent.id,
            agentName: randomAgent.name,
            message: communications[Math.floor(Math.random() * communications.length)],
          });
        }
      }

      // Occasionally add commander commands
      if (Math.random() > 0.9 && commanderId) {
        const commander = agents.find((a) => a.id === commanderId);
        if (commander) {
          const commands = [
            'All agents report status',
            'Begin formation rearrangement',
            'Priority task assigned to team',
            'Standby for new directives',
          ];
          addEvent({
            type: 'commander_changed',
            agentId: commander.id,
            agentName: commander.name,
            message: `COMMAND: ${commands[Math.floor(Math.random() * commands.length)]}`,
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [agents, commanderId, addEvent]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (filter === 'commander') return msg.isCommanderCommand;
    if (filter === 'tasks') return msg.type === 'event' && msg.content.toLowerCase().includes('task');
    return true;
  });

  const getAgentById = useCallback(
    (agentId?: string) => {
      return agentId ? agents.find((a) => a.id === agentId) : undefined;
    },
    [agents]
  );

  return (
    <div style={{ position: 'absolute', right: '20px', top: '80px', width: '380px', bottom: '20px' }}>
      <HolographicPanel
        title={t('messageStream')}
        position="center"
        width="100%"
        height="100%"
        onClose={onClose}
      >
        {/* Header with filter */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['all', 'commander', 'tasks'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 10px',
                  fontSize: '9px',
                  background: filter === f ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                  border: `1px solid ${filter === f ? '#00f0ff' : 'rgba(0, 240, 255, 0.3)'}`,
                  borderRadius: '4px',
                  color: filter === f ? '#00f0ff' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                {t(f as any)}
              </button>
            ))}
          </div>
          <HoloButton variant="secondary" onClick={clearEvents} style={{ padding: '4px 10px', fontSize: '9px' }}>
            {t('clear')}
          </HoloButton>
        </div>

        {/* Messages list */}
        <div
          style={{
            height: 'calc(100% - 50px)',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {filteredMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              agent={getAgentById(message.sender)}
            />
          ))}

          {filteredMessages.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '12px',
              }}
            >
              {t('noMessagesYet')}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '9px',
            color: 'rgba(0, 255, 136, 0.7)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              background: '#00ff88',
              borderRadius: '50%',
              animation: 'pulse 1.5s infinite',
              boxShadow: '0 0 6px #00ff88',
            }}
          />
          {t('live')}
        </div>
      </HolographicPanel>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default MessagePanel;
