import React, { useMemo } from 'react';
import { HolographicPanel, HoloButton } from './HolographicPanel';
import { useAgentStore } from '../stores/agentStore';
import { FormationType, DEFAULT_FORMATIONS } from '../types';
import { useTranslation } from '../i18n';

interface FormationOption {
  type: FormationType;
  labelKey: string;
  icon: string;
  descriptionKey: string;
}

const FORMATION_OPTIONS: FormationOption[] = [
  {
    type: 'circle',
    labelKey: 'circle',
    icon: '◯',
    descriptionKey: 'circleDesc',
  },
  {
    type: 'matrix',
    labelKey: 'matrix',
    icon: '⊞',
    descriptionKey: 'matrixDesc',
  },
  {
    type: 'triangle',
    labelKey: 'triangle',
    icon: '△',
    descriptionKey: 'triangleDesc',
  },
  {
    type: 'herring',
    labelKey: 'herring',
    icon: '⌬',
    descriptionKey: 'herringDesc',
  },
];

// Formation preview component
interface FormationPreviewProps {
  type: FormationType;
}

const FormationPreview: React.FC<FormationPreviewProps> = ({ type }) => {
  const positions = useMemo(() => {
    const defaultPositions = DEFAULT_FORMATIONS[type] || [];
    // Scale down positions for preview
    return defaultPositions.map(p => ({
      x: p.x * 0.15,
      z: p.z * 0.15,
    }));
  }, [type]);

  return (
    <svg width="80" height="80" viewBox="-3 -3 6 6" style={{ margin: '0 auto', display: 'block' }}>
      {/* Grid lines */}
      <line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="0.05" />
      <line x1="0" y1="-2.5" x2="0" y2="2.5" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="0.05" />

      {/* Formation positions */}
      {positions.map((pos, index) => {
        const isCommander = index === 0;
        return (
          <circle
            key={index}
            cx={pos.x}
            cy={pos.z}
            r={isCommander ? 0.25 : 0.18}
            fill={isCommander ? '#00ff88' : '#00f0ff'}
            opacity={0.8}
          />
        );
      })}

      {/* Commander indicator */}
      {positions.length > 0 && (
        <circle
          cx={positions[0].x}
          cy={positions[0].z}
          r={0.35}
          fill="none"
          stroke="#00ff88"
          strokeWidth="0.08"
          strokeDasharray="0.2 0.1"
        />
      )}
    </svg>
  );
};

export const FormationPanel: React.FC = () => {
  const { t } = useTranslation();
  const formationType = useAgentStore((state) => state.formationType);
  const setFormationType = useAgentStore((state) => state.setFormationType);
  const isHeatmapEnabled = useAgentStore((state) => state.isHeatmapEnabled);
  const toggleHeatmap = useAgentStore((state) => state.toggleHeatmap);

  const handleFormationSelect = (type: FormationType) => {
    setFormationType(type);
  };

  return (
    <HolographicPanel
      title={t('formationControl')}
      position="top-left"
      width="280px"
    >
      {/* Formation selection */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: 0.7,
          marginBottom: '8px',
        }}>
          {t('selectFormation')}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}>
          {FORMATION_OPTIONS.map((option) => (
            <div
              key={option.type}
              onClick={() => handleFormationSelect(option.type)}
              style={{
                padding: '10px 8px',
                background: formationType === option.type
                  ? 'rgba(0, 240, 255, 0.15)'
                  : 'rgba(0, 240, 255, 0.05)',
                border: `1px solid ${formationType === option.type ? '#00f0ff' : 'rgba(0, 240, 255, 0.2)'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                if (formationType !== option.type) {
                  e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{
                fontSize: '18px',
                marginBottom: '4px',
                color: formationType === option.type ? '#00f0ff' : 'rgba(0, 240, 255, 0.6)',
              }}>
                {option.icon}
              </div>
              <div style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: formationType === option.type ? '#00f0ff' : 'rgba(255, 255, 255, 0.7)',
              }}>
                {t(option.labelKey as any)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div style={{
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
        marginBottom: '16px',
      }}>
        <div style={{
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          opacity: 0.7,
          marginBottom: '8px',
          textAlign: 'center',
        }}>
          {t('preview')}
        </div>
        <FormationPreview type={formationType} />
        <div style={{
          fontSize: '9px',
          opacity: 0.6,
          textAlign: 'center',
          marginTop: '8px',
        }}>
          {t(FORMATION_OPTIONS.find(o => o.type === formationType)?.descriptionKey as any)}
        </div>
      </div>

      {/* Heatmap toggle */}
      <div style={{
        padding: '12px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '4px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '2px',
            }}>
              {t('workloadHeatmap')}
            </div>
            <div style={{
              fontSize: '9px',
              opacity: 0.6,
            }}>
              {t('showAgentDistribution')}
            </div>
          </div>

          <div
            onClick={toggleHeatmap}
            style={{
              width: '48px',
              height: '24px',
              background: isHeatmapEnabled
                ? 'linear-gradient(90deg, #00f0ff, #00ff88)'
                : 'rgba(100, 100, 100, 0.3)',
              borderRadius: '12px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: `1px solid ${isHeatmapEnabled ? '#00ff88' : 'rgba(100, 100, 100, 0.5)'}`,
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              background: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: isHeatmapEnabled ? '26px' : '3px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }} />
          </div>
        </div>

        {/* Heatmap legend */}
        {isHeatmapEnabled && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
          }}>
            <div style={{
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.7,
              marginBottom: '6px',
            }}>
              {t('legend')}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{ fontSize: '9px', opacity: 0.7 }}>{t('idle')}</span>
              <div style={{
                flex: 1,
                height: '8px',
                background: 'linear-gradient(90deg, #00f0ff, #00ff88, #ffff00, #ff8800, #ff3366)',
                borderRadius: '2px',
              }} />
              <span style={{ fontSize: '9px', opacity: 0.7 }}>{t('busy')}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </HolographicPanel>
  );
};

export default FormationPanel;
