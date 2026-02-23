import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { AgentNode, AgentNodeProps } from './agent/AgentNode';
import {
  TaskVisualizationManager,
  TaskParticle,
  TaskCompletionEffect,
} from './task/TaskVisualization';
import { HeatmapOverlay } from './formation/HeatmapOverlay';
import { Agent as AgentType, Task, FormationType, DEFAULT_FORMATIONS } from '../types';
import { useAgentStore } from '../stores/agentStore';

export type Agent = AgentType;

export interface SceneProps {
  agents: Agent[];
  onAgentClick?: (agentId: string) => void;
}

// Grid floor component
const HolographicGrid: React.FC = () => {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
    }
  });

  return (
    <group ref={gridRef} position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[30, 30, '#00f0ff', '#004466']} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

// Particle field
const ParticleField: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Cyan to blue gradient
      const color = new THREE.Color();
      color.setHSL(0.5 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const Scene: React.FC<SceneProps> = ({ agents, onAgentClick }) => {
  const { camera } = useThree();

  // Force update when formationType changes
  const [formationKey, setFormationKey] = useState(0);
  const formationType = useAgentStore((state) => state.formationType);
  const prevFormationType = useRef(formationType);

  useEffect(() => {
    if (prevFormationType.current !== formationType) {
      prevFormationType.current = formationType;
      setFormationKey(k => k + 1);
    }
  }, [formationType]);

  // Get task animation state from store
  const activeTaskAnimations = useAgentStore((state) => state.activeTaskAnimations);
  const completingTaskIds = useAgentStore((state) => state.completingTaskIds);
  const tasks = useAgentStore((state) => state.tasks);
  const commanderId = useAgentStore((state) => state.commanderId);
  const completeTaskAnimation = useAgentStore((state) => state.completeTaskAnimation);
  const clearCompletingTask = useAgentStore((state) => state.clearCompletingTask);
  const isHeatmapEnabled = useAgentStore((state) => state.isHeatmapEnabled);

  // Set initial camera position
  useMemo(() => {
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Calculate positions based on formation type
  const agentPositions = useMemo(() => {
    const positions = new Map<string, [number, number, number]>();

    // Get commander first, then other agents
    const commander = agents.find(a => a.isCommander);
    const otherAgents = agents.filter(a => !a.isCommander);
    const sortedAgents = commander ? [commander, ...otherAgents] : agents;

    // Get default positions for this formation type
    const defaultPositions = DEFAULT_FORMATIONS[formationType] || DEFAULT_FORMATIONS.circle;

    sortedAgents.forEach((agent, index) => {
      if (index < defaultPositions.length) {
        // Use predefined position from formation
        positions.set(agent.id, [
          defaultPositions[index].x,
          defaultPositions[index].y,
          defaultPositions[index].z,
        ]);
      } else {
        // Fallback: calculate position dynamically if we have more agents than predefined positions
        const angle = ((index - defaultPositions.length) / (sortedAgents.length - defaultPositions.length)) * Math.PI * 2;
        const radius = 4;
        positions.set(agent.id, [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius,
        ]);
      }
    });

    return positions;
  }, [agents, formationType, formationKey]);

  // Get agent by ID helper
  const getAgentById = useCallback((id: string | undefined) => {
    if (!id) return null;
    return agents.find((a) => a.id === id) || null;
  }, [agents]);

  // Get task by ID helper
  const getTaskById = useCallback((id: string) => {
    return tasks.find((t) => t.id === id) || null;
  }, [tasks]);

  // Build active task visualizations data
  const activeTaskVisualizations = useMemo(() => {
    return activeTaskAnimations.map((anim) => {
      const task = getTaskById(anim.taskId);
      const fromAgent = getAgentById(anim.fromAgentId);
      const toAgent = getAgentById(anim.toAgentId);

      if (!task || !fromAgent || !toAgent) return null;

      return {
        task,
        fromAgent,
        toAgent,
      };
    }).filter(Boolean) as Array<{
      task: Task;
      fromAgent: AgentType;
      toAgent: AgentType;
    }>;
  }, [activeTaskAnimations, getTaskById, getAgentById]);

  // Handle task animation completion
  const handleTaskAnimationComplete = useCallback((taskId: string) => {
    // When particle reaches destination, trigger completion animation
    completeTaskAnimation(taskId);
  }, [completeTaskAnimation]);

  // Handle completion effect finish
  const handleCompletionEffectComplete = useCallback((taskId: string) => {
    // Clear completing state after effect finishes
    clearCompletingTask(taskId);
  }, [clearCompletingTask]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#00f0ff"
      />

      {/* Background stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Particle field */}
      <ParticleField />

      {/* Holographic grid floor */}
      <HolographicGrid />

      {/* Heatmap overlay */}
      <HeatmapOverlay
        agents={agents}
        agentPositions={agentPositions}
        enabled={isHeatmapEnabled}
      />

      {/* Agent nodes */}
      <Float
        speed={1}
        rotationIntensity={0.1}
        floatIntensity={0.2}
      >
        {agents.map((agent) => {
          const position = agentPositions.get(agent.id) || [0, 0, 0];
          return (
            <AgentNode
              key={agent.id}
              name={agent.name}
              role={agent.role}
              status={agent.status}
              position={position}
              onClick={() => onAgentClick?.(agent.id)}
            />
          );
        })}
      </Float>

      {/* Task visualization manager */}
      <TaskVisualizationManager
        activeTasks={activeTaskVisualizations}
        completingTasks={completingTaskIds}
        agentPositions={agentPositions}
        onTaskAnimationComplete={handleTaskAnimationComplete}
        onCompletionEffectComplete={handleCompletionEffectComplete}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#000810', 5, 25]} />
    </>
  );
};

export default Scene;
