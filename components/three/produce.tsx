// Low-poly produce built from three.js primitives (no model downloads):
// tomato, carrot, egg, onion, brinjal and a spinach leaf. Glossy physical
// materials so they catch the hero's coloured rim lights.
"use client";

import { useMemo } from "react";

type P = { position?: [number, number, number]; rotation?: [number, number, number]; scale?: number };

/** Red, slightly squashed tomato with a five-point calyx. */
export function Tomato({ position, rotation, scale = 1 }: P) {
  const sepals = useMemo(() => Array.from({ length: 5 }, (_, i) => (i / 5) * Math.PI * 2), []);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh scale={[1, 0.86, 1]} castShadow>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshPhysicalMaterial color="#e5482b" roughness={0.22} clearcoat={1} clearcoatRoughness={0.15} />
      </mesh>
      {sepals.map((a) => (
        <mesh key={a} position={[Math.cos(a) * 0.12, 0.42, Math.sin(a) * 0.12]} rotation={[Math.sin(a) * 1.1, 0, -Math.cos(a) * 1.1]}>
          <coneGeometry args={[0.05, 0.26, 6]} />
          <meshStandardMaterial color="#2f8f4e" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.025, 0.035, 0.14, 8]} />
        <meshStandardMaterial color="#2f6b3a" />
      </mesh>
    </group>
  );
}

/** Tapered orange carrot with three leafy stalks. */
export function Carrot({ position, rotation, scale = 1 }: P) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.2, 1.15, 24]} />
        <meshPhysicalMaterial color="#f07c22" roughness={0.35} clearcoat={0.6} />
      </mesh>
      {[-0.35, 0, 0.35].map((z) => (
        <mesh key={z} position={[z * 0.25, 0.75, 0]} rotation={[0, 0, z]}>
          <cylinderGeometry args={[0.018, 0.03, 0.42, 6]} />
          <meshStandardMaterial color="#3f9a43" />
        </mesh>
      ))}
    </group>
  );
}

/** Warm cream egg. */
export function Egg({ position, rotation, scale = 1 }: P) {
  return (
    <mesh position={position} rotation={rotation} scale={[0.36 * scale, 0.48 * scale, 0.36 * scale]}>
      <sphereGeometry args={[1, 40, 40]} />
      <meshPhysicalMaterial color="#e7c49a" roughness={0.45} clearcoat={0.4} sheen={0.5} />
    </mesh>
  );
}

/** Red onion with a pointed neck. */
export function Onion({ position, rotation, scale = 1 }: P) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh scale={[1, 0.92, 1]}>
        <sphereGeometry args={[0.42, 40, 40]} />
        <meshPhysicalMaterial color="#9b3c63" roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <coneGeometry args={[0.1, 0.32, 16]} />
        <meshStandardMaterial color="#c88aa3" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Glossy purple brinjal with a green cap. */
export function Brinjal({ position, rotation, scale = 1 }: P) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <capsuleGeometry args={[0.26, 0.55, 12, 24]} />
        <meshPhysicalMaterial color="#4b1f5c" roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <coneGeometry args={[0.2, 0.18, 8]} />
        <meshStandardMaterial color="#3b7d3e" />
      </mesh>
    </group>
  );
}

/** A spinach leaf: flattened ellipsoid with a midrib. */
export function Leaf({ position, rotation, scale = 1 }: P) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh scale={[0.32, 0.03, 0.6]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshPhysicalMaterial color="#2f8f4e" roughness={0.4} clearcoat={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.01, 0.015, 1.1, 6]} />
        <meshStandardMaterial color="#9bd16a" />
      </mesh>
    </group>
  );
}
