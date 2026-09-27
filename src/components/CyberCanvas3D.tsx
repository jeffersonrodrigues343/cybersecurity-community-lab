import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CyberCanvas3DProps {
  className?: string;
  completedCount?: number;
}

export const CyberCanvas3D = ({ className = '', completedCount = 0 }: CyberCanvas3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const materialRefs = useRef<{
    icoMat: THREE.MeshBasicMaterial;
    ring1Mat: THREE.MeshBasicMaterial;
    ring2Mat: THREE.MeshBasicMaterial;
    particlesMat: THREE.PointsMaterial;
  } | null>(null);

  // Sync state transitions when completedCount changes
  useEffect(() => {
    if (!materialRefs.current) return;
    const { icoMat, ring1Mat, ring2Mat, particlesMat } = materialRefs.current;

    if (completedCount === 0) {
      icoMat.color.setHex(0x38bdf8); // Sky blue idle
      ring1Mat.color.setHex(0x0284c7);
      ring2Mat.color.setHex(0x6366f1);
      particlesMat.color.setHex(0x38bdf8);
    } else if (completedCount === 1) {
      icoMat.color.setHex(0x10b981); // Emerald green activated
      ring1Mat.color.setHex(0x38bdf8);
      ring2Mat.color.setHex(0x10b981);
      particlesMat.color.setHex(0x10b981);
    } else if (completedCount === 2) {
      icoMat.color.setHex(0x10b981);
      ring1Mat.color.setHex(0xa855f7); // Purple accelerator
      ring2Mat.color.setHex(0xf59e0b); // Amber
      particlesMat.color.setHex(0x34d399);
    } else {
      // 3 Completed: Full Gold / Emerald Overdrive!
      icoMat.color.setHex(0x10b981);
      ring1Mat.color.setHex(0xfacc15); // Golden
      ring2Mat.color.setHex(0x34d399);
      particlesMat.color.setHex(0xfacc15);
    }
  }, [completedCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4.2;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 3. Central Icosahedron Wireframe
    const icoGeometry = new THREE.IcosahedronGeometry(1.15, 1);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    rootGroup.add(icoMesh);
    coreMeshRef.current = icoMesh;

    // Inner glowing solid mini-core
    const innerGeo = new THREE.OctahedronGeometry(0.5, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    icoMesh.add(innerMesh);

    // 4. Orbital Cyber Rings
    const torusGeometry = new THREE.TorusGeometry(1.65, 0.025, 16, 120);
    const ring1Material = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(torusGeometry, ring1Material);
    ring1.rotation.x = Math.PI / 3;
    rootGroup.add(ring1);

    const ring2Material = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(torusGeometry, ring2Material);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    rootGroup.add(ring2);

    // 5. Data Node Particle Cloud
    const particleCount = 280;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.8 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particleGeometry, particlesMaterial);
    rootGroup.add(particles);

    materialRefs.current = {
      icoMat: icoMaterial,
      ring1Mat: ring1Material,
      ring2Mat: ring2Material,
      particlesMat: particlesMaterial,
    };

    // 6. Interactive Mouse Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let pulseScale = 1;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetRotY = x * 0.6;
      targetRotX = -y * 0.6;
    };

    // Click shockwave pulse
    const handleClick = () => {
      pulseScale = 1.35;
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // 7. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotation speeds change dynamically if room is solved
      const speedMultiplier = 1 + completedCount * 0.4;

      icoMesh.rotation.x += delta * 0.4 * speedMultiplier;
      icoMesh.rotation.y += delta * 0.5 * speedMultiplier;
      innerMesh.rotation.z -= delta * 0.8 * speedMultiplier;

      ring1.rotation.z += delta * 0.3 * speedMultiplier;
      ring2.rotation.x += delta * 0.25 * speedMultiplier;

      particles.rotation.y = elapsed * 0.08 * speedMultiplier;

      // Pulse decay towards 1.0
      if (pulseScale > 1.0) {
        pulseScale += (1.0 - pulseScale) * 0.1;
      }
      icoMesh.scale.set(pulseScale, pulseScale, pulseScale);

      // Smooth mouse follow (LERP)
      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.06;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.06;

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      icoGeometry.dispose();
      icoMaterial.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      torusGeometry.dispose();
      ring1Material.dispose();
      ring2Material.dispose();
      particleGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [completedCount]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[320px] sm:h-[400px] flex items-center justify-center cursor-pointer select-none ${className}`}
      title="Clique para interagir com o modelo 3D"
    />
  );
};
