/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 */

import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Scene, Agent } from './components/Scene';
import { HolographicPanel, StatItem, HoloButton } from './components/common/HolographicPanel';
import { AgentPanel } from './components/agent/AgentPanel';
import { MessagePanel } from './components/chat/MessagePanel';
import { FormationPanel } from './components/formation/FormationPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { ChatPanel } from './components/chat/ChatPanel';
import { useAgentStore } from './stores/agentStore';
import { I18nProvider, useTranslation } from './i18n';
import './index.css';

const AppContent = () => {
  const { t } = useTranslation();
  const { agents, selectAgent, updateAgentStatus, commanderId } = useAgentStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const handleAgentClick = useCallback((agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    setSelectedAgent(agent || null);
    selectAgent(agentId);
  }, [agents, selectAgent]);

  const handleStatusChange = useCallback((agentId: string, status: Agent['status']) => {
    updateAgentStatus(agentId, status);
  }, [updateAgentStatus]);

  const workingCount = agents.filter((a) => a.status === 'working').length;
  const idleCount = agents.filter((a) => a.status === 'idle').length;
  const commander = commanderId ? agents.find((a) => a.id === commanderId) : null;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Agent Management Panel */}
      <AgentPanel position="left" />

      {/* Formation Control Panel */}
      <FormationPanel />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2, 8], fov: 60 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at center, #0a1628 0%, #000810 100%)',
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene agents={agents} onAgentClick={handleAgentClick} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          autoRotate={false}
        />
      </Canvas>

      {/* Status Panel - Top Left (next to AgentPanel) */}
      <div style={{ position: 'absolute', left: '360px', top: '20px', zIndex: 10 }}>
        <HolographicPanel title={t('systemStatus')} position="top-left" width="220px">
          <StatItem label={t('totalAgents')} value={agents.length} color="#00f0ff" />
          <StatItem label={t('working')} value={workingCount} color="#00ff88" />
          <StatItem label={t('idle')} value={idleCount} color="#00f0ff" />
          <StatItem label={t('commander')} value={commander?.name || t('none')} color="#8b5cf6" />
          <StatItem label={t('system')} value={t('online')} color="#00ff88" />

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <HoloButton variant="primary">{t('refresh')}</HoloButton>
            <HoloButton variant="secondary" onClick={() => setShowSettingsPanel(true)}>{t('settings')}</HoloButton>
          </div>
        </HolographicPanel>
      </div>

      {/* Selected Agent Panel - Top Right */}
      {selectedAgent && (
        <HolographicPanel
          title={`Agent: ${selectedAgent.name}`}
          position="top-right"
          width="260px"
        >
          <StatItem label="Role" value={selectedAgent.role} color="#8b5cf6" />
          <StatItem
            label="Status"
            value={selectedAgent.status.toUpperCase()}
            color={
              selectedAgent.status === 'working'
                ? '#00ff88'
                : selectedAgent.status === 'error'
                ? '#ff3366'
                : '#00f0ff'
            }
          />

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <HoloButton
              variant="primary"
              onClick={() =>
                handleStatusChange(
                  selectedAgent.id,
                  selectedAgent.status === 'working' ? 'idle' : 'working'
                )
              }
            >
              {selectedAgent.status === 'working' ? t('pause') : t('activate')}
            </HoloButton>
            <HoloButton variant="secondary">{t('viewDetails')}</HoloButton>
          </div>
        </HolographicPanel>
      )}

      {/* Log Panel - Bottom Left */}
      <HolographicPanel title={t('activityLog')} position="bottom-left" width="320px" height="200px">
        <div
          style={{
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
          <div style={{ color: '#00ff88' }}>[{new Date().toLocaleTimeString()}] {t('systemInitialized')}</div>
          <div style={{ color: '#00f0ff' }}>[{new Date().toLocaleTimeString()}] {t('loadedAgents').replace('{count}', agents.length.toString())}</div>
          <div style={{ color: '#8b5cf6' }}>[{new Date().toLocaleTimeString()}] {t('rendering3DScene')}</div>
          {selectedAgent && (
            <div style={{ color: '#00ff88' }}>
              [{new Date().toLocaleTimeString()}] {t('selected').replace('{name}', selectedAgent.name)}
            </div>
          )}
        </div>
      </HolographicPanel>

      {/* Instructions Panel - Bottom Right */}
      <HolographicPanel title={t('controls')} position="bottom-right" width="220px">
        <div style={{ fontSize: '11px', lineHeight: 1.8, opacity: 0.8 }}>
          <div><span style={{ color: '#00f0ff' }}>{t('leftClick')}</span> - {t('selectAgent')}</div>
          <div><span style={{ color: '#00f0ff' }}>{t('drag')}</span> - {t('rotateView')}</div>
          <div><span style={{ color: '#00f0ff' }}>{t('scroll')}</span> - {t('zoomInOut')}</div>
          <div><span style={{ color: '#00f0ff' }}>{t('rightDrag')}</span> - {t('panView')}</div>
        </div>
      </HolographicPanel>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#00f0ff',
          textShadow: '0 0 20px #00f0ff, 0 0 40px #00f0ff',
          letterSpacing: '8px',
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        {t('appTitle')}
      </div>

      {/* Panel Toggle Buttons - Top Center */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setShowChatPanel(!showChatPanel)}
          style={{
            padding: '8px 16px',
            background: showChatPanel ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 20, 40, 0.8)',
            border: '1px solid #00f0ff',
            borderRadius: '4px',
            color: '#00f0ff',
            fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            cursor: 'pointer',
            boxShadow: showChatPanel ? '0 0 15px rgba(0, 240, 255, 0.5)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {showChatPanel ? t('hideChat') : t('showChat')}
        </button>
        <button
          onClick={() => setShowMessagePanel(!showMessagePanel)}
          style={{
            padding: '8px 16px',
            background: showMessagePanel ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 20, 40, 0.8)',
            border: '1px solid #8b5cf6',
            borderRadius: '4px',
            color: '#8b5cf6',
            fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            cursor: 'pointer',
            boxShadow: showMessagePanel ? '0 0 15px rgba(139, 92, 246, 0.5)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {showMessagePanel ? t('hideMessages') : t('showMessages')}
        </button>
      </div>

      {/* Right Side Vertical Toolbar */}
      <div
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          title={t('settings')}
          style={{
            width: '48px',
            height: '48px',
            background: showSettingsPanel ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 20, 40, 0.8)',
            border: '1px solid #00ff88',
            borderRadius: '8px',
            color: '#00ff88',
            fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: showSettingsPanel ? '0 0 15px rgba(0, 255, 136, 0.5)' : 'none',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Chat Panel */}
      {showChatPanel && <ChatPanel onClose={() => setShowChatPanel(false)} />}

      {/* Message Panel */}
      {showMessagePanel && <MessagePanel onClose={() => setShowMessagePanel(false)} />}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
