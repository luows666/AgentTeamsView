import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Task, Agent } from '../types';

// Task particle (glowing orb) component
export interface TaskParticleProps {
  task: Task;
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  onComplete?: () => void;
  isCompleting?: boolean;
}

export const TaskParticle: React.FC<TaskParticleProps> = ({
  task,
  startPosition,
  endPosition,
  onComplete,
  isCompleting = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const completedRef = useRef(false);

  // Calculate direction and distance
  const direction = useMemo(() => {
    return new THREE.Vector3(
      endPosition[0] - startPosition[0],
      endPosition[1] - startPosition[1],
      endPosition[2] - startPosition[2]
    ).normalize();
  }, [startPosition, endPosition]);

  const distance = useMemo(() => {
    return new THREE.Vector3(
      endPosition[0] - startPosition[0],
      endPosition[1] - startPosition[1],
      endPosition[2] - startPosition[2]
    ).length();
  }, [startPosition, endPosition]);

  // Color based on priority
  const priorityColors: Record<string, string> = {
    low: '#00ff88',
    medium: '#00f0ff',
    high: '#ffaa00',
    urgent: '#ff3366',
  };

  const color = priorityColors[task.priority] || '#00f0ff';

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Handle task completion animation
    if (isCompleting && !completedRef.current) {
      completedRef.current = true;
    }

    if (completedRef.current) {
      // Fade out and scale up for completion effect
      const newOpacity = Math.max(0, opacity - delta * 2);
      const newScale = scale + delta * 1.5;
      setOpacity(newOpacity);
      setScale(newScale);

      if (newOpacity <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    // Move particle along the path
    const speed = 1.5; // Units per second
    const newProgress = progress + (delta * speed) / distance;
    setProgress(Math.min(newProgress, 1));

    // Calculate current position
    const currentPos = new THREE.Vector3(
      startPosition[0] + direction.x * distance * newProgress,
      startPosition[1] + direction.y * distance * newProgress + Math.sin(newProgress * Math.PI * 4) * 0.2,
      startPosition[2] + direction.z * distance * newProgress
    );

    meshRef.current.position.copy(currentPos);

    // Glow follows main mesh
    if (glowRef.current) {
      glowRef.current.position.copy(currentPos);
    }

    // Animate glow pulse
    if (glowRef.current) {
      const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse * 0.5;
    }

    // Scale animation during flight
    const currentScale = 0.3 + Math.sin(newProgress * Math.PI) * 0.1;
    meshRef.current.scale.setScalar(currentScale);

    // Check if reached destination
    if (newProgress >= 1 && onComplete) {
      onComplete();
    }
  });

  // Don't render if completed
  if (completedRef.current && opacity <= 0) {
    return null;
  }

  return (
    <group>
      {/* Trail effect */}
      <Trail
        width={0.3}
        length={6}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef} position={startPosition}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
          />
        </mesh>
      </Trail>

      {/* Outer glow */}
      <mesh ref={glowRef} position={startPosition}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3 * opacity}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh
        ref={trailRef}
        position={[
          startPosition[0] + direction.x * distance * progress,
          startPosition[1] + direction.y * distance * progress + Math.sin(progress * Math.PI * 4) * 0.2,
          startPosition[2] + direction.z * distance * progress,
        ]}
      >
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9 * opacity}
        />
      </mesh>
    </group>
  );
};

// Completion effect - explosion/dispersion particles
export interface TaskCompletionEffectProps {
  position: [number, number, number];
  color?: string;
  onComplete?: () => void;
}

export const TaskCompletionEffect: React.FC<TaskCompletionEffectProps> = ({
  position,
  color = '#00ff88',
  onComplete,
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const [isComplete, setIsComplete] = useState(false);
  const startTime = useRef(Date.now());

  // Generate particle positions and velocities
  const { positions, velocities } = useMemo(() => {
    const count = 30;
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position[0];
      positions[i * 3 + 1] = position[1];
      positions[i * 3 + 2] = position[2];

      // Random velocity outward
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          Math.random() * 2,
          (Math.random() - 0.5) * 3
        )
      );
    }

    return { positions, velocities };
  }, [position]);

  useFrame((state, delta) => {
    if (!particlesRef.current || isComplete) return;

    const elapsed = (Date.now() - startTime.current) / 1000;

    // Update particle positions
    const posArray = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < velocities.length; i++) {
      posArray[i * 3] += velocities[i].x * delta;
      posArray[i * 3 + 1] += velocities[i].y * delta;
      posArray[i * 3 + 2] += velocities[i].z * delta;

      // Slow down
      velocities[i].multiplyScalar(0.95);
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Fade out
    const material = particlesRef.current.material as THREE.PointsMaterial;
    material.opacity = Math.max(0, 1 - elapsed * 1.5);

    // End effect after 1 second
    if (elapsed > 1) {
      setIsComplete(true);
      onComplete?.();
    }
  });

  if (isComplete) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={1}
        sizeAttenuation
      />
    </points>
  );
};

