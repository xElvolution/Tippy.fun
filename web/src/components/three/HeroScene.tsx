'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  AdaptiveDpr,
  AdaptiveEvents,
  ContactShadows,
  Environment,
  MeshReflectorMaterial,
  PerformanceMonitor,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
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

      {/* Studio lighting. Cyan key + magenta fill = the "Tippy" glow. */}
      <ambientLight intensity={0.35} color="#b4a8ff" />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.6}
        color="#8fe4ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 2, 2]} intensity={2.2} color="#ff3df5" distance={12} />
      <pointLight position={[0, 3, -4]} intensity={1.4} color="#6b38d4" distance={12} />
      <Environment preset="night" />

      <Suspense fallback={null}>
        <group position={[0, -0.2, 0]}>
          <TippyMascot reducedMotion={reducedMotion} />
        </group>

        {/* Reflective floor */}
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
      </Suspense>

      {!lowPerf && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <ChromaticAberration
            offset={[0.0007, 0.0012]}
            radialModulation={false}
            modulationOffset={0}
            blendFunction={BlendFunction.NORMAL}
          />
          <Vignette eskil={false} offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
