'use client';
import { useFrame, useLoader } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useRouter } from 'next/navigation';
import { useHeaderContext } from '@/contexts/HeaderContext';
import { unlockScroll } from '@/utils/scroll';

const vertexShader = `
uniform float uTime;
uniform vec2 uMouseCoords;
uniform float uIsHovered;
varying vec2 vUv;
varying float vWave;
uniform float uAmplitude;
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}


void main() {
  vec3 pos;
  pos = position;
  vUv = uv;
  vWave = snoise(pos + uTime);
  float distX = uMouseCoords.x - uv.x;
  float distY = uMouseCoords.y - uv.y;
  float dist = length(vec2(distX, distY));
  float phase = smoothstep(0.0, 1.0, dist);
  float factor = 1.0 - phase;
  float onde = sin(dist + uTime) * factor * uIsHovered;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.x, pos.y, snoise(pos + uTime) * uAmplitude + onde , 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform sampler2D uTexture;
varying vec2 vUv;
varying float vWave;
void main() {
  gl_FragColor = texture2D(uTexture, vUv);
}
`;

interface Props {
  imageUrl: string;
  isSelected: boolean;
  isHovered: boolean;
  /** Plane plein écran sur /work/[project] — pas de ripple */
  isProjectView?: boolean;
}

const Plane = ({
  imageUrl,
  isSelected,
  isHovered,
  isProjectView = false,
}: Props) => {
  const router = useRouter();
  const { selectedSlug, returnHome, setIsAnimating, uv, setHoveredIndex } =
    useThreeJsContext();
  const proxiedUrl = `/api/image?url=${encodeURIComponent(imageUrl!)}`;
  const texture = useLoader(THREE.TextureLoader, proxiedUrl);
  const materialRef = useRef<THREE.ShaderMaterial>();
  const { isReturning } = useHeaderContext();

  const uniforms = useRef({
    uTime: { value: 1.0 },
    uTexture: { value: texture },
    uAmplitude: { value: 0.4 },
    uMouseCoords: { value: new THREE.Vector2(uv.x ?? 0, uv.y ?? 0) },
    uIsHovered: { value: 0.0 },
  });

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value += delta;
    mat.uniforms.uMouseCoords.value.x = uv.x ?? 0;
    mat.uniforms.uMouseCoords.value.y = uv.y ?? 0;

    // Hover lissé seulement hors page projet / sélection
    if (!isSelected && !isProjectView) {
      const target = isHovered ? 1.0 : 0.0;
      mat.uniforms.uIsHovered.value +=
        (target - mat.uniforms.uIsHovered.value) * 0.12;
    }
  });

  useEffect(() => {
    if (isProjectView) {
      setHoveredIndex(null);
    }
  }, [isProjectView, setHoveredIndex]);

  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;

    const amplitude = mat.uniforms.uAmplitude;
    const hover = mat.uniforms.uIsHovered;
    const tweens: gsap.core.Tween[] = [];

    if (isReturning && isSelected) {
      tweens.push(
        gsap.to(amplitude, {
          value: 0.4,
          duration: 1,
          ease: 'power2.out',
        }),
      );
      return () => tweens.forEach((t) => t.kill());
    }

    if (isSelected || isProjectView) {
      tweens.push(
        gsap.to(hover, {
          value: 0,
          duration: 0.55,
          ease: 'power2.out',
        }),
      );
      tweens.push(
        gsap.to(amplitude, {
          value: 0,
          duration: 1,
          ease: 'power3.out',
          onComplete: () => {
            // Navigation uniquement à la fin de la sélection (pas au mount page projet)
            if (isSelected && !isProjectView && selectedSlug) {
              router.push(`/work/${selectedSlug}`);
              setIsAnimating(false);
            }
            unlockScroll();
          },
        }),
      );
      return () => tweens.forEach((t) => t.kill());
    }

    if (returnHome) {
      tweens.push(
        gsap.to(amplitude, {
          value: 0.4,
          duration: 1,
          ease: 'power2.out',
          onComplete: () => {
            unlockScroll();
          },
        }),
      );
      return () => tweens.forEach((t) => t.kill());
    }
  }, [
    isSelected,
    isReturning,
    isProjectView,
    returnHome,
    router,
    selectedSlug,
    setIsAnimating,
  ]);

  return (
    <mesh scale={[1, 1, 1]} position={[0.0, 0.0, 0.0]}>
      <planeGeometry args={[1, 1, 16, 16]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms.current}
        ref={materialRef}
        depthTest={false}
      />
    </mesh>
  );
};

export default Plane;
