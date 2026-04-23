'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';

type TippyMascotProps = {
  mood?: number;
  reducedMotion?: boolean;
};

// Brighter neon palette so the bot reads against the dark card.
const COLORS = {
  bodyBase: '#5b3fc7', // vivid Tippy purple
  bodyTop: '#7c5cff', // lighter lilac for the head
  accent: '#b9a8ff',
  eyeGlow: '#6ffbbe',
  grin: '#6ffbbe',
  screen: '#0d1b2a',
  antennaGlow: '#ff3df5',
  conflux: '#3ec28f', // brand green
  confluxDeep: '#1f7d5d',
  coinGold: '#f5c451',
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

  // Load the Conflux logo once; shared between chest and coin face.
  const confluxTexture = useTexture('/conflux-logo.png');

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

    root.current.position.y = Math.sin(t * 1.4) * 0.06 - 0.05;
    root.current.rotation.y = Math.sin(t * 0.35) * 0.18;

    if (head.current) {
      const targetY = THREE.MathUtils.clamp(pointer.x * 0.5, -0.45, 0.45);
      const targetX = THREE.MathUtils.clamp(-pointer.y * 0.3, -0.25, 0.35);
      head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, targetY, 6, delta);
      head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, targetX, 6, delta);
    }

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

    if (antennaTip.current) {
      const pulse = 1 + Math.sin(t * 3 + mood * 5) * 0.12;
      antennaTip.current.scale.setScalar(pulse);
      const mat = antennaTip.current.material as THREE.MeshStandardMaterial;
      if (mat) mat.emissiveIntensity = 1.6 + Math.sin(t * 2.3) * 0.4;
    }

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
          roughness={0.3}
          metalness={0.4}
          clearcoat={0.9}
          clearcoatRoughness={0.2}
          sheen={1}
          sheenColor={COLORS.accent}
          sheenRoughness={0.5}
          emissive={COLORS.bodyBase}
          emissiveIntensity={0.25}
        />
      </RoundedBox>

      {/* Chest badge — Conflux logo */}
      <mesh position={[0, 0.1, 0.54]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial
          map={confluxTexture}
          emissiveMap={confluxTexture}
          emissive="#ffffff"
          emissiveIntensity={0.9}
          transparent
          alphaTest={0.05}
          toneMapped={false}
        />
      </mesh>

      {/* Head */}
      <group ref={head} position={[0, 1.15, 0]}>
        <RoundedBox args={[1.25, 1.1, 1.1]} radius={0.3} smoothness={5}>
          <meshPhysicalMaterial
            color={COLORS.bodyTop}
            roughness={0.25}
            metalness={0.55}
            clearcoat={1}
            clearcoatRoughness={0.12}
            emissive={COLORS.bodyTop}
            emissiveIntensity={0.2}
          />
        </RoundedBox>

        {/* Face screen */}
        <mesh position={[0, 0, 0.56]}>
          <boxGeometry args={[0.95, 0.75, 0.02]} />
          <meshStandardMaterial
            color={COLORS.screen}
            roughness={0.15}
            metalness={0.6}
            emissive={'#0b2030'}
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Eyes */}
        <mesh ref={leftEye} position={[-0.22, 0.05, 0.58]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial
            color={COLORS.eyeGlow}
            emissive={COLORS.eyeGlow}
            emissiveIntensity={2.6}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={rightEye} position={[0.22, 0.05, 0.58]}>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshStandardMaterial
            color={COLORS.eyeGlow}
            emissive={COLORS.eyeGlow}
            emissiveIntensity={2.6}
            toneMapped={false}
          />
        </mesh>

        {/* Grin */}
        <mesh position={[0, -0.18, 0.58]}>
          <boxGeometry args={[0.3, 0.04, 0.01]} />
          <meshStandardMaterial
            color={COLORS.grin}
            emissive={COLORS.grin}
            emissiveIntensity={1.8}
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
        <mesh position={[-0.36, 0, 0]}>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial
            color={COLORS.accent}
            roughness={0.25}
            metalness={0.4}
            emissive={COLORS.accent}
            emissiveIntensity={0.35}
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
            emissiveIntensity={0.35}
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

      {/* Floating Conflux coin the bot offers */}
      <Float
        floatIntensity={reducedMotion ? 0 : 0.6}
        rotationIntensity={reducedMotion ? 0 : 0.3}
        speed={reducedMotion ? 0 : 1.6}
      >
        <group ref={coinGroup} position={[1.35, 0.9, 0.1]}>
          <ConfluxCoin texture={confluxTexture} size={0.55} />
        </group>
      </Float>
    </group>
  );
}

/**
 * A gold-rim coin whose face carries the Conflux logo texture on both sides.
 * Rendered as a group so callers can transform/rotate it freely.
 */
export function ConfluxCoin({
  texture,
  size = 1,
}: {
  texture: THREE.Texture;
  size?: number;
}) {
  const radius = size / 2;
  const thickness = size * 0.1;
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius, radius, thickness, 56]} />
        <meshPhysicalMaterial
          color="#f5c451"
          metalness={1}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.08}
          emissive="#a67914"
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* Inset rim (subtle step on each face) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <cylinderGeometry args={[radius * 0.82, radius * 0.82, thickness * 1.02, 56]} />
        <meshStandardMaterial color="#d9a93f" metalness={1} roughness={0.22} />
      </mesh>
      {/* Logo face — front */}
      <mesh position={[0, 0, thickness / 2 + 0.001]}>
        <planeGeometry args={[size * 0.78, size * 0.78]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.8}
          transparent
          alphaTest={0.05}
          toneMapped={false}
        />
      </mesh>
      {/* Logo face — back (mirrored) */}
      <mesh position={[0, 0, -(thickness / 2 + 0.001)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[size * 0.78, size * 0.78]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive="#ffffff"
          emissiveIntensity={0.8}
          transparent
          alphaTest={0.05}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
