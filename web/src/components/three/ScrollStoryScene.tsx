'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Float,
  AdaptiveDpr,
  AdaptiveEvents,
  useTexture,
} from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { ConfluxCoin } from './TippyMascot';

type ScrollStorySceneProps = {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
};

/**
 * Four stages live inside one Canvas; cross-fade & slide based on scroll progress.
 *   0.00 – 0.25  → Conflux coin          (Fund)
 *   0.25 – 0.50  → Chat bubble           (Engage)
 *   0.50 – 0.75  → AI arbiter orbiter    (Judge)
 *   0.75 – 1.00  → Trophy                (Pay out)
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

      <ambientLight intensity={0.75} color="#c7bbff" />
      <directionalLight position={[3, 5, 2]} intensity={2.2} color="#8fe4ff" />
      <pointLight position={[-3, 1, 2]} intensity={2.5} color="#ff3df5" distance={12} />
      <pointLight position={[3, 0, 2]} intensity={1.6} color="#3ec28f" distance={12} />

      <Suspense fallback={null}>
        <StoryStage progress={progress} reducedMotion={reducedMotion} />
        <ContactShadows position={[0, -1.1, 0]} opacity={0.5} scale={6} blur={2} far={3} />
      </Suspense>
    </Canvas>
  );
}

const ANCHORS = [0.125, 0.375, 0.625, 0.875] as const;

function StoryStage({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  // Load texture once; shared by coin + chat stamp.
  const confluxTexture = useTexture('/conflux-logo.png');

  const coinRef = useRef<THREE.Group>(null);
  const chatRef = useRef<THREE.Group>(null);
  const judgeRef = useRef<THREE.Group>(null);
  const trophyRef = useRef<THREE.Group>(null);

  const judgeOrbs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)] as const;

  useFrame((state, delta) => {
    const p = progress.get();

    const bump = (pos: number, width: number) => {
      const d = Math.abs(p - pos);
      return THREE.MathUtils.clamp(1 - d / width, 0, 1);
    };

    const alphas = ANCHORS.map((a) => bump(a, 0.17));

    applyAlpha(coinRef.current, alphas[0]);
    applyAlpha(chatRef.current, alphas[1]);
    applyAlpha(judgeRef.current, alphas[2]);
    applyAlpha(trophyRef.current, alphas[3]);

    const laneX = (anchor: number) => (p - anchor) * -4;
    if (coinRef.current) coinRef.current.position.x = laneX(ANCHORS[0]);
    if (chatRef.current) chatRef.current.position.x = laneX(ANCHORS[1]);
    if (judgeRef.current) judgeRef.current.position.x = laneX(ANCHORS[2]);
    if (trophyRef.current) trophyRef.current.position.x = laneX(ANCHORS[3]);

    if (reducedMotion) return;

    const t = state.clock.elapsedTime;
    if (coinRef.current) coinRef.current.rotation.y += delta * 1.5;
    if (chatRef.current) chatRef.current.rotation.y = Math.sin(t * 0.8) * 0.15;
    if (trophyRef.current) trophyRef.current.rotation.y = Math.sin(t * 0.6) * 0.2;

    // Judge orbs orbit the central arbiter.
    judgeOrbs.forEach((ref, i) => {
      if (!ref.current) return;
      const speed = 0.6 + i * 0.15;
      const radius = 1.1;
      const offset = (i / judgeOrbs.length) * Math.PI * 2;
      ref.current.position.x = Math.cos(t * speed + offset) * radius;
      ref.current.position.y = Math.sin(t * speed * 0.8 + offset) * 0.35;
      ref.current.position.z = Math.sin(t * speed + offset) * radius * 0.5;
    });
  });

  return (
    <>
      <group ref={coinRef}>
        <Float floatIntensity={0.8} rotationIntensity={0.2} speed={1.4}>
          <group rotation={[Math.PI / 2.4, 0, 0]} scale={1.6}>
            <ConfluxCoin texture={confluxTexture} size={1} />
          </group>
        </Float>
      </group>

      <group ref={chatRef}>
        <ChatBubble texture={confluxTexture} />
      </group>

      <group ref={judgeRef}>
        <AIJudgeOrbiter judgeOrbs={judgeOrbs} />
      </group>

      <group ref={trophyRef}>
        <Trophy />
      </group>
    </>
  );
}

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

function ChatBubble({ texture }: { texture: THREE.Texture }) {
  return (
    <Float floatIntensity={0.5} rotationIntensity={0.15} speed={1.2}>
      <group>
        {/* Bubble body */}
        <mesh>
          <boxGeometry args={[2, 1.35, 0.28]} />
          <meshPhysicalMaterial
            color="#2d1f4d"
            roughness={0.3}
            metalness={0.35}
            clearcoat={0.8}
            emissive="#6b38d4"
            emissiveIntensity={0.4}
          />
        </mesh>
        {/* Tail */}
        <mesh position={[-0.65, -0.85, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.38, 0.38, 0.22]} />
          <meshPhysicalMaterial
            color="#2d1f4d"
            roughness={0.3}
            metalness={0.35}
            emissive="#6b38d4"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Conflux stamp inside the bubble */}
        <mesh position={[-0.55, 0, 0.145]}>
          <planeGeometry args={[0.65, 0.65]} />
          <meshStandardMaterial
            map={texture}
            emissiveMap={texture}
            emissive="#ffffff"
            emissiveIntensity={0.9}
            transparent
            alphaTest={0.05}
            toneMapped={false}
          />
        </mesh>
        {/* "+5 CFX" tip chip on the right */}
        <mesh position={[0.45, 0, 0.145]}>
          <boxGeometry args={[0.7, 0.36, 0.02]} />
          <meshStandardMaterial
            color="#6ffbbe"
            emissive="#6ffbbe"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0.45, 0, 0.16]}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshStandardMaterial color="#0b2030" />
        </mesh>
      </group>
    </Float>
  );
}