// Task path line (shows the path from commander to agent)
export interface TaskPathProps {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  color?: string;
  progress?: number;
}

export const TaskPath: React.FC<TaskPathProps> = ({
  startPosition,
  endPosition,
  color = '#00f0ff',
  progress = 1,
}) => {
  const lineRef = useRef<THREE.Line>(null);

  const points = useMemo(() => {
    // Create curved path with slight arc
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(startPosition[0], startPosition[1], startPosition[2]),
      new THREE.Vector3(
        (startPosition[0] + endPosition[0]) / 2,
        Math.max(startPosition[1], endPosition[1]) + 1,
        (startPosition[2] + endPosition[2]) / 2
      ),
      new THREE.Vector3(endPosition[0], endPosition[1], endPosition[2])
    );

    return curve.getPoints(50);
  }, [startPosition, endPosition]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  // Calculate visible portion based on progress
  useFrame(() => {
    if (!lineRef.current) return;

    const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
    const visibleCount = Math.floor(points.length * progress);

    // Set draw range
    lineRef.current.geometry.setDrawRange(0, visibleCount);
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.3 * progress}
        linewidth={1}
      />
    </line>
  );
};

// Manager component for all task visualizations
export interface TaskVisualizationManagerProps {
  activeTasks: Array<{
    task: Task;
    fromAgent: Agent;
    toAgent: Agent;
  }>;
  completingTasks: string[]; // Array of task IDs that are completing
  agentPositions: Map<string, [number, number, number]>;
  onTaskAnimationComplete: (taskId: string) => void;
  onCompletionEffectComplete: (taskId: string) => void;
}

export const TaskVisualizationManager: React.FC<TaskVisualizationManagerProps> = ({
  activeTasks,
  completingTasks,
  agentPositions,
  onTaskAnimationComplete,
  onCompletionEffectComplete,
}) => {
  // Get agent position from the map or calculate default
  const getAgentPosition = (agent: Agent): [number, number, number] => {
    const pos = agentPositions.get(agent.id);
    if (pos) return pos;

    // Default circular positions based on agent index
    const radius = 3;
    const agentIndex = activeTasks.findIndex(t => t.toAgent.id === agent.id);
    const angle = (agentIndex / Math.max(1, activeTasks.length)) * Math.PI * 2;

    return [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ];
  };

  // Priority colors
  const priorityColors: Record<string, string> = {
    low: '#00ff88',
    medium: '#00f0ff',
    high: '#ffaa00',
    urgent: '#ff3366',
  };

  return (
    <group>
      {activeTasks.map(({ task, fromAgent, toAgent }) => {
        const startPos = getAgentPosition(fromAgent);
        const endPos = getAgentPosition(toAgent);
        const isCompleting = completingTasks.includes(task.id);
        const color = priorityColors[task.priority] || '#00f0ff';

        return (
          <group key={task.id}>
            {/* Path line */}
            <TaskPath
              startPosition={startPos}
              endPosition={endPos}
              color={color}
            />

            {/* Task particle */}
            {!isCompleting && (
              <TaskParticle
                task={task}
                startPosition={startPos}
                endPosition={endPos}
                isCompleting={isCompleting}
                onComplete={() => onTaskAnimationComplete(task.id)}
              />
            )}

            {/* Completion effect */}
            {isCompleting && (
              <TaskCompletionEffect
                position={endPos}
                color={color}
                onComplete={() => onCompletionEffectComplete(task.id)}
              />
            )}
          </group>
        );
      })}
    </group>
  );
};

export default TaskParticle;
