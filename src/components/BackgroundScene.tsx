import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { BURST_EVENT, type BurstKind } from '../utils/burst';

const BURST_COLORS: Record<BurstKind, number[]> = {
  correct: [0x30d158, 0xffd84a, 0x7dd3fc],
  wrong: [0xff453a, 0xff9f0a, 0xfde68a],
};

interface Burst {
  points: THREE.Points;
  velocities: Float32Array;
  born: number;
}

// Fundo 3D: campo de partículas em profundidade + anel de "escudo", com parallax e
// explosão a cada veredito. Fica atrás do conteúdo e nunca captura toques.
const BackgroundScene = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = window.innerWidth < 640;
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0d16, 0.045);
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 14;

    // Campo de partículas: cores frias (confiança) com poucos pontos quentes
    const count = isMobile ? 900 : 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new THREE.Color(0x60a5fa), new THREE.Color(0x34d399), new THREE.Color(0xa78bfa), new THREE.Color(0xfcd34d)];
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.set([r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.6, r * Math.cos(phi) - 6], i * 3);
      const c = palette[Math.random() < 0.06 ? 3 : Math.floor(Math.random() * 3)];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const fieldGeo = new THREE.BufferGeometry();
    fieldGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fieldGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const fieldMat = new THREE.PointsMaterial({
      size: isMobile ? 0.09 : 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const field = new THREE.Points(fieldGeo, fieldMat);
    scene.add(field);

    // Anéis do "escudo" girando devagar atrás do celular
    const rings = new THREE.Group();
    [
      { radius: 5.2, color: 0x34d399, opacity: 0.16 },
      { radius: 6.4, color: 0x60a5fa, opacity: 0.1 },
    ].forEach(({ radius, color, opacity }, i) => {
      const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.025, 8, 160),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      mesh.rotation.x = Math.PI / 2.4 + i * 0.35;
      rings.add(mesh);
    });
    scene.add(rings);

    // Explosões: partículas saem do centro, desaceleram e somem em ~1,6 s
    const bursts: Burst[] = [];
    const onBurst = (e: Event) => {
      const kind = (e as CustomEvent<BurstKind>).detail;
      const n = isMobile ? 260 : 520;
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      const vel = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const dir = new THREE.Vector3().randomDirection().multiplyScalar(0.12 + Math.random() * 0.28);
        vel.set([dir.x, dir.y, dir.z], i * 3);
        const c = new THREE.Color(BURST_COLORS[kind][i % 3]);
        col.set([c.r, c.g, c.b], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const points = new THREE.Points(
        geo,
        new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      scene.add(points);
      bursts.push({ points, velocities: vel, born: performance.now() });
    };
    window.addEventListener(BURST_EVENT, onBurst);

    // Parallax leve com mouse/dedo
    const target = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 1.6;
      target.y = (e.clientY / window.innerHeight - 0.5) * 1.0;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let frame = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      field.rotation.y = t * 0.02;
      field.rotation.x = Math.sin(t * 0.1) * 0.05;
      rings.rotation.z = t * 0.08;
      rings.children[1].rotation.y = t * 0.05;
      camera.position.x += (target.x - camera.position.x) * 0.03;
      camera.position.y += (-target.y - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      const now = performance.now();
      for (let b = bursts.length - 1; b >= 0; b--) {
        const burst = bursts[b];
        const age = (now - burst.born) / 1600;
        const attr = burst.points.geometry.getAttribute('position') as THREE.BufferAttribute;
        const arr = attr.array as Float32Array;
        for (let i = 0; i < arr.length; i++) {
          arr[i] += burst.velocities[i];
          burst.velocities[i] *= 0.965;
        }
        attr.needsUpdate = true;
        (burst.points.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - age);
        if (age >= 1) {
          scene.remove(burst.points);
          burst.points.geometry.dispose();
          (burst.points.material as THREE.Material).dispose();
          bursts.splice(b, 1);
        }
      }
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(BURST_EVENT, onBurst);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} aria-hidden className="absolute inset-0 -z-10 pointer-events-none" />;
};

export default BackgroundScene;