function AIJudgeOrbiter({
  judgeOrbs,
}: {
  judgeOrbs: readonly [
    React.RefObject<THREE.Group | null>,
    React.RefObject<THREE.Group | null>,
    React.RefObject<THREE.Group | null>,
  ];
}) {
  const judgeColors = ['#8fe4ff', '#ff3df5', '#6ffbbe'] as const;

  return (
    <group>
      {/* Central arbiter — a pulsing crystalline orb with a translucent halo */}
      <Float floatIntensity={0.3} rotationIntensity={0.25} speed={1}>
        <group>
          <mesh>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshPhysicalMaterial
              color="#7c5cff"
              metalness={0.6}
              roughness={0.2}
              clearcoat={1}
              emissive="#7c5cff"
              emissiveIntensity={0.9}
              transmission={0.25}
              thickness={0.4}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.78, 24, 24]} />
            <meshBasicMaterial color="#7c5cff" transparent opacity={0.1} />
          </mesh>
        </group>
      </Float>

      {/* Three judge personas orbiting the arbiter */}
      {judgeColors.map((c, i) => (
        <group key={c} ref={judgeOrbs[i]}>
          <mesh>
            <sphereGeometry args={[0.18, 24, 24]} />
            <meshStandardMaterial
              color={c}
              emissive={c}
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          {/* Soft halo */}
          <mesh>
            <sphereGeometry args={[0.28, 24, 24]} />
            <meshBasicMaterial color={c} transparent opacity={0.18} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Trophy() {
  return (
    <Float floatIntensity={0.4} rotationIntensity={0.15} speed={1}>
      <group>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.55, 0.35, 0.9, 32, 1, false]} />
          <meshPhysicalMaterial color="#f5c451" metalness={1} roughness={0.15} clearcoat={1} />
        </mesh>
        <mesh position={[-0.62, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.22, 0.05, 12, 32, Math.PI]} />
          <meshStandardMaterial color="#f5c451" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0.62, 0.45, 0]} rotation={[0, Math.PI, Math.PI / 2]}>
          <torusGeometry args={[0.22, 0.05, 12, 32, Math.PI]} />
          <meshStandardMaterial color="#f5c451" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.12, 0.18, 0.3, 24]} />
          <meshStandardMaterial color="#a67914" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <boxGeometry args={[0.9, 0.18, 0.6]} />
          <meshPhysicalMaterial color="#2d1f4d" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.45, 0.56]}>
          <boxGeometry args={[0.3, 0.08, 0.01]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Float>
  );
}
