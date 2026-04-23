'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  AdaptiveDpr,
  AdaptiveEvents,
} from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';

type ScrollStorySceneProps = {
  /** framer-motion scroll progress mapped to [0, 1] across the whole story section. */
  progress: MotionValue<number>;
  reducedMotion?: boolean;
};

/**
 * Three stages live inside one Canvas; we cross-fade & swap them based on
 * scroll progress so the WebGL context is created only once.
 *   0.00 – 0.33   → floating tip coin  ("Fund")
 *   0.33 – 0.66   → chat bubble         ("Engage")
 *   0.66 – 1.00   → trophy              ("Pay out")
 */
export function ScrollStoryScene({ progress, reducedMotion = false }: ScrollStorySceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 4.5], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      <ambientLight intensity={0.4} color="#b4a8ff" />
      <directionalLight position={[3, 5, 2]} intensity={1.5} color="#8fe4ff" />
      <pointLight position={[-3, 1, 2]} intensity={2} color="#ff3df5" distance={10} />
      <Environment preset="night" />

      <Suspense fallback={null}>
        <StoryStage progress={progress} reducedMotion={reducedMotion} />
        <ContactShadows position={[0, -1.1, 0]} opacity={0.5} scale={6} blur={2} far={3} />
      </Suspense>
    </Canvas>
  );
}

function StoryStage({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const coinRef = useRef<THREE.Group>(null);
  const chatRef = useRef<THREE.Group>(null);
  const trophyRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const p = progress.get();

    // Visibility curves: a smooth bump that fades each group in and out around its anchor.
    const bump = (pos: number, width: number) => {
      const d = Math.abs(p - pos);
      return THREE.MathUtils.clamp(1 - d / width, 0, 1);
    };

    const aCoin = bump(0.17, 0.22);
    const aChat = bump(0.5, 0.22);
    const aTrophy = bump(0.83, 0.22);

    applyAlpha(coinRef.current, aCoin);
    applyAlpha(chatRef.current, aChat);
    applyAlpha(trophyRef.current, aTrophy);

    // Each stage enters from the right and leaves to the left.
    const laneX = (anchor: number) => (p - anchor) * -4;

    if (coinRef.current) coinRef.current.position.x = laneX(0.17);
    if (chatRef.current) chatRef.current.position.x = laneX(0.5);
    if (trophyRef.current) trophyRef.current.position.x = laneX(0.83);

    if (reducedMotion) return;

    const t = state.clock.elapsedTime;
    if (coinRef.current) coinRef.current.rotation.y += delta * 1.5;
    if (chatRef.current) chatRef.current.rotation.y = Math.sin(t * 0.8) * 0.15;
    if (trophyRef.current) trophyRef.current.rotation.y = Math.sin(t * 0.6) * 0.2;
  });

  return (
    <>
      <group ref={coinRef} position={[0, 0, 0]}>
        <TipCoin />
      </group>
      <group ref={chatRef} position={[0, 0, 0]}>
        <ChatBubble />
      </group>
      <group ref={trophyRef} position={[0, 0, 0]}>
        <Trophy />
      </group>
    </>
  );
}

/** Traverse a group and set opacity + transparency on every material. */
function applyAlpha(group: THREE.Group | null, alpha: number) {
  if (!group) return;
  group.visible = alpha > 0.01;
  group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.Material & { opacity: number; transparent: boolean };
      if (mat) {
        mat.transparent = true;
        mat.opacity = alpha;
      }
    }
  });
}

function TipCoin() {
  const coinColor = '#f5c451';
  const coinDark = '#a67914';
  return (
    <Float floatIntensity={0.8} rotationIntensity={0.2} speed={1.4}>
      <group rotation={[Math.PI / 2.4, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.9, 0.9, 0.22, 64]} />
          <meshPhysicalMaterial
            color={coinColor}
            metalness={1}
            roughness={0.12}
            clearcoat={1}
            emissive={coinDark}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0, 0.115, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.02, 64]} />
          <meshStandardMaterial color={coinDark} roughness={0.3} metalness={0.8} />
        </mesh>
        {/* T emblem */}
        <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.55, 0.14, 0.02]} />
          <meshStandardMaterial color="#6ffbbe" emissive="#6ffbbe" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.14, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.14, 0.14, 0.44]} />
          <meshStandardMaterial color="#6ffbbe" emissive="#6ffbbe" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

function ChatBubble() {
  return (
    <Float floatIntensity={0.5} rotationIntensity={0.15} speed={1.2}>
      <group>
        <mesh>
          <boxGeometry args={[1.8, 1.2, 0.25]} />
          <meshPhysicalMaterial
            color="#2d1f4d"
            roughness={0.35}
            metalness={0.3}
            clearcoat={0.6}
            emissive="#6b38d4"
            emissiveIntensity={0.25}
          />
        </mesh>
        {/* Tail */}
        <mesh position={[-0.55, -0.75, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.35, 0.35, 0.2]} />
          <meshPhysicalMaterial color="#2d1f4d" roughness={0.35} metalness={0.3} />
        </mesh>
        {/* Three glowing "typing" dots */}
        <mesh position={[-0.42, 0, 0.14]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color="#6ffbbe" emissive="#6ffbbe" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.14]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color="#6ffbbe" emissive="#6ffbbe" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        <mesh position={[0.42, 0, 0.14]}>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color="#6ffbbe" emissive="#6ffbbe" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

function Trophy() {
  return (
    <Float floatIntensity={0.4} rotationIntensity={0.15} speed={1}>
      <group>
        {/* Cup */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.55, 0.35, 0.9, 32, 1, false]} />
          <meshPhysicalMaterial color="#f5c451" metalness={1} roughness={0.15} clearcoat={1} />
        </mesh>
        {/* Handles */}
        <mesh position={[-0.62, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.22, 0.05, 12, 32, Math.PI]} />
          <meshStandardMaterial color="#f5c451" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0.62, 0.45, 0]} rotation={[0, Math.PI, Math.PI / 2]}>
          <torusGeometry args={[0.22, 0.05, 12, 32, Math.PI]} />
          <meshStandardMaterial color="#f5c451" metalness={1} roughness={0.2} />
        </mesh>
        {/* Stem */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 0.3, 24]} />
          <meshStandardMaterial color="#a67914" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Base */}
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.9, 0.18, 0.6]} />
          <meshPhysicalMaterial color="#2d1f4d" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Shine on front */}
        <mesh position={[0, 0.45, 0.56]}>
          <boxGeometry args={[0.3, 0.08, 0.01]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}
