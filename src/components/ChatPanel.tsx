import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HolographicPanel, HoloButton } from './HolographicPanel';
import { useAgentStore } from '../stores/agentStore';
import { useTranslation } from '../i18n';
import { LLMService, buildCommanderContext, LLMMessage } from '../services/llmService';

// Chat message types
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Fallback responses when LLM is not configured
const fallbackResponses = [
  "Understood. I'll coordinate the team accordingly.",
  "Message received. Analyzing the current task status...",
  "All agents are operating at optimal capacity. What are your further instructions?",
  "The formation has been adjusted. Is there anything else you'd like me to handle?",
  "I've dispatched the necessary agents to address your request.",
  "System ready. Waiting for your next command, Commander.",
  "Task allocation complete. The team is executing as planned.",
  "Acknowledged. I'll continue monitoring agent performance.",
  "New directive received. Coordinating inter-agent communication now.",
  "All systems nominal. Ready to receive additional instructions.",
];

interface ChatPanelProps {
  onClose?: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { commanderId, agents, settings, savedCustomConfigs, tasks } = useAgentStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Greetings, Commander. How may I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get commander info
  const commander = commanderId ? agents.find((a) => a.id === commanderId) : null;

  // Get active tasks (limited to last 10)
  const activeTasks = tasks
    .filter((task) => task.status !== 'completed')
    .slice(0, 10)
    .map((task) => ({ title: task.title, status: task.status }));

  // Check if LLM is configured
  const isLLMConfigured = () => {
    if (!settings.apiKey && settings.provider !== 'ollama') {
      return false;
    }
    if (settings.provider === 'custom' && !settings.customBaseUrl) {
      return false;
    }
    return true;
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build LLM messages from chat history
  const buildLLMMessages = useCallback((chatMessages: ChatMessage[]): LLMMessage[] => {
    // Build context with commander info
    const contextMessages = buildCommanderContext(commander, agents, activeTasks);

    // Convert chat history to LLM message format
    const chatHistory: LLMMessage[] = chatMessages
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

    // Combine context and chat history
    return [...contextMessages, ...chatHistory];
  }, [commander, agents, activeTasks]);

  // Handle sending a message with real LLM call
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setError(null);
    setIsTyping(true);

    // Check if LLM is properly configured
    if (!isLLMConfigured()) {
      // Use fallback response
      setTimeout(() => {
        const response = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `${response}\n\n(Note: LLM not configured. Please configure API key in Settings.)`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 500 + Math.random() * 500);
      return;
    }

    try {
      // Create LLM service instance
      const llmService = new LLMService(settings, commander?.customConfigId
        ? savedCustomConfigs.find((c) => c.id === commander.customConfigId)
        : undefined);

      // Build messages including context
      const allMessages = [...messages, userMessage];
      const llmMessages = buildLLMMessages(allMessages);

      // Add user message to LLM messages
      llmMessages.push({
        role: 'user',
        content: inputValue.trim(),
      });

      // Call LLM API
      const response = await llmService.chat(llmMessages, {
        temperature: 0.7,
        maxTokens: 2048,
      });

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      // Handle error
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      // Add error message
      const errorAssistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}. Please check your API settings.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorAssistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ position: 'absolute', left: '20px', top: '80px', right: '20px', bottom: '20px' }}>
      <HolographicPanel
        title={t('chatWithCommander')}
        position="center"
        width="100%"
        height="100%"
        onClose={onClose}
      >
        {/* Commander Info Banner */}
        {commander && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid rgba(255, 215, 0, 0.3)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffd700, #ff9500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
              }}
            >
              {commander.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#ffd700',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                }}
              >
                {commander.name}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {t('commander')} - {commander.role}
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div
          style={{
            height: 'calc(100% - 180px)',
            overflowY: 'auto',
            paddingRight: '8px',
            marginBottom: '16px',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '16px',
              }}
            >
              {/* Message bubble */}
              <div
                style={{
                  maxWidth: '80%',
                  padding: '12px 16px',
                  borderRadius: message.role === 'user'
                    ? '12px 12px 4px 12px'
                    : '12px 12px 12px 4px',
                  background: message.role === 'user'
                    ? 'rgba(0, 240, 255, 0.2)'
                    : 'rgba(255, 215, 0, 0.1)',
                  border: message.role === 'user'
                    ? '1px solid rgba(0, 240, 255, 0.4)'
                    : '1px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: message.role === 'user'
                    ? '0 0 10px rgba(0, 240, 255, 0.2)'
                    : '0 0 10px rgba(255, 215, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: message.role === 'user' ? '#00f0ff' : '#ffd700',
                    lineHeight: 1.5,
                    textShadow: message.role === 'user'
                      ? '0 0 5px rgba(0, 240, 255, 0.3)'
                      : '0 0 5px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  {message.content}
                </div>
              </div>

              {/* Timestamp */}
              <div
                style={{
                  fontSize: '9px',
                  color: 'rgba(255, 255, 255, 0.3)',
                  marginTop: '4px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    background: '#ffd700',
                    borderRadius: '50%',
                    animation: 'bounce 1s infinite',
                    animationDelay: '0ms',
                  }}
                />
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    background: '#ffd700',
                    borderRadius: '50%',
                    animation: 'bounce 1s infinite',
                    animationDelay: '150ms',
                  }}
                />
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    background: '#ffd700',
                    borderRadius: '50%',
                    animation: 'bounce 1s infinite',
                    animationDelay: '300ms',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 215, 0, 0.7)',
                  fontStyle: 'italic',
                }}
              >
                {commander?.name || t('commander')} is thinking...
              </span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div
              style={{
                padding: '8px 12px',
                marginTop: '8px',
                background: 'rgba(255, 51, 102, 0.15)',
                border: '1px solid rgba(255, 51, 102, 0.4)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#ff3366',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Error:</div>
              <div>{error}</div>
            </div>
          )}

          {/* LLM status indicator */}
          {!isLLMConfigured() && messages.length <= 1 && (
            <div
              style={{
                padding: '8px 12px',
                marginTop: '8px',
                background: 'rgba(255, 165, 0, 0.15)',
                border: '1px solid rgba(255, 165, 0, 0.4)',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#ffa500',
              }}
            >
              LLM not configured. Please set up your API key in Settings to enable AI responses.
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t('typeMessage')}
              rows={2}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(0, 40, 60, 0.5)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '8px',
                color: '#00f0ff',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxShadow: '0 0 10px rgba(0, 240, 255, 0.1)',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0, 240, 255, 0.6)';
                e.target.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                e.target.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.1)';
              }}
            />
          </div>
          <HoloButton variant="primary" onClick={handleSendMessage}>
            {t('send')}
          </HoloButton>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginRight: '4px',
            }}
          >
            {t('quickCommands')}:
          </span>
          {[
            { label: t('cmdStatus'), action: 'Check team status' },
            { label: t('cmdFormation'), action: 'Check formation' },
            { label: t('cmdTasks'), action: 'View all tasks' },
          ].map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => setInputValue(cmd.action)}
              style={{
                padding: '4px 10px',
                fontSize: '9px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '4px',
                color: 'rgba(0, 240, 255, 0.8)',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: "'Rajdhani', sans-serif",
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
                e.currentTarget.style.borderColor = '#00f0ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
              }}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </HolographicPanel>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
