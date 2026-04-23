'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Float,
  AdaptiveDpr,
  AdaptiveEvents,
  RoundedBox,
} from '@react-three/drei';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { exclusiveStageWeights } from '@/components/scrollStoryStages';

type ScrollStorySceneProps = {
  progress: MotionValue<number>;
  reducedMotion?: boolean;
};

/**
 * Four stages share one Canvas. Stage weights come from
 * `exclusiveStageWeights` so at most two adjacent stages blend — never two
 * full-opacity layers stacked.
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
      {/* Very soft warm fill — trophy gold is mostly material-driven now */}
      <pointLight position={[2.0, 0.25, 3.0]} intensity={0.42} color="#e8d4b0" distance={11} decay={2} />

      <Suspense fallback={null}>
        <StoryStage progress={progress} reducedMotion={reducedMotion} />
        <ContactShadows position={[0, -1.1, 0]} opacity={0.5} scale={6} blur={2} far={3} />
      </Suspense>
    </Canvas>
  );
}

const BANDS: ReadonlyArray<[number, number]> = [
  [0.0, 0.25],
  [0.25, 0.5],
  [0.5, 0.75],
  [0.75, 1.0],
];

function StoryStage({
  progress,
  reducedMotion,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const confluxTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const t = loader.load('/conflux-logo.png');
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  const coinRef = useRef<THREE.Group>(null);
  const coinTiltRef = useRef<THREE.Group>(null);
  const engageRef = useRef<THREE.Group>(null);
  const judgeRef = useRef<THREE.Group>(null);
  const trophyRef = useRef<THREE.Group>(null);

  const orb0 = useRef<THREE.Group>(null);
  const orb1 = useRef<THREE.Group>(null);
  const orb2 = useRef<THREE.Group>(null);
  const orbs = [orb0, orb1, orb2];

  useFrame((state, delta) => {
    const p = progress.get();
    const w = exclusiveStageWeights(p);

    applyAlpha(coinRef.current, w[0]);
    applyAlpha(engageRef.current, w[1]);
    applyAlpha(judgeRef.current, w[2]);
    applyAlpha(trophyRef.current, w[3]);

    const slide = (bandIndex: number, magnitude = 1.2) => {
      const [lo, hi] = BANDS[bandIndex];
      const within = THREE.MathUtils.clamp((p - lo) / (hi - lo), 0, 1);
      return (within - 0.5) * -2 * magnitude;
    };
    if (coinRef.current) coinRef.current.position.x = slide(0);
    if (engageRef.current) engageRef.current.position.x = slide(1);
    if (judgeRef.current) judgeRef.current.position.x = slide(2);
    if (trophyRef.current) trophyRef.current.position.x = slide(3);

    // Fund coin: start tilted (edge toward camera), rotate to face-up at mid-band.
    if (coinTiltRef.current && w[0] > 0.02) {
      const [lo, hi] = BANDS[0];
      const u = THREE.MathUtils.clamp((p - lo) / (hi - lo), 0, 1);
      const face = Math.sin(Math.PI * u);
      const rxDown = Math.PI / 2.12;
      const rxUp = 0.07;
      coinTiltRef.current.rotation.x = THREE.MathUtils.lerp(rxDown, rxUp, face);
      coinTiltRef.current.rotation.z = THREE.MathUtils.lerp(0.12, 0, face);
    }

    // Trophy — spins smoothly tied to scroll progress within its own band.
    if (trophyRef.current) {
      const [lo, hi] = BANDS[3];
      const u = THREE.MathUtils.clamp((p - lo) / (hi - lo), 0, 1);
      trophyRef.current.rotation.y = u * Math.PI * 2;
    }

    if (reducedMotion) return;

    const t = state.clock.elapsedTime;
    if (coinRef.current) coinRef.current.rotation.y += delta * 1.5;
    if (engageRef.current) engageRef.current.rotation.y = Math.sin(t * 0.8) * 0.12;

    orbs.forEach((ref, i) => {
      if (!ref.current) return;
      const speed = 0.6 + i * 0.15;
      const radius = 1.1;
      const offset = (i / orbs.length) * Math.PI * 2;
      ref.current.position.x = Math.cos(t * speed + offset) * radius;
      ref.current.position.y = Math.sin(t * speed * 0.8 + offset) * 0.35;
      ref.current.position.z = Math.sin(t * speed + offset) * radius * 0.5;
    });
  });

  return (
    <>
      <group ref={coinRef}>
        <ConfluxCoin texture={confluxTexture} tiltInnerRef={coinTiltRef} />
      </group>

      <group ref={engageRef}>
        <EngagePlatforms progress={progress} />
      </group>

      <group ref={judgeRef}>
        <AIJudgeOrbiter orbRefs={[orb0, orb1, orb2]} />
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

function ConfluxCoin({
  texture,
  tiltInnerRef,
}: {
  texture: THREE.Texture;
  tiltInnerRef: React.RefObject<THREE.Group | null>;
}) {
  const size = 1.4;
  const radius = size / 2;
  const thickness = size * 0.1;
  return (
    <Float floatIntensity={0.8} rotationIntensity={0.2} speed={1.4}>
      <group ref={tiltInnerRef} rotation={[Math.PI / 2.12, 0, 0.12]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[radius, radius, thickness, 64]} />
          <meshStandardMaterial
            color="#f5c451"
            metalness={1}
            roughness={0.15}
            emissive="#a67914"
            emissiveIntensity={0.25}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry
            args={[radius * 0.82, radius * 0.82, thickness * 1.02, 64]}
          />
          <meshStandardMaterial color="#d9a93f" metalness={1} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0, thickness / 2 + 0.002]}>
          <planeGeometry args={[size * 0.78, size * 0.78]} />
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
        <mesh
          position={[0, 0, -(thickness / 2 + 0.002)]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[size * 0.78, size * 0.78]} />
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
      </group>
    </Float>
  );
}

/** Yin-yang orbit radius for the Discord / Telegram tiles. */
const ENGAGE_ORBIT_R = 0.85;

/**
 * Stage 2 — Discord + Telegram ride a **yin-yang orbit**: they sit 180° apart
 * on a circle and spin together as you scroll. They never meet. To preserve
 * that feel when the circle is seen edge-on, one tile is offset slightly
 * forward and the other slightly back on Z (scaled by the crossing moments),
 * so they glide past one another in depth instead of through.
 */
function EngagePlatforms({ progress }: { progress: MotionValue<number> }) {
  const discordTex = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const t = loader.load('/discord-app-logo.png', (tex) => {
      tex.needsUpdate = true;
    });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
  const telegramTex = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const t = loader.load('/telegram-app-logo.png', (tex) => {
      tex.needsUpdate = true;
    });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);

  const discordRef = useRef<THREE.Group>(null);
  const telegramRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = progress.get();
    const [lo, hi] = BANDS[1];
    const u = THREE.MathUtils.clamp((p - lo) / (hi - lo), 0, 1);
    // One full yin-yang rotation across the Engage band, starting with
    // Discord at top (θ = π/2) and Telegram at bottom (θ = -π/2).
    const theta = Math.PI / 2 + u * Math.PI * 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    // When the orbit is horizontal (tiles crossing mid-line) |cos| ≈ 1;
    // we use that to push Discord in front and Telegram behind so the
    // silhouettes don't collide.
    const depth = cos * 0.22;

    if (discordRef.current) {
      discordRef.current.position.x = cos * ENGAGE_ORBIT_R;
      discordRef.current.position.y = sin * ENGAGE_ORBIT_R;
      discordRef.current.position.z = 0.02 + depth;
    }
    if (telegramRef.current) {
      telegramRef.current.position.x = -cos * ENGAGE_ORBIT_R;
      telegramRef.current.position.y = -sin * ENGAGE_ORBIT_R;
      telegramRef.current.position.z = 0.02 - depth;
    }
  });

  return (
    <Float floatIntensity={0.35} rotationIntensity={0.1} speed={1.1}>
      <group scale={0.92}>
        {/* Discord — starts at the top of the orbit */}
        <group ref={discordRef}>
          <RoundedBox args={[0.78, 0.78, 0.14]} radius={0.14} smoothness={4} castShadow>
            <meshStandardMaterial
              color="#15182c"
              roughness={0.5}
              metalness={0.12}
              emissive="#1a1f3d"
              emissiveIntensity={0.12}
            />
          </RoundedBox>
          <mesh position={[0, 0, 0.078]} renderOrder={2}>
            <planeGeometry args={[0.66, 0.66]} />
            <meshBasicMaterial
              map={discordTex}
              toneMapped={false}
              transparent
              alphaTest={0.32}
              depthWrite
            />
          </mesh>
        </group>

        {/* Telegram — starts at the bottom, 180° opposite */}
        <group ref={telegramRef}>
          <RoundedBox args={[0.78, 0.78, 0.14]} radius={0.14} smoothness={4} castShadow>
            <meshStandardMaterial
              color="#0f2f44"
              roughness={0.48}
              metalness={0.15}
              emissive="#0a3d5c"
              emissiveIntensity={0.14}
            />
          </RoundedBox>
          <mesh position={[0, 0, 0.078]} renderOrder={2}>
            <planeGeometry args={[0.66, 0.66]} />
            <meshBasicMaterial
              map={telegramTex}
              toneMapped={false}
              transparent
              alphaTest={0.02}
              depthWrite
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

function useLabelTexture(
  glyph: string,
  fg = '#07050f',
  fontStack = 'Georgia, "Times New Roman", serif',
) {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.clearRect(0, 0, size, size);
    const scale =
      glyph.length > 2 ? 0.34 : glyph.length > 1 ? 0.48 : 0.72;
    ctx.font = `900 ${Math.floor(size * scale)}px ${fontStack}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fg;
    ctx.fillText(glyph, size / 2, size / 2 + 4);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, [glyph, fg, fontStack]);
}

function AIJudgeOrbiter({
  orbRefs,
}: {
  orbRefs: [
    React.RefObject<THREE.Group | null>,
    React.RefObject<THREE.Group | null>,
    React.RefObject<THREE.Group | null>,
  ];
}) {
  const alphaTex = useLabelTexture('α');
  const betaTex = useLabelTexture('β');
  const gammaTex = useLabelTexture('γ');
  const aiTex = useLabelTexture(
    'AI',
    '#f8fafc',
    'system-ui, "Segoe UI", sans-serif',
  );

  const judges = [
    { color: '#8fe4ff', tex: alphaTex },
    { color: '#ff3df5', tex: betaTex },
    { color: '#6ffbbe', tex: gammaTex },
  ] as const;

  return (
    <group>
      <Float floatIntensity={0.3} rotationIntensity={0.25} speed={1}>
        <group>
          <mesh>
            <icosahedronGeometry args={[0.55, 1]} />
            <meshStandardMaterial
              color="#7c5cff"
              metalness={0.5}
              roughness={0.25}
              emissive="#7c5cff"
              emissiveIntensity={1.1}
              toneMapped={false}
            />
          </mesh>
          {aiTex && (
            <>
              <mesh position={[0, 0, 0.56]}>
                <planeGeometry args={[0.52, 0.28]} />
                <meshBasicMaterial
                  map={aiTex}
                  transparent
                  alphaTest={0.08}
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[0, 0, -0.56]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.52, 0.28]} />
                <meshBasicMaterial
                  map={aiTex}
                  transparent
                  alphaTest={0.08}
                  toneMapped={false}
                />
              </mesh>
            </>
          )}
        </group>
      </Float>

      {judges.map((j, i) => (
        <group key={i} ref={orbRefs[i]}>
          <mesh>
            <sphereGeometry args={[0.24, 28, 28]} />
            <meshStandardMaterial
              color={j.color}
              emissive={j.color}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
          {j.tex && (
            <>
              <mesh position={[0, 0, 0.245]}>
                <planeGeometry args={[0.32, 0.32]} />
                <meshBasicMaterial
                  map={j.tex}
                  transparent
                  alphaTest={0.1}
                  toneMapped={false}
                />
              </mesh>
              <mesh position={[0, 0, -0.245]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[0.32, 0.32]} />
                <meshBasicMaterial
                  map={j.tex}
                  transparent
                  alphaTest={0.1}
                  toneMapped={false}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

/** Lathe profile (radius x, height y) — classic cup flare, read as one solid. */
const TROPHY_CUP_PROFILE = [
  new THREE.Vector2(0.1, 0),
  new THREE.Vector2(0.13, 0.04),
  new THREE.Vector2(0.3, 0.2),
  new THREE.Vector2(0.47, 0.4),
  new THREE.Vector2(0.52, 0.54),
  new THREE.Vector2(0.48, 0.66),
  new THREE.Vector2(0.36, 0.8),
  new THREE.Vector2(0.32, 0.9),
];

/** Rich gold metal — not neon yellow; low emissive, higher roughness. */
const TROPHY_GOLD = {
  color: '#b8923f' as const,
  metalness: 1,
  roughness: 0.32,
  emissive: '#3d2e0a' as const,
  emissiveIntensity: 0.07,
};

function Trophy() {
  const cupGeo = useMemo(
    () => new THREE.LatheGeometry(TROPHY_CUP_PROFILE, 52),
    [],
  );
  useEffect(() => () => cupGeo.dispose(), [cupGeo]);

  return (
    <Float floatIntensity={0.35} rotationIntensity={0.12} speed={1}>
      <group position={[0, -0.08, 0]}>
        {/* Cup — lathe so silhouette reads as a real trophy bowl */}
        <mesh position={[0, 0.12, 0]} geometry={cupGeo} castShadow>
          <meshStandardMaterial {...TROPHY_GOLD} />
        </mesh>

        {/* Handles — slightly >180° arc, pulled in so ends meet the cup wall */}
        <mesh
          position={[-0.44, 0.52, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <torusGeometry args={[0.2, 0.044, 14, 40, Math.PI * 1.12]} />
          <meshStandardMaterial {...TROPHY_GOLD} />
        </mesh>
        <mesh
          position={[0.44, 0.52, 0]}
          rotation={[0, Math.PI, Math.PI / 2]}
        >
          <torusGeometry args={[0.2, 0.044, 14, 40, Math.PI * 1.12]} />
          <meshStandardMaterial {...TROPHY_GOLD} />
        </mesh>

        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.26, 24]} />
          <meshStandardMaterial
            color="#9a7328"
            metalness={1}
            roughness={0.35}
            emissive="#2a2008"
            emissiveIntensity={0.06}
          />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.82, 0.14, 0.52]} />
          <meshStandardMaterial
            color="#2a2540"
            metalness={0.55}
            roughness={0.45}
            emissive="#181428"
            emissiveIntensity={0.08}
          />
        </mesh>
      </group>
    </Float>
  );
}
