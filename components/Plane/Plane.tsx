'use client';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useThreeJsContext } from '@/contexts/ThreeJsContext';
import { useRouter } from 'next/navigation';

const vertexShader = `
uniform float uTime;
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
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.x, pos.y, snoise(pos + uTime) * uAmplitude, 1.0);
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
  animationIsOver: boolean;
}

const Plane = ({ imageUrl, animationIsOver }: Props) => {
  const { size } = useThree();
  const router = useRouter();
  const { selectedSlug } = useThreeJsContext();
  const proxiedUrl = `/api/image?url=${encodeURIComponent(imageUrl!)}`;
  const texture = useLoader(THREE.TextureLoader, proxiedUrl);
  const materialRef = useRef<THREE.ShaderMaterial>();
  const uniforms = {
    uTime: { value: 1.0 },
    uTexture: { value: texture },
    uAmplitude: { value: 0.4 },
  };

  useFrame((_, delta) => {
    materialRef.current!.uniforms.uTime.value += delta;
  });

  useEffect(() => {
    if (!animationIsOver) return;
    const amplitude = materialRef.current?.uniforms.uAmplitude;
    if (!amplitude) return;

    gsap.to(amplitude, {
      value: 0,
      duration: 1,
      ease: 'power2.out',
      onComplete: () => {
        router.push(`/work/${selectedSlug}`);
      },
    });
  }, [animationIsOver]);

  return (
    <mesh>
      <planeGeometry args={[1, 1, 16, 16]} />
      <shaderMaterial
        // wireframe={true}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        ref={materialRef}
      />
    </mesh>
  );
};

export default Plane;
