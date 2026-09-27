import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, ZoomIn } from 'lucide-react';

interface DetectiveDiorama3DProps {
  scenarioType: 'whatsapp' | 'correios' | 'banco' | 'loja' | 'tarefas' | 'remoto' | 'oficial' | 'geral';
  isScam?: boolean;
  verdictResult?: 'correct' | 'incorrect' | null;
  onPropClick?: (propType: string) => void;
  interactive?: boolean;
}

export const DetectiveDiorama3D: React.FC<DetectiveDiorama3DProps> = ({
  scenarioType,
  isScam: _isScam = true,
  verdictResult = null,
  onPropClick,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredProp, setHoveredProp] = useState<string | null>(null);
  const [scanActive, setScanActive] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. CONFIGURAÇÃO DE CENA, CÂMERA E RENDERER ---
    const width = container.clientWidth;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.05);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 5.8);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- 2. ILUMINAÇÃO CYBER DETETIVE ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Light Direcional (Luz de Destaque)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Rim Light Ciano / Azul (Estilo Apple / Cyber Lab)
    const rimLightBlue = new THREE.PointLight(0x2997ff, 3.5, 12);
    rimLightBlue.position.set(-3.5, 3.5, -2);
    scene.add(rimLightBlue);

    // Rim Light Âmbar / Laranja (Contraste Pericial)
    const rimLightOrange = new THREE.PointLight(0xff9f0a, 2.5, 10);
    rimLightOrange.position.set(3.5, 2.5, -2);
    scene.add(rimLightOrange);

    // --- 3. PLATAFORMA DIORAMA (PEDESTAL CIRCULAR) ---
    const platformGroup = new THREE.Group();
    scene.add(platformGroup);

    // Base Circular
    const baseGeo = new THREE.CylinderGeometry(2.8, 3.0, 0.35, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x141417,
      roughness: 0.35,
      metalness: 0.5,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.175;
    baseMesh.receiveShadow = true;
    platformGroup.add(baseMesh);

    // Anel LED Neon no contorno da base
    const ringGeo = new THREE.TorusGeometry(2.85, 0.035, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: verdictResult === 'correct' ? 0x30d158 : verdictResult === 'incorrect' ? 0xff3b30 : 0x0071e3,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.01;
    platformGroup.add(ringMesh);

    // Grade holográfica sutil no piso
    const gridHelper = new THREE.GridHelper(5, 10, 0x0071e3, 0x1f232b);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // --- 4. BONECO PRINCIPAL: O INVESTIGADOR / DETETIVE ---
    const detectiveGroup = new THREE.Group();
    detectiveGroup.position.set(-0.8, 0, 0.3);
    scene.add(detectiveGroup);

    // Pernas (Cilindros)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1c1d22, roughness: 0.6 });
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.75, 16), legMat);
    legL.position.set(-0.16, 0.38, 0);
    legL.castShadow = true;
    detectiveGroup.add(legL);

    const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.75, 16), legMat);
    legR.position.set(0.16, 0.38, 0);
    legR.castShadow = true;
    detectiveGroup.add(legR);

    // Sapatos
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.4 });
    const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.28), shoeMat);
    shoeL.position.set(-0.16, 0.05, 0.04);
    detectiveGroup.add(shoeL);

    const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.28), shoeMat);
    shoeR.position.set(0.16, 0.05, 0.04);
    detectiveGroup.add(shoeR);

    // Tronco / Sobretudo do Detetive
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0x182438, // Azul meia-noite investigativo
      roughness: 0.5,
      metalness: 0.2,
    });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.85, 20), coatMat);
    torso.position.y = 1.1;
    torso.castShadow = true;
    detectiveGroup.add(torso);

    // Faixa / Cinto
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.27, 0.27, 0.06, 20),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0c, metalness: 0.8, roughness: 0.3 })
    );
    belt.position.y = 0.85;
    detectiveGroup.add(belt);

    // Distintivo de Detetive no Peito
    const badgeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.08, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xffd60a, metalness: 0.9, roughness: 0.1 })
    );
    badgeMesh.position.set(0.14, 1.25, 0.22);
    detectiveGroup.add(badgeMesh);

    // Cabeça e Rosto
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.68, 0);
    detectiveGroup.add(headGroup);

    const headMat = new THREE.MeshStandardMaterial({
      color: 0xe8cfb8, // Tom de pele estilizado
      roughness: 0.5,
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), headMat);
    head.castShadow = true;
    headGroup.add(head);

    // Óculos / Visor Holográfico Forense
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0071e3,
      emissive: 0x0071e3,
      emissiveIntensity: 0.65,
      metalness: 0.9,
      roughness: 0.1,
    });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.18), visorMat);
    visor.position.set(0, 0.02, 0.15);
    headGroup.add(visor);

    // Chapéu de Detetive (Fedora Estilizado)
    const hatMat = new THREE.MeshStandardMaterial({ color: 0x121824, roughness: 0.6 });
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 24), hatMat);
    hatBrim.position.set(0, 0.16, 0);
    headGroup.add(hatBrim);

    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.25, 0.24, 24), hatMat);
    hatCrown.position.set(0, 0.28, 0);
    headGroup.add(hatCrown);

    const hatRibbon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.252, 0.252, 0.05, 24),
      new THREE.MeshStandardMaterial({ color: 0x0071e3, roughness: 0.4 })
    );
    hatRibbon.position.set(0, 0.2, 0);
    headGroup.add(hatRibbon);

    // Braço Esquerdo (Segura Ferramenta / Scanner)
    const armLGroup = new THREE.Group();
    armLGroup.position.set(-0.28, 1.4, 0);
    detectiveGroup.add(armLGroup);

    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.5, 12), coatMat);
    armL.position.set(0, -0.2, 0);
    armL.rotation.z = 0.2;
    armL.rotation.x = -0.5;
    armLGroup.add(armL);

    // Dispositivo Scanner Forense na Mão Esquerda
    const scannerDevice = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.32, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x0f1115, metalness: 0.8, roughness: 0.2 })
    );
    scannerDevice.position.set(-0.05, -0.42, 0.25);
    scannerDevice.rotation.x = 0.7;
    armLGroup.add(scannerDevice);

    const scannerScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.15, 0.27),
      new THREE.MeshBasicMaterial({ color: 0x2997ff })
    );
    scannerScreen.position.set(-0.05, -0.42, 0.271);
    scannerScreen.rotation.x = 0.7;
    armLGroup.add(scannerScreen);

    // Braço Direito (Apontando / Inspecionando)
    const armRGroup = new THREE.Group();
    armRGroup.position.set(0.28, 1.4, 0);
    detectiveGroup.add(armRGroup);

    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.5, 12), coatMat);
    armR.position.set(0, -0.2, 0);
    armR.rotation.z = -0.25;
    armR.rotation.x = -0.4;
    armRGroup.add(armR);

    // Feixe de Varredura Forense (Laser Holográfico Azul)
    const scanBeamGeo = new THREE.ConeGeometry(0.4, 1.6, 24, 1, true);
    const scanBeamMat = new THREE.MeshBasicMaterial({
      color: 0x0071e3,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const scanBeam = new THREE.Mesh(scanBeamGeo, scanBeamMat);
    scanBeam.position.set(0.7, 0.8, 0.6);
    scanBeam.rotation.x = Math.PI / 2.3;
    scanBeam.rotation.z = -Math.PI / 4;
    scene.add(scanBeam);

    // --- 5. CENÁRIOS HIPOTÉTICOS E PROPS ESPECÍFICOS (SEGUNDO ELEMENTO / PROP) ---
    const propsGroup = new THREE.Group();
    propsGroup.position.set(0.9, 0, 0.2);
    scene.add(propsGroup);

    // Criamos elementos interativos para raycasting
    const interactiveObjects: THREE.Object3D[] = [];

    // Mesa ou Balcão Pericial
    const deskGeo = new THREE.BoxGeometry(1.6, 0.8, 1.1);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.4, 0);
    desk.castShadow = true;
    desk.receiveShadow = true;
    propsGroup.add(desk);

    // Adiciona adereço contextual de acordo com o cenário
    let scenarioProp: THREE.Group = new THREE.Group();
    propsGroup.add(scenarioProp);

    if (scenarioType === 'whatsapp') {
      // CENÁRIO 1: O CELULAR VIBRANDO COM MENSAGEM DO PARENTE
      const phoneGeo = new THREE.BoxGeometry(0.35, 0.65, 0.05);
      const phoneMat = new THREE.MeshStandardMaterial({ color: 0x111216, metalness: 0.8, roughness: 0.2 });
      const phone = new THREE.Mesh(phoneGeo, phoneMat);
      phone.position.set(0, 0.85, 0);
      phone.rotation.x = -Math.PI / 5;
      phone.userData = { propName: 'celular_whatsapp' };
      scenarioProp.add(phone);
      interactiveObjects.push(phone);

      const screenGeo = new THREE.PlaneGeometry(0.31, 0.58);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x25d366 }); // WhatsApp Verde
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 0.85, 0.026);
      screen.rotation.x = -Math.PI / 5;
      scenarioProp.add(screen);

      // Balão de Chat 3D Flutuante
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x25d366, emissive: 0x128c7e, emissiveIntensity: 0.5 })
      );
      bubble.position.set(0, 1.45, 0);
      scenarioProp.add(bubble);
    } else if (scenarioType === 'correios') {
      // CENÁRIO 2: O PACOTE RETIDO NA ALFÂNDEGA COM CÓDIGO DE BARRAS
      const boxGeo = new THREE.BoxGeometry(0.8, 0.5, 0.6);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xb58a63, roughness: 0.8 }); // Papelão
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, 1.05, 0);
      box.castShadow = true;
      box.userData = { propName: 'pacote_correios' };
      scenarioProp.add(box);
      interactiveObjects.push(box);

      // Fita adesiva amarela/azul Correios
      const tape = new THREE.Mesh(
        new THREE.BoxGeometry(0.81, 0.08, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xffd60a, roughness: 0.3 })
      );
      tape.position.set(0, 1.05, 0);
      scenarioProp.add(tape);

      // Etiqueta com Código de Rastreio
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
      );
      label.position.set(0.15, 1.05, 0.301);
      scenarioProp.add(label);
    } else if (scenarioType === 'banco') {
      // CENÁRIO 3: TERMINAL BANCÁRIO / CARTÃO COM CHIP NFC
      const atmGeo = new THREE.BoxGeometry(0.6, 0.7, 0.45);
      const atmMat = new THREE.MeshStandardMaterial({ color: 0x22242b, metalness: 0.7, roughness: 0.3 });
      const atm = new THREE.Mesh(atmGeo, atmMat);
      atm.position.set(0, 1.15, 0);
      atm.userData = { propName: 'terminal_banco' };
      scenarioProp.add(atm);
      interactiveObjects.push(atm);

      // Cartão com Chip NFC
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.02, 0.26),
        new THREE.MeshStandardMaterial({ color: 0x820ad1, metalness: 0.5, roughness: 0.3 }) // Nubank Roxo
      );
      card.position.set(0, 0.82, 0.3);
      scenarioProp.add(card);

      // Escudo 3D de Notificação Segura
      const shield = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.04, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0x30d158, emissive: 0x30d158, emissiveIntensity: 0.6 })
      );
      shield.position.set(0, 1.7, 0);
      scenarioProp.add(shield);
    } else if (scenarioType === 'loja') {
      // CENÁRIO 4: PRODUTO EM PROMOÇÃO (AIR FRYER HOLOGRÁFICA / DESCONTO 85%)
      const fryerBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.22, 0.45, 24),
        new THREE.MeshStandardMaterial({ color: 0x1f2024, metalness: 0.8, roughness: 0.2 })
      );
      fryerBase.position.set(0, 1.05, 0);
      fryerBase.userData = { propName: 'produto_promocao' };
      scenarioProp.add(fryerBase);
      interactiveObjects.push(fryerBase);

      // Tag de Preço Flutuante
      const tagGeo = new THREE.BoxGeometry(0.35, 0.2, 0.03);
      const tagMat = new THREE.MeshStandardMaterial({
        color: 0xff3b30,
        emissive: 0xff3b30,
        emissiveIntensity: 0.4,
      });
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.set(0.3, 1.45, 0.2);
      tag.rotation.y = -Math.PI / 6;
      scenarioProp.add(tag);
    } else if (scenarioType === 'remoto') {
      // CENÁRIO 5: NOTEBOOK COM "MÃO FANTASMA" HOLOGRÁFICA INVASIVA
      const laptopBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.03, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x3a3b40, metalness: 0.8, roughness: 0.2 })
      );
      laptopBase.position.set(0, 0.82, 0);
      scenarioProp.add(laptopBase);

      const laptopScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.42, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1c, metalness: 0.8, roughness: 0.3 })
      );
      laptopScreen.position.set(0, 1.05, -0.2);
      laptopScreen.rotation.x = 0.2;
      laptopScreen.userData = { propName: 'computador_remoto' };
      scenarioProp.add(laptopScreen);
      interactiveObjects.push(laptopScreen);

      // Mão Fantasma Holográfica Translúcida
      const ghostHand = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.5, 16),
        new THREE.MeshBasicMaterial({ color: 0xff3b30, wireframe: true, transparent: true, opacity: 0.5 })
      );
      ghostHand.position.set(0, 1.3, 0.1);
      ghostHand.rotation.x = Math.PI;
      scenarioProp.add(ghostHand);
    } else {
      // CENÁRIO PADRÃO: DISPOSITIVO MULTICANAL FORENSE
      const terminal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 0.5, 24),
        new THREE.MeshStandardMaterial({ color: 0x1e2026, metalness: 0.7, roughness: 0.3 })
      );
      terminal.position.set(0, 1.05, 0);
      terminal.userData = { propName: 'terminal_forense' };
      scenarioProp.add(terminal);
      interactiveObjects.push(terminal);
    }

    // --- 6. PARTICULAS CYBER FLUTUANTES (POEIRA FORENSE) ---
    const particlesCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 5;
      particlePos[i + 1] = Math.random() * 3.5;
      particlePos[i + 2] = (Math.random() - 0.5) * 4;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x2997ff,
      size: 0.045,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 7. INTERAÇÃO DO MOUSE E RAYCASTER ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const targetLookAt = new THREE.Vector2(0, 0);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetLookAt.x = mouse.x;
      targetLookAt.y = mouse.y;

      // Raycast para feedback de cursor
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);
      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const name = (intersects[0].object.userData.propName as string) || 'evidencia';
        setHoveredProp(name);
      } else {
        container.style.cursor = 'default';
        setHoveredProp(null);
      }
    };

    const handleClick = () => {
      if (!interactive) return;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);
      if (intersects.length > 0) {
        const propName = (intersects[0].object.userData.propName as string) || 'evidencia';
        setScanActive(true);
        setTimeout(() => setScanActive(false), 1200);
        if (onPropClick) onPropClick(propName);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // --- 8. LOOP DE ANIMAÇÃO RENDER ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Respiração natural do boneco detetive
      torso.position.y = 1.1 + Math.sin(elapsedTime * 2.2) * 0.02;
      torso.scale.y = 1 + Math.sin(elapsedTime * 2.2) * 0.015;

      // Cabeça segue o cursor do usuário suavemente
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetLookAt.x * 0.55, 0.08);
      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -targetLookAt.y * 0.25, 0.08);

      // Movimento do feixe de laser da perícia
      scanBeam.rotation.y = Math.sin(elapsedTime * 1.8) * 0.25;
      scanBeam.scale.y = 1 + Math.sin(elapsedTime * 3) * 0.1;

      // Rotação suave do anel neon e das partículas
      ringMesh.rotation.z = elapsedTime * 0.2;
      particles.rotation.y = elapsedTime * 0.04;

      // Flutuação dos props contextuais
      if (scenarioProp) {
        scenarioProp.position.y = Math.sin(elapsedTime * 1.5) * 0.04;
      }

      // Reação visual ao veredito
      if (verdictResult === 'correct') {
        ringMat.color.setHex(0x30d158);
        detectiveGroup.rotation.y = THREE.MathUtils.lerp(detectiveGroup.rotation.y, 0.3, 0.1);
      } else if (verdictResult === 'incorrect') {
        ringMat.color.setHex(0xff3b30);
        detectiveGroup.rotation.x = THREE.MathUtils.lerp(detectiveGroup.rotation.x, 0.2, 0.1);
      } else {
        ringMat.color.setHex(0x0071e3);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Redimensionamento responsivo
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 280;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- 9. CLEANUP DE RECURSOS E DISPOSE (Zero Memory Leaks) ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => mat.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
    };
  }, [scenarioType, verdictResult, interactive, onPropClick]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0a0d] to-[#121216] border border-white/[0.08] shadow-2xl group select-none"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Badges Flutuantes de Status Apple-style */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] font-mono tracking-wider uppercase bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-white flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
          <span>Diorama 3D Interativo</span>
        </span>

        {scanActive && (
          <span className="text-[10px] font-mono tracking-wider uppercase bg-[#0071e3]/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#0071e3]/40 text-[#2997ff] flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Varredura Forense Ativa</span>
          </span>
        )}
      </div>

      {/* Dica de Interatividade no canto inferior */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-[#86868b] pointer-events-none">
        <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/[0.06]">
          <Eye className="w-3.5 h-3.5 text-[#2997ff]" />
          <span>Mova o mouse para orientar a visão do detetive</span>
        </span>

        {hoveredProp && (
          <span className="flex items-center gap-1 text-[#2997ff] font-medium bg-[#0071e3]/15 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#0071e3]/30 animate-bounce">
            <ZoomIn className="w-3 h-3" /> Toque para Inspecionar Objeto
          </span>
        )}
      </div>
    </div>
  );
};
