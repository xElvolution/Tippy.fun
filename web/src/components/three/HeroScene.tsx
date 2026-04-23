'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ContactShadows,
  MeshReflectorMaterial,
  PerformanceMonitor,
  useTexture,
} from '@react-three/drei';
import { TippyMascot } from './TippyMascot';

type HeroSceneProps = {
  reducedMotion?: boolean;
};

export function HeroScene({ reducedMotion = false }: HeroSceneProps) {
  const [lowPerf, setLowPerf] = useState(false);

  return (
    <Canvas
      dpr={[1, lowPerf ? 1.25 : 2]}
      camera={{ position: [0, 0.6, 5.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
      style={{ background: 'transparent' }}
    >
      <PerformanceMonitor
        onDecline={() => setLowPerf(true)}
        onIncline={() => setLowPerf(false)}
      />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Studio lighting — no network-dependent environment map. */}
      <ambientLight intensity={0.85} color="#c7bbff" />
      <directionalLight
        position={[4, 6, 3]}
        intensity={2.4}
        color="#8fe4ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 2, 2]} intensity={3} color="#ff3df5" distance={14} />
      <pointLight position={[0, 3, -4]} intensity={2} color="#4c9cff" distance={14} />
      <pointLight position={[2, -1, 3]} intensity={1.2} color="#6ffbbe" distance={8} />

      <Suspense fallback={<PlaceholderBox />}>
        <SceneContent lowPerf={lowPerf} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}

function SceneContent({
  lowPerf,
  reducedMotion,
}: {
  lowPerf: boolean;
  reducedMotion: boolean;
}) {
  // Preload the Conflux logo once so TippyMascot renders without suspending.
  useTexture('/conflux-logo.png');

  return (
    <>
      <group position={[0, -0.2, 0]}>
        <TippyMascot reducedMotion={reducedMotion} />
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={lowPerf ? 256 : 512}
          mixBlur={1}
          mixStrength={40}
          roughness={0.9}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0814"
          metalness={0.6}
          mirror={0}
        />
      </mesh>

      <ContactShadows
        position={[0, -1.04, 0]}
        opacity={0.55}
        scale={8}
        blur={2.4}
        far={3}
        color="#000000"
      />
    </>
  );
}

/** Tiny placeholder shown if SceneContent is briefly suspended. */
function PlaceholderBox() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshBasicMaterial color="#6b38d4" />
    </mesh>
  );
}
