// Landing hero 3D scene: a dark glossy "seed" world wrapped in lime and
// tomato orbit rings, with produce circling it on two tilted orbits. The
// scene leans toward the cursor, spins faster as you scroll, and stops
// rendering when off-screen. Loaded client-only (see landing/hero.tsx).
"use client";

import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { Brinjal, Carrot, Egg, Leaf, Onion, Tomato } from "./produce";

const ORBIT_A = [Tomato, Carrot, Egg, Onion, Brinjal, Leaf];
const ORBIT_B = [Leaf, Tomato, Egg, Carrot];

function Orbit({ items, radius, tilt, speed, offset = 0 }: { items: typeof ORBIT_A; radius: number; tilt: [number, number, number]; speed: number; offset?: number }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed * (1 + scrollBoost.current);
  });
  return (
    <group rotation={tilt}>
      <group ref={ref}>
        {items.map((Item, i) => {
          const a = offset + (i / items.length) * Math.PI * 2;
          return (
            <Float key={i} speed={1.6 + i * 0.2} rotationIntensity={1.2} floatIntensity={0.6}>
              <Item position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} rotation={[i * 0.7, i, i * 0.3]} scale={0.95} />
            </Float>
          );
        })}
      </group>
    </group>
  );
}

// Shared scroll velocity boost (0 → 1.5) read inside the render loop.
const scrollBoost = { current: 0 };

// Outer orbit radius plus the largest item, in world units (with the
// perspective bulge of items swinging toward the camera).
const SCENE_EXTENT = 3.25;

/** Eases the camera back until the whole orbit fits the canvas width. */
function CameraRig({ scale }: { scale: number }) {
  useFrame((state, dt) => {
    const cam = state.camera;
    if (!("fov" in cam)) return;
    const half = Math.tan((cam.fov * Math.PI) / 360);
    const aspect = state.size.width / Math.max(1, state.size.height);
    const target = Math.min(11, Math.max(7.2, (SCENE_EXTENT * scale) / (half * aspect)));
    cam.position.z += (target - cam.position.z) * Math.min(1, dt * 6);
  });
  return null;
}

function World({ compact }: { compact: boolean }) {
  const root = useRef<Group>(null);
  useFrame((state, dt) => {
    const g = root.current;
    if (!g) return;
    // Lean toward the pointer with an eased follow.
    g.rotation.x += (state.pointer.y * -0.25 - g.rotation.x) * Math.min(1, dt * 3);
    g.rotation.y += (state.pointer.x * 0.4 - g.rotation.y) * Math.min(1, dt * 3);
    scrollBoost.current *= 0.94;
  });
  return (
    <group ref={root} scale={compact ? 0.88 : 1}>
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshPhysicalMaterial color="#163323" roughness={0.18} metalness={0.1} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
      <mesh rotation={[Math.PI / 2.3, 0.2, 0]}>
        <torusGeometry args={[1.55, 0.012, 16, 160]} />
        <meshBasicMaterial color="#c6f432" />
      </mesh>
      <mesh rotation={[Math.PI / 1.7, -0.4, 0.3]}>
        <torusGeometry args={[1.85, 0.008, 16, 160]} />
        <meshBasicMaterial color="#f0532d" transparent opacity={0.75} />
      </mesh>
      <Orbit items={ORBIT_A} radius={2.6} tilt={[0.32, 0, 0.12]} speed={0.22} />
      <Orbit items={ORBIT_B} radius={1.95} tilt={[-0.5, 0, -0.25]} speed={-0.3} offset={0.6} />
      <Sparkles count={40} scale={7} size={2.2} speed={0.35} color="#c6f432" opacity={0.7} />
    </group>
  );
}

/** True when the browser can create a WebGL context. */
function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * @param fallback - rendered when WebGL is unavailable
 */
export function HeroScene({ compact = false, fallback }: { compact?: boolean; fallback?: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [webgl] = useState(() => (typeof window === "undefined" ? true : hasWebGL()));
  const [reduce] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    let last = window.scrollY;
    const onScroll = () => {
      scrollBoost.current = Math.min(1.5, scrollBoost.current + Math.abs(window.scrollY - last) / 120);
      last = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!webgl) return <>{fallback}</>;
  return (
    <div ref={wrap} className="size-full" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 7.2], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={!visible || reduce ? "demand" : "always"}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.8} />
        <pointLight position={[-4, 2, 3]} intensity={30} color="#c6f432" distance={14} />
        <pointLight position={[4, -2, 3]} intensity={24} color="#f0532d" distance={14} />
        <CameraRig scale={compact ? 0.88 : 1} />
        <World compact={compact} />
      </Canvas>
    </div>
  );
}
