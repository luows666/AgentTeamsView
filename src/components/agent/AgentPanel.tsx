import React, { useState, useCallback } from 'react';
import { HolographicPanel, HoloButton, StatItem } from '../common/HolographicPanel';
import { useAgentStore } from '../../stores/agentStore';
import { Agent, LLM_PROVIDERS, LLM_MODELS, AgentStatus } from '../../types';
import { useTranslation } from '../../i18n';

interface AgentPanelProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export const AgentPanel: React.FC<AgentPanelProps> = ({ position = 'left' }) => {
  const { t } = useTranslation();
  const {
    agents,
    selectedAgentId,
    commanderId,
    selectAgent,
    addAgent,
    updateAgent,
    deleteAgent,
    setCommander,
    savedCustomConfigs,
  } = useAgentStore();

  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(true);

  // Form state for new/edit agent
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    llmProvider: 'openai',
    llmModel: 'gpt-4o',
    customConfigId: '',
    systemPrompt: '',
    note: '',
  });

  // Filter custom configs for display
  const customConfigs = savedCustomConfigs.filter(
    c => c.provider === 'custom' || c.provider === 'local'
  );

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      role: '',
      llmProvider: 'openai',
      llmModel: 'gpt-4o',
      customConfigId: '',
      systemPrompt: '',
      note: '',
    });
    setIsAddingAgent(false);
    setEditingAgentId(null);
  }, []);

  const handleAddAgent = useCallback(() => {
    if (!formData.name.trim() || !formData.role.trim()) return;

    // Get the selected custom config if any
    const selectedConfig = formData.customConfigId
      ? customConfigs.find(c => c.id === formData.customConfigId)
      : null;

    addAgent({
      name: formData.name.trim(),
      role: formData.role.trim(),
      llmProvider: formData.llmProvider,
      llmModel: formData.llmModel,
      customConfigId: formData.customConfigId || undefined,
      customModelName: selectedConfig?.customModelName,
      customBaseUrl: selectedConfig?.customBaseUrl,
      systemPrompt: formData.systemPrompt,
      note: formData.note,
      status: 'idle',
      position: { x: 0, y: 0, z: 0 },
    });

    resetForm();
  }, [formData, addAgent, resetForm, customConfigs]);

  const handleUpdateAgent = useCallback(() => {
    if (!editingAgentId || !formData.name.trim() || !formData.role.trim()) return;

    // Get the selected custom config if any
    const selectedConfig = formData.customConfigId
      ? customConfigs.find(c => c.id === formData.customConfigId)
      : null;

    updateAgent(editingAgentId, {
      name: formData.name.trim(),
      role: formData.role.trim(),
      llmProvider: formData.llmProvider,
      llmModel: formData.llmModel,
      customConfigId: formData.customConfigId || undefined,
      customModelName: selectedConfig?.customModelName,
      customBaseUrl: selectedConfig?.customBaseUrl,
      systemPrompt: formData.systemPrompt,
      note: formData.note,
    });

    resetForm();
  }, [editingAgentId, formData, updateAgent, resetForm, customConfigs]);

  const handleEditAgent = useCallback((agent: Agent) => {
    setFormData({
      name: agent.name,
      role: agent.role,
      llmProvider: agent.llmProvider,
      llmModel: agent.llmModel,
      customConfigId: agent.customConfigId || '',
      systemPrompt: agent.systemPrompt,
      note: agent.note || '',
    });
    setEditingAgentId(agent.id);
    setIsAddingAgent(true);
  }, []);

  const handleDeleteAgent = useCallback((agentId: string) => {
    deleteAgent(agentId);
    if (selectedAgentId === agentId) {
      selectAgent(null);
    }
  }, [deleteAgent, selectAgent, selectedAgentId]);

  const handleSetCommander = useCallback((agentId: string) => {
    setCommander(agentId);
  }, [setCommander]);

  const handleStatusToggle = useCallback((agent: Agent) => {
    const newStatus: AgentStatus = agent.status === 'working' ? 'idle' : 'working';
    updateAgent(agent.id, { status: newStatus });
  }, [updateAgent]);

  const getStatusColor = (status: AgentStatus): string => {
    switch (status) {
      case 'working':
        return '#00ff88';
      case 'idle':
        return '#00f0ff';
      case 'error':
        return '#ff3366';
      case 'offline':
        return '#666666';
      default:
        return '#00f0ff';
    }
  };

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '12px 8px',
          background: 'rgba(0, 20, 40, 0.9)',
          border: '1px solid #00f0ff',
          borderRadius: '4px',
          color: '#00f0ff',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '12px',
          letterSpacing: '2px',
          zIndex: 1000,
        }}
      >
        {t('agentPanel')}
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        top: '20px',
        width: '320px',
        maxHeight: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000,
      }}
    >
      {/* Main Panel */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.92) 0%, rgba(0, 10, 30, 0.95) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.5)',
          borderRadius: '8px',
          padding: '16px',
          color: '#00f0ff',
          fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
          backdropFilter: 'blur(10px)',
          boxShadow: `
            0 0 20px rgba(0, 240, 255, 0.25),
            0 0 40px rgba(0, 240, 255, 0.15),
            inset 0 0 30px rgba(0, 240, 255, 0.05)
          `,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              textShadow: '0 0 10px #00f0ff',
            }}
          >
            {t('agentManagement')}
          </div>
          <button
            onClick={() => setShowPanel(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00f0ff',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: 0.7,
            }}
          >
            ✕
          </button>
        </div>

        {/* Agent Count Stats */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <StatItem label={t('total')} value={agents.length} color="#00f0ff" />
            <StatItem
              label={t('active')}
              value={agents.filter((a) => a.status === 'working').length}
              color="#00ff88"
            />
            <StatItem
              label={t('commander')}
              value={commanderId ? agents.find((a) => a.id === commanderId)?.name || t('none') : t('none')}
              color="#8b5cf6"
            />
          </div>
        </div>

        {/* Add New Agent Button */}
        {!isAddingAgent ? (
          <HoloButton variant="primary" onClick={() => setIsAddingAgent(true)}>
            {t('addAgent')}
          </HoloButton>
        ) : (
          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(0, 240, 255, 0.05)',
              borderRadius: '4px',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
          >
            <div style={{ fontSize: '12px', marginBottom: '12px', color: '#8b5cf6' }}>
              {editingAgentId ? t('editAgent') : t('newAgent')}
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder={t('agentName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder={t('role')}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={inputStyle}
              />
              <select
                value={formData.llmProvider}
                onChange={(e) => setFormData({
                  ...formData,
                  llmProvider: e.target.value,
                  llmModel: LLM_MODELS[e.target.value]?.[0] || '',
                  customConfigId: '' // Reset custom config when provider changes
                })}
                style={inputStyle}
              >
                {LLM_PROVIDERS.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
              <select
                value={formData.llmModel}
                onChange={(e) => setFormData({ ...formData, llmModel: e.target.value })}
                style={inputStyle}
              >
                {(LLM_MODELS[formData.llmProvider] || []).map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>

              {/* Custom Config Selection - Only show for custom/local providers */}
              {(formData.llmProvider === 'custom' || formData.llmProvider === 'local') && (
                <>
                  <div
                    style={{
                      fontSize: '10px',
                      opacity: 0.7,
                      marginBottom: '4px',
                      color: '#00f0ff',
                      marginTop: '4px',
                    }}
                  >
                    {t('selectCustomConfig')}
                  </div>
                  <select
                    value={formData.customConfigId}
                    onChange={(e) => setFormData({ ...formData, customConfigId: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">{t('useGlobalSettings')}</option>
                    {customConfigs.map((config) => (
                      <option key={config.id} value={config.id}>
                        {config.name} ({config.customModelName || config.model})
                      </option>
                    ))}
                  </select>
                  {customConfigs.length === 0 && (
                    <div
                      style={{
                        fontSize: '10px',
                        opacity: 0.5,
                        marginTop: '4px',
                        color: '#ff9900',
                      }}
                    >
                      {t('noCustomConfigsHint')}
                    </div>
                  )}
                </>
              )}

              <textarea
                placeholder={t('systemPrompt')}
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
              />
              <input
                type="text"
                placeholder={t('noteOptional')}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                style={inputStyle}
              />

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <HoloButton
                  variant="primary"
                  onClick={editingAgentId ? handleUpdateAgent : handleAddAgent}
                >
                  {editingAgentId ? t('update') : t('addAgent')}
                </HoloButton>
                <HoloButton variant="secondary" onClick={resetForm}>
                  {t('cancel')}
                </HoloButton>
              </div>
            </div>
          </div>
        )}

        {/* Agent List */}
        <div
          style={{
            marginTop: '16px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => selectAgent(agent.id)}
              style={{
                padding: '10px',
                marginBottom: '8px',
                background:
                  selectedAgentId === agent.id
                    ? 'rgba(0, 240, 255, 0.15)'
                    : 'rgba(0, 20, 40, 0.5)',
                borderRadius: '4px',
                border: `1px solid ${
                  selectedAgentId === agent.id
                    ? 'rgba(0, 240, 255, 0.6)'
                    : 'rgba(0, 240, 255, 0.15)'
                }`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{agent.name}</span>
                    {agent.isCommander && (
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '2px 4px',
                          background: 'rgba(139, 92, 246, 0.3)',
                          border: '1px solid #8b5cf6',
                          borderRadius: '2px',
                          color: '#8b5cf6',
                          letterSpacing: '1px',
                        }}
                      >
                        {t('cmd')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                    {agent.role}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getStatusColor(agent.status),
                      boxShadow: `0 0 8px ${getStatusColor(agent.status)}`,
                    }}
                  />
                  <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                    {agent.status}
                  </span>
                </div>
              </div>

              {/* Agent Actions */}
              {selectedAgentId === agent.id && (
                <div
                  style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(0, 240, 255, 0.15)',
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(agent);
                    }}
                    style={actionButtonStyle}
                  >
                    {agent.status === 'working' ? t('pause') : t('start')}
                  </button>
                  {!agent.isCommander && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetCommander(agent.id);
                      }}
                      style={{ ...actionButtonStyle, borderColor: '#8b5cf6', color: '#8b5cf6' }}
                    >
                      {t('setCmd')}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditAgent(agent);
                    }}
                    style={actionButtonStyle}
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAgent(agent.id);
                    }}
                    style={{ ...actionButtonStyle, borderColor: '#ff3366', color: '#ff3366' }}
                  >
                    {t('delete')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 20, 40, 0.5);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.3);
          border-radius: 2px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  background: 'rgba(0, 20, 40, 0.8)',
  border: '1px solid rgba(0, 240, 255, 0.3)',
  borderRadius: '4px',
  color: '#00f0ff',
  fontFamily: "'Rajdhani', sans-serif",
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '4px 8px',
  fontSize: '10px',
  background: 'rgba(0, 240, 255, 0.1)',
  border: '1px solid #00f0ff',
  borderRadius: '3px',
  color: '#00f0ff',
  cursor: 'pointer',
  fontFamily: "'Orbitron', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'all 0.2s ease',
};

export default AgentPanel;
