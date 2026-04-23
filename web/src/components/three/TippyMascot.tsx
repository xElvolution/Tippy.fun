'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

type TippyMascotProps = {
  /** Value in [0, 1] used by the scroll-story scene; idle scene can leave undefined. */
  mood?: number;
  /** Disable micro-motion for users who prefer reduced motion. */
  reducedMotion?: boolean;
};

// Brand-aligned neon palette. Deep purple body, cyan face/accent, magenta rim glow.
const COLORS = {
  bodyBase: '#1a1230',
  bodyTop: '#2d1f4d',
  accent: '#6b38d4',
  eyeGlow: '#6ffbbe',
  screen: '#0d1b2a',
  antennaGlow: '#ff3df5',
  coin: '#f5c451',
  coinDark: '#a67914',
} as const;

export function TippyMascot({ mood = 0, reducedMotion = false }: TippyMascotProps) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const antennaTip = useRef<THREE.Mesh>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const coinGroup = useRef<THREE.Group>(null);

  const blinkClock = useRef({ next: 2 + Math.random() * 3, closing: 0 });
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!root.current) return;

    const t = state.clock.elapsedTime;

    if (reducedMotion) {
      root.current.position.y = 0;
      root.current.rotation.y = 0;
      if (head.current) head.current.rotation.set(0, 0, 0);
      if (leftEye.current) leftEye.current.scale.y = 1;
      if (rightEye.current) rightEye.current.scale.y = 1;
      return;
    }

    // Idle bob + slow rotation.
    root.current.position.y = Math.sin(t * 1.4) * 0.06 - 0.05;
    root.current.rotation.y = Math.sin(t * 0.35) * 0.18;

    // Head tilts toward the pointer; clamp so it never feels possessed.
    if (head.current) {
      const targetY = THREE.MathUtils.clamp(pointer.x * 0.5, -0.45, 0.45);
      const targetX = THREE.MathUtils.clamp(-pointer.y * 0.3, -0.25, 0.35);
      head.current.rotation.y = THREE.MathUtils.damp(
        head.current.rotation.y,
        targetY,
        6,
        delta,
      );
      head.current.rotation.x = THREE.MathUtils.damp(
        head.current.rotation.x,
        targetX,
        6,
        delta,
      );
    }

    // Random blink.
    blinkClock.current.next -= delta;
    if (blinkClock.current.next <= 0 && blinkClock.current.closing <= 0) {
      blinkClock.current.closing = 0.16;
      blinkClock.current.next = 2.5 + Math.random() * 3.5;
    }
    const closing = blinkClock.current.closing;
    const eyeScaleY = closing > 0 ? Math.max(0.08, 1 - closing / 0.08) : 1;
    if (closing > 0) blinkClock.current.closing = Math.max(0, closing - delta);
    if (leftEye.current) leftEye.current.scale.y = eyeScaleY;
    if (rightEye.current) rightEye.current.scale.y = eyeScaleY;

    // Antenna wobble + pulse, stronger when "excited" (mood > 0.5).
    if (antennaTip.current) {
      const pulse = 1 + Math.sin(t * 3 + mood * 5) * 0.12;
      antennaTip.current.scale.setScalar(pulse);
      const mat = antennaTip.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 1.4 + Math.sin(t * 2.3) * 0.4;
    }

    // Arms cheer slightly when mood rises.
    if (leftArm.current && rightArm.current) {
      const target = THREE.MathUtils.lerp(0.1, -0.9, mood);
      leftArm.current.rotation.z = THREE.MathUtils.damp(
        leftArm.current.rotation.z,
        target,
        4,
        delta,
      );
      rightArm.current.rotation.z = THREE.MathUtils.damp(
        rightArm.current.rotation.z,
        -target,
        4,
        delta,
      );
    }

    // Floating coin spins and hovers.
    if (coinGroup.current) {
      coinGroup.current.rotation.y += delta * 1.6;
      coinGroup.current.position.y = 0.9 + Math.sin(t * 2.2) * 0.05;
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]}>
      {/* Body */}
      <RoundedBox args={[1.4, 1.5, 1.05]} radius={0.28} smoothness={5} position={[0, 0.1, 0]}>
        <meshPhysicalMaterial
          color={COLORS.bodyBase}
          roughness={0.35}
          metalness={0.35}
          clearcoat={0.8}
          clearcoatRoughness={0.25}
          sheen={1}
          sheenColor={COLORS.accent}
          sheenRoughness={0.6}
        />
      </RoundedBox>

      {/* Chest emblem — glowing Tippy mark (abstract T) */}
      <group position={[0, 0.1, 0.55]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.42, 0.08, 0.02]} />
          <meshStandardMaterial
            color={COLORS.eyeGlow}
            emissive={COLORS.eyeGlow}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.08, 0.26, 0.02]} />
          <meshStandardMaterial
            color={COLORS.eyeGlow}
            emissive={COLORS.eyeGlow}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Head */}
      <group ref={head} position={[0, 1.15, 0]}>
        <RoundedBox args={[1.25, 1.1, 1.1]} radius={0.3} smoothness={5}>
          <meshPhysicalMaterial
            color={COLORS.bodyTop}
            roughness={0.3}
            metalness={0.5}
            clearcoat={1}
            clearcoatRoughness={0.15}
          />
        </RoundedBox>

        {/* Face screen — a dark inset plane with glowing eyes */}
        <mesh position={[0, 0, 0.56]}>
          <boxGeometry args={[0.95, 0.75, 0.02]} />
          <meshStandardMaterial
            color={COLORS.screen}
            roughness={0.15}
            metalness={0.6}
            emissive={'#051017'}
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Eyes */}
        <mesh ref={leftEye} position={[-0.22, 0.05, 0.58]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial
            color={COLORS.eyeGlow}
            emissive={COLORS.eyeGlow}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={rightEye} position={[0.22, 0.05, 0.58]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial
            color={COLORS.eyeGlow}
            emissive={COLORS.eyeGlow}
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>

        {/* Little grin */}
        <mesh position={[0, -0.18, 0.58]}>
          <boxGeometry args={[0.3, 0.04, 0.01]} />
          <meshStandardMaterial
            color={COLORS.eyeGlow}
            emissive={COLORS.eyeGlow}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>

        {/* Antenna */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.35, 12]} />
          <meshStandardMaterial color={COLORS.accent} roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh ref={antennaTip} position={[0, 0.95, 0]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          <meshStandardMaterial
            color={COLORS.antennaGlow}
            emissive={COLORS.antennaGlow}
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Arms */}
      <group ref={leftArm} position={[-0.78, 0.35, 0]}>
        <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.35, 16]} />
          <meshPhysicalMaterial
            color={COLORS.bodyTop}
            roughness={0.3}
            metalness={0.5}
            clearcoat={0.7}
          />
        </mesh>
        {/* Hand */}
        <mesh position={[-0.36, 0, 0]}>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial
            color={COLORS.accent}
            roughness={0.25}
            metalness={0.4}
            emissive={COLORS.accent}
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>

      <group ref={rightArm} position={[0.78, 0.35, 0]}>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.35, 16]} />
          <meshPhysicalMaterial
            color={COLORS.bodyTop}
            roughness={0.3}
            metalness={0.5}
            clearcoat={0.7}
          />
        </mesh>
        <mesh position={[0.36, 0, 0]}>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial
            color={COLORS.accent}
            roughness={0.25}
            metalness={0.4}
            emissive={COLORS.accent}
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>

      {/* Feet */}
      <mesh position={[-0.38, -0.82, 0.1]}>
        <boxGeometry args={[0.42, 0.2, 0.55]} />
        <meshStandardMaterial color={COLORS.bodyTop} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0.38, -0.82, 0.1]}>
        <boxGeometry args={[0.42, 0.2, 0.55]} />
        <meshStandardMaterial color={COLORS.bodyTop} roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Floating tip coin the bot "offers" */}
      <Float
        floatIntensity={reducedMotion ? 0 : 0.6}
        rotationIntensity={reducedMotion ? 0 : 0.3}
        speed={reducedMotion ? 0 : 1.6}
      >
        <group ref={coinGroup} position={[1.35, 0.9, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.06, 48]} />
            <meshPhysicalMaterial
              color={COLORS.coin}
              metalness={1}
              roughness={0.15}
              clearcoat={1}
              clearcoatRoughness={0.1}
              emissive={COLORS.coinDark}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* Coin face — "T" emblem on both sides */}
          <mesh position={[0, 0.033, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.01, 48]} />
            <meshStandardMaterial color={COLORS.coinDark} roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.16, 0.04, 0.005]} />
            <meshStandardMaterial
              color={COLORS.eyeGlow}
              emissive={COLORS.eyeGlow}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.04, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.14]} />
            <meshStandardMaterial
              color={COLORS.eyeGlow}
              emissive={COLORS.eyeGlow}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}
