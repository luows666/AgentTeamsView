import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Agent } from '../../types';

interface HeatmapOverlayProps {
  agents: Agent[];
  agentPositions: Map<string, [number, number, number]>;
  enabled: boolean;
}

// Get color based on task count (0-5 scale)
const getHeatmapColor = (taskCount: number): THREE.Color => {
  // Normalize task count to 0-1 range (assuming max 5 tasks)
  const normalized = Math.min(taskCount / 5, 1);

  // Color gradient: blue (idle) -> green -> yellow -> orange -> red (busy)
  const colors = [
    new THREE.Color('#00f0ff'), // 0 tasks - cyan
    new THREE.Color('#00ff88'), // 1-2 tasks - green
    new THREE.Color('#ffff00'), // 2-3 tasks - yellow
    new THREE.Color('#ff8800'), // 3-4 tasks - orange
    new THREE.Color('#ff3366'), // 5+ tasks - red
  ];

  const index = Math.min(Math.floor(normalized * 4), 3);
  const t = (normalized * 4) - index;

  const color = colors[index].clone().lerp(colors[Math.min(index + 1, 4)], t);
  return color;
};

// Single agent heat marker
interface HeatMarkerProps {
  position: [number, number, number];
  taskCount: number;
}

const HeatMarker: React.FC<HeatMarkerProps> = ({ position, taskCount }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const color = useMemo(() => getHeatmapColor(taskCount), [taskCount]);

  // Pulse effect based on task count
  const pulseSpeed = 1 + taskCount * 0.5;

  useFrame((state) => {
    if (meshRef.current) {
      // Scale pulse based on task count
      const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.15;
      meshRef.current.scale.set(scale, scale, scale);

      // Rotation
      meshRef.current.rotation.z += 0.02;
    }
    if (glowRef.current) {
      // Glow pulse
      const glowScale = 1.3 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.2;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
  });

  // Size based on task count
  const baseSize = 0.8 + taskCount * 0.15;

  return (
    <group position={position}>
      {/* Main heat circle */}
      <mesh ref={meshRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[baseSize, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh ref={glowRef} position={[0, 0, -0.01]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[baseSize * 0.8, baseSize * 1.4, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh position={[0, 0, 0.01]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[baseSize * 0.3, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Ground plane heatmap (shows overall workload distribution)
interface GroundHeatmapProps {
  agents: Agent[];
  agentPositions: Map<string, [number, number, number]>;
}

const GroundHeatmap: React.FC<GroundHeatmapProps> = ({ agents, agentPositions }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate average position and spread
  const { center, avgTaskCount } = useMemo(() => {
    if (agents.length === 0) {
      return { center: new THREE.Vector3(0, -0.5, 0), avgTaskCount: 0 };
    }

    let totalX = 0, totalZ = 0, totalTasks = 0;
    agents.forEach(agent => {
      const pos = agentPositions.get(agent.id);
      if (pos) {
        totalX += pos[0];
        totalZ += pos[2];
        totalTasks += agent.taskCount;
      }
    });

    return {
      center: new THREE.Vector3(
        totalX / agents.length,
        -0.5,
        totalZ / agents.length
      ),
      avgTaskCount: totalTasks / agents.length
    };
  }, [agents, agentPositions]);

  const color = useMemo(() => getHeatmapColor(avgTaskCount), [avgTaskCount]);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulse
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.scale.set(pulse, pulse, 1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={[center.x, center.y, center.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({
  agents,
  agentPositions,
  enabled,
}) => {
  if (!enabled) return null;

  return (
    <group>
      {/* Ground plane heatmap */}
      <GroundHeatmap agents={agents} agentPositions={agentPositions} />

      {/* Individual agent heat markers */}
      {agents.map((agent) => {
        const position = agentPositions.get(agent.id);
        if (!position) return null;

        return (
          <HeatMarker
            key={agent.id}
            position={position}
            taskCount={agent.taskCount}
          />
        );
      })}
    </group>
  );
};

export default HeatmapOverlay;
