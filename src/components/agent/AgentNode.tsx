import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export type AgentStatus = 'idle' | 'working' | 'error';

export interface AgentNodeProps {
  name: string;
  role: string;
  status: AgentStatus;
  position?: [number, number, number];
  onClick?: () => void;
}

const statusColors: Record<AgentStatus, string> = {
  idle: '#00f0ff',
  working: '#00ff88',
  error: '#ff3366',
};

export const AgentNode: React.FC<AgentNodeProps> = ({
  name,
  role,
  status,
  position = [0, 0, 0],
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const color = statusColors[status];

  // Create holographic material
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.8,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
    });
  }, [color]);

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      // Rotation
      meshRef.current.rotation.y += 0.005;
    }
    if (glowRef.current) {
      // Pulse the glow
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Main card */}
      <RoundedBox
        ref={meshRef}
        args={[1.5, 2, 0.1]}
        radius={0.1}
        smoothness={4}
        material={material}
        onClick={onClick}
      >
      </RoundedBox>

      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, -0.05]}>
        <planeGeometry args={[1.6, 2.1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Border glow */}
      <mesh position={[0, 0, -0.06]}>
        <ringGeometry args={[0.95, 1.0, 4]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML content overlay */}
      <Html
        position={[0, 0, 0.06]}
        center
        distanceFactor={5}
        style={{
          pointerEvents: 'none',
        }}
      >
        <div style={{
          width: '140px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
          color: color,
          textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
        }}>
          {/* Status indicator */}
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
            animation: status === 'working' ? 'pulse 1s infinite' : 'none',
          }} />

          {/* Name */}
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}>
            {name}
          </div>

          {/* Role */}
          <div style={{
            fontSize: '10px',
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {role}
          </div>

          {/* Status text */}
          <div style={{
            fontSize: '9px',
            marginTop: '4px',
            opacity: 0.6,
            textTransform: 'uppercase',
          }}>
            {status}
          </div>
        </div>
      </Html>
    </group>
  );
};

export default AgentNode;
