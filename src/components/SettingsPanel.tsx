import React, { useState, useEffect } from 'react';
import { HolographicPanel, HoloButton } from './HolographicPanel';
import { useAgentStore, CustomLLMConfig } from '../stores/agentStore';
import { useTranslation, LANGUAGES } from '../i18n';

// LLM Provider type
export type LLMProvider = 'openai' | 'anthropic' | 'deepseek' | 'ollama' | 'custom';

// Re-export for backward compatibility
export type SavedConfig = CustomLLMConfig;

// Model options for each provider
export const MODEL_OPTIONS: Record<LLMProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  ollama: ['llama2', 'mistral', 'codellama', 'phi3'],
  custom: ['custom'],
};

// Provider display names
export const PROVIDER_NAMES: Record<LLMProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Claude (Anthropic)',
  deepseek: 'DeepSeek',
  ollama: 'Ollama (Local)',
  custom: 'Custom',
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { t, language, setLanguage } = useTranslation();
  const { settings, updateSettings, savedCustomConfigs, addCustomConfig, deleteCustomConfig } = useAgentStore();

  // Local state for form
  const [provider, setProvider] = useState<LLMProvider>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [customModelName, setCustomModelName] = useState(settings.customModelName || '');
  const [customBaseUrl, setCustomBaseUrl] = useState(settings.customBaseUrl || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Saved configurations state - use store's custom configs
  const [configName, setConfigName] = useState('');
  const [showConfigInput, setShowConfigInput] = useState(false);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);

  // Filter configs based on selected provider
  const filteredConfigs = provider === 'custom'
    ? savedCustomConfigs.filter(c => c.provider === 'custom' || c.provider === 'local')
    : savedCustomConfigs.filter(c => c.provider === provider);

  // Save current configuration
  const handleSaveConfig = () => {
    if (!configName.trim()) {
      setSaveMessage(t('enterConfigName'));
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // Use store action to add custom config
    addCustomConfig({
      name: configName.trim(),
      provider,
      apiKey,
      model,
      customModelName: provider === 'custom' ? customModelName : undefined,
      customBaseUrl: provider === 'custom' ? customBaseUrl : undefined,
    });

    setConfigName('');
    setShowConfigInput(false);
    setSaveMessage(t('configSaved'));
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Load a saved configuration
  const handleLoadConfig = (config: SavedConfig) => {
    setProvider(config.provider);
    setApiKey(config.apiKey);
    setModel(config.model);
    setCustomModelName(config.customModelName || '');
    setCustomBaseUrl(config.customBaseUrl || '');
    setCurrentConfigId(config.id);

    // Also update the store
    updateSettings({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      customModelName: config.customModelName || '',
      customBaseUrl: config.customBaseUrl || '',
    });

    setSaveMessage(t('configLoaded'));
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Delete a saved configuration
  const handleDeleteConfig = (configId: string) => {
    if (confirm(t('confirmDelete'))) {
      deleteCustomConfig(configId);

      if (currentConfigId === configId) {
        setCurrentConfigId(null);
      }

      setSaveMessage(t('configDeleted'));
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Mask API key for display
  const maskApiKey = (key: string): string => {
    if (!key) return t('notSet');
    if (key.length <= 8) return '********';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  };

  // Sync with store when settings change
  useEffect(() => {
    setProvider(settings.provider);
    setApiKey(settings.apiKey);
    setModel(settings.model);
    setCustomModelName(settings.customModelName || '');
    setCustomBaseUrl(settings.customBaseUrl || '');
  }, [settings]);

  // Handle provider change
  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    // Reset model to first available option for the new provider (except for custom)
    if (newProvider !== 'custom') {
      setModel(MODEL_OPTIONS[newProvider][0]);
    }
  };

  // Save settings
  const handleSave = () => {
    updateSettings({
      provider,
      apiKey,
      model,
      customModelName: provider === 'custom' ? customModelName : '',
      customBaseUrl: provider === 'custom' ? customBaseUrl : '',
    });
    setSaveMessage(t('settingsSaved'));
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Load settings from localStorage
  const handleLoad = () => {
    const savedSettings = localStorage.getItem('agentTeamSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setProvider(parsed.provider || 'openai');
        setApiKey(parsed.apiKey || '');
        setModel(parsed.model || MODEL_OPTIONS[parsed.provider || 'openai'][0]);
        setCustomModelName(parsed.customModelName || '');
        setCustomBaseUrl(parsed.customBaseUrl || '');
        setSaveMessage(t('settingsLoaded'));
        setTimeout(() => setSaveMessage(null), 3000);
      } catch {
        setSaveMessage(t('failedToLoadSettings'));
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } else {
      setSaveMessage(t('noSavedSettings'));
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Save settings to localStorage
  const handleExport = () => {
    const settingsToSave = {
      provider,
      apiKey: apiKey ? '********' : '', // Don't save actual API key
      model,
      customModelName: provider === 'custom' ? customModelName : '',
      customBaseUrl: provider === 'custom' ? customBaseUrl : '',
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('agentTeamSettings', JSON.stringify(settingsToSave));
    setSaveMessage(t('settingsExported'));
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Apply settings (would trigger actual LLM configuration)
  const handleApply = () => {
    updateSettings({
      provider,
      apiKey,
      model,
      customModelName: provider === 'custom' ? customModelName : '',
      customBaseUrl: provider === 'custom' ? customBaseUrl : '',
    });
    setSaveMessage(t('settingsApplied'));
    setTimeout(() => setSaveMessage(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <HolographicPanel
      title={t('settings')}
      position="center"
      width="480px"
      className="settings-panel"
      onClose={onClose}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
        {/* Provider Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.7,
              marginBottom: '8px',
              color: '#00f0ff',
            }}
          >
            {t('llmProvider')}
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
            }}
          >
            {(Object.keys(PROVIDER_NAMES) as LLMProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => handleProviderChange(p)}
                style={{
                  padding: '12px 16px',
                  background:
                    provider === p
                      ? 'rgba(0, 240, 255, 0.2)'
                      : 'rgba(0, 20, 40, 0.8)',
                  border: `1px solid ${
                    provider === p ? '#00f0ff' : 'rgba(0, 240, 255, 0.3)'
                  }`,
                  borderRadius: '4px',
                  color: provider === p ? '#00f0ff' : 'rgba(255, 255, 255, 0.7)',
                  fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow:
                    provider === p
                      ? '0 0 15px rgba(0, 240, 255, 0.4)'
                      : 'none',
                }}
              >
                {PROVIDER_NAMES[p]}
              </button>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.7,
              marginBottom: '8px',
              color: '#00f0ff',
            }}
          >
            {t('apiKey')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '4px',
                color: '#00f0ff',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: showApiKey ? '#ff3366' : 'rgba(0, 240, 255, 0.7)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px',
              }}
            >
              {showApiKey ? t('hide') : t('show')}
            </button>
          </div>
          <div
            style={{
              fontSize: '10px',
              opacity: 0.5,
              marginTop: '4px',
              color: '#00f0ff',
            }}
          >
            {provider === 'ollama'
              ? t('leaveEmptyForLocal')
              : t('apiKeyStoredLocally')}
          </div>
        </div>

        {/* Model Selection */}
        {provider === 'custom' ? (
          /* Custom Provider Configuration */
          <div style={{ marginBottom: '24px' }}>
            {/* Custom Model Name */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.7,
                  marginBottom: '8px',
                  color: '#00f0ff',
                }}
              >
                {t('customModelName')}
              </label>
              <input
                type="text"
                value={customModelName}
                onChange={(e) => setCustomModelName(e.target.value)}
                placeholder="e.g., gpt-4o, claude-3-5-sonnet"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 20, 40, 0.8)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '4px',
                  color: '#00f0ff',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Custom Base URL */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  opacity: 0.7,
                  marginBottom: '8px',
                  color: '#00f0ff',
                }}
              >
                {t('customBaseUrl')}
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder="e.g., https://api.example.com/v1"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0, 20, 40, 0.8)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '4px',
                  color: '#00f0ff',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  fontSize: '10px',
                  opacity: 0.5,
                  marginTop: '4px',
                  color: '#00f0ff',
                }}
              >
                {t('customBaseUrlHint')}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Model Selection */
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.7,
                marginBottom: '8px',
                color: '#00f0ff',
              }}
            >
              {t('model')}
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '4px',
                color: '#00f0ff',
                fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              {MODEL_OPTIONS[provider].map((m) => (
                <option
                  key={m}
                  value={m}
                  style={{
                    background: '#001428',
                    color: '#00f0ff',
                  }}
                >
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Settings Display */}
        <div
          style={{
            padding: '12px',
            background: 'rgba(0, 240, 255, 0.05)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.7,
              marginBottom: '8px',
              color: '#00f0ff',
            }}
          >
            {t('currentConfiguration')}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            <div>
              <span style={{ opacity: 0.6 }}>{t('provider')}:</span>{' '}
              <span style={{ color: '#8b5cf6' }}>{PROVIDER_NAMES[provider]}</span>
            </div>
            <div>
              <span style={{ opacity: 0.6 }}>{t('model')}:</span>{' '}
              <span style={{ color: '#00ff88' }}>{model}</span>
            </div>
            <div>
              <span style={{ opacity: 0.6 }}>{t('apiKey')}:</span>{' '}
              <span style={{ color: '#00f0ff' }}>
                {apiKey ? (showApiKey ? apiKey : '********') : t('notSet')}
              </span>
            </div>
          </div>
        </div>

        {/* Saved Configurations Section */}
        <div
          style={{
            marginBottom: '20px',
            padding: '12px',
            background: 'rgba(0, 240, 255, 0.03)',
            border: '1px solid rgba(0, 240, 255, 0.15)',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: 0.7,
                color: '#00f0ff',
              }}
            >
              {provider === 'custom' ? t('customConfigs') : t('savedConfigs')}
            </div>
            <button
              onClick={() => setShowConfigInput(!showConfigInput)}
              style={{
                padding: '4px 10px',
                background: 'rgba(0, 240, 255, 0.15)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '3px',
                color: '#00f0ff',
                fontSize: '10px',
                cursor: 'pointer',
                fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
              }}
            >
              {showConfigInput ? t('cancel') : '+ ' + t('saveCurrentConfig')}
            </button>
          </div>

          {/* Save Config Input */}
          {showConfigInput && (
            <div
              style={{
                marginBottom: '12px',
                padding: '10px',
                background: 'rgba(0, 20, 40, 0.6)',
                borderRadius: '4px',
              }}
            >
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder={t('enterConfigName')}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '8px',
                  background: 'rgba(0, 20, 40, 0.8)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '4px',
                  color: '#00f0ff',
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveConfig();
                  }
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveConfig}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'rgba(0, 255, 136, 0.2)',
                    border: '1px solid rgba(0, 255, 136, 0.5)',
                    borderRadius: '4px',
                    color: '#00ff88',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                    fontWeight: 'bold',
                  }}
                >
                  {t('save')}
                </button>
              </div>
            </div>
          )}

          {/* Config List */}
          {filteredConfigs.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '12px',
              }}
            >
              {provider === 'custom' ? t('noCustomConfigs') : t('noSavedConfigs')}
            </div>
          ) : (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredConfigs.map((config) => (
                <div
                  key={config.id}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    background:
                      currentConfigId === config.id
                        ? 'rgba(0, 240, 255, 0.1)'
                        : 'rgba(0, 20, 40, 0.4)',
                    border: `1px solid ${
                      currentConfigId === config.id
                        ? 'rgba(0, 255, 136, 0.5)'
                        : 'rgba(0, 240, 255, 0.15)'
                    }`,
                    borderRadius: '4px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          color: '#8b5cf6',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                        }}
                      >
                        {config.name}
                      </span>
                      {currentConfigId === config.id && (
                        <span
                          style={{
                            padding: '2px 6px',
                            background: 'rgba(0, 255, 136, 0.2)',
                            borderRadius: '2px',
                            color: '#00ff88',
                            fontSize: '9px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {t('current')}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleLoadConfig(config)}
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(0, 240, 255, 0.15)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          borderRadius: '3px',
                          color: '#00f0ff',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                        }}
                      >
                        {t('switchConfig')}
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(config.id)}
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(255, 51, 102, 0.15)',
                          border: '1px solid rgba(255, 51, 102, 0.3)',
                          borderRadius: '3px',
                          color: '#ff3366',
                          fontSize: '10px',
                          cursor: 'pointer',
                          fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                        }}
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                  >
                    <div>
                      {t('provider')}: <span style={{ color: '#8b5cf6' }}>{PROVIDER_NAMES[config.provider]}</span>
                    </div>
                    <div>
                      {t('model')}: <span style={{ color: '#00ff88' }}>{config.model}</span>
                    </div>
                    <div>
                      {t('apiKey')}: <span style={{ color: '#00f0ff' }}>{maskApiKey(config.apiKey)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div
            style={{
              padding: '10px',
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '4px',
              marginBottom: '16px',
              color: '#00ff88',
              fontSize: '12px',
              textAlign: 'center',
              animation: 'pulse 0.5s ease-in-out',
            }}
          >
            {saveMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '12px',
          }}
        >
          <HoloButton variant="primary" onClick={handleSave}>
            {t('save')}
          </HoloButton>
          <HoloButton variant="secondary" onClick={handleLoad}>
            {t('load')}
          </HoloButton>
          <HoloButton variant="secondary" onClick={handleExport}>
            {t('export')}
          </HoloButton>
        </div>

        <HoloButton variant="primary" onClick={handleApply}>
          {t('applySettings')}
        </HoloButton>

        {/* Language Switcher */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(0, 240, 255, 0.05)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '4px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.7,
              marginBottom: '8px',
              color: '#00f0ff',
            }}
          >
            {t('selectLanguage')}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background:
                    language === lang.code
                      ? 'rgba(0, 240, 255, 0.2)'
                      : 'rgba(0, 20, 40, 0.8)',
                  border: `1px solid ${
                    language === lang.code ? '#00f0ff' : 'rgba(0, 240, 255, 0.3)'
                  }`,
                  borderRadius: '4px',
                  color: language === lang.code ? '#00f0ff' : 'rgba(255, 255, 255, 0.7)',
                  fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow:
                    language === lang.code
                      ? '0 0 15px rgba(0, 240, 255, 0.4)'
                      : 'none',
                }}
              >
                {lang.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 51, 102, 0.5)',
              borderRadius: '4px',
              color: '#ff3366',
              padding: '8px 24px',
              fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 51, 102, 0.1)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 51, 102, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {t('close')}
          </button>
        </div>
      </div>

      <style>{`
        .settings-panel::-webkit-scrollbar {
          width: 4px;
        }
        .settings-panel::-webkit-scrollbar-track {
          background: rgba(0, 240, 255, 0.1);
          border-radius: 2px;
        }
        .settings-panel::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.4);
          border-radius: 2px;
        }
        .settings-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.6);
        }
      `}</style>
    </HolographicPanel>
  );
};

export default SettingsPanel;
