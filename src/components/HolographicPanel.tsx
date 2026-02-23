import React, { ReactNode } from 'react';

export interface HolographicPanelProps {
  title?: string;
  children: ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  width?: string;
  height?: string;
  className?: string;
  onClose?: () => void;
}

const positionStyles: Record<string, React.CSSProperties> = {
  'top-left': { top: '20px', left: '20px' },
  'top-right': { top: '20px', right: '20px' },
  'bottom-left': { bottom: '20px', left: '20px' },
  'bottom-right': { bottom: '20px', right: '20px' },
  'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
};

export const HolographicPanel: React.FC<HolographicPanelProps> = ({
  title,
  children,
  position = 'top-left',
  width = '300px',
  height = 'auto',
  className = '',
  onClose,
}) => {
  const positionStyle = positionStyles[position];

  return (
    <div
      className={`holo-panel ${className}`}
      style={{
        position: 'absolute',
        zIndex: position === 'center' ? 1000 : 10,
        ...positionStyle,
        width,
        height,
        background: 'linear-gradient(135deg, rgba(0, 20, 40, 0.85) 0%, rgba(0, 10, 30, 0.9) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        borderRadius: '8px',
        padding: '16px',
        color: '#00f0ff',
        fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
        backdropFilter: 'blur(10px)',
        boxShadow: `
          0 0 20px rgba(0, 240, 255, 0.2),
          0 0 40px rgba(0, 240, 255, 0.1),
          inset 0 0 30px rgba(0, 240, 255, 0.05)
        `,
        overflow: 'hidden',
        animation: 'panelFadeIn 0.5s ease-out',
      }}
    >
      {/* Corner decorations */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '20px',
        height: '20px',
        borderTop: '2px solid #00f0ff',
        borderLeft: '2px solid #00f0ff',
        borderTopLeftRadius: '8px',
        boxShadow: 'inset 2px 2px 4px rgba(0, 240, 255, 0.3)',
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '20px',
        height: '20px',
        borderTop: '2px solid #00f0ff',
        borderRight: '2px solid #00f0ff',
        borderTopRightRadius: '8px',
        boxShadow: 'inset -2px 2px 4px rgba(0, 240, 255, 0.3)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '20px',
        height: '20px',
        borderBottom: '2px solid #00f0ff',
        borderLeft: '2px solid #00f0ff',
        borderBottomLeftRadius: '8px',
        boxShadow: 'inset 2px -2px 4px rgba(0, 240, 255, 0.3)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '20px',
        height: '20px',
        borderBottom: '2px solid #00f0ff',
        borderRight: '2px solid #00f0ff',
        borderBottomRightRadius: '8px',
        boxShadow: 'inset -2px -2px 4px rgba(0, 240, 255, 0.3)',
      }} />

      {/* Scan line effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)',
          animation: 'scanLine 3s linear infinite',
          opacity: 0.6,
        }}
      />

      {/* Title */}
      {title && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '16px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
            textShadow: '0 0 10px #00f0ff',
          }}
        >
          <span>{title}</span>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0 4px',
                lineHeight: 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ff3366';
                e.currentTarget.style.textShadow = '0 0 10px #ff3366';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.textShadow = 'none';
              }}
              title="Close"
            >
              x
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      <style>{`
        @keyframes panelFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scanLine {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(200px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .holo-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: '-100%';
          width: '100%';
          height: '100%';
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 240, 255, 0.1),
            transparent
          );
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          from {
            left: -100%;
          }
          to {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
};

// Stat display component
export interface StatItemProps {
  label: string;
  value: string | number;
  color?: string;
}

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  color = '#00f0ff',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid rgba(0, 240, 255, 0.1)',
      }}
    >
      <span style={{
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        opacity: 0.7,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: '14px',
        fontWeight: 'bold',
        color,
        textShadow: `0 0 10px ${color}`,
      }}>
        {value}
      </span>
    </div>
  );
};

// Button component
export interface HoloButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const HoloButton: React.FC<HoloButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  const color = variant === 'primary' ? '#00f0ff' : '#8b5cf6';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 20px',
        background: `rgba(${variant === 'primary' ? '0, 240, 255' : '139, 92, 246'}, 0.1)`,
        border: `1px solid ${disabled ? 'rgba(100, 100, 100, 0.3)' : color}`,
        borderRadius: '4px',
        color: disabled ? 'rgba(255, 255, 255, 0.3)' : color,
        fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: disabled ? 'none' : `0 0 10px rgba(0, 240, 255, 0.3)`,
        textShadow: disabled ? 'none' : `0 0 5px ${color}`,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = `rgba(${variant === 'primary' ? '0, 240, 255' : '139, 92, 246'}, 0.2)`;
          e.currentTarget.style.boxShadow = `0 0 20px rgba(0, 240, 255, 0.5)`;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = `rgba(${variant === 'primary' ? '0, 240, 255' : '139, 92, 246'}, 0.1)`;
          e.currentTarget.style.boxShadow = `0 0 10px rgba(0, 240, 255, 0.3)`;
        }
      }}
    >
      {children}
    </button>
  );
};

export default HolographicPanel;
