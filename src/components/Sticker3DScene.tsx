import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import {
  Sparkles,
  MousePointer,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Search,
} from 'lucide-react';

interface Sticker3DSceneProps {
  caseId?: string;
  scenarioType: 'whatsapp' | 'correios' | 'banco' | 'loja' | 'tarefas' | 'remoto' | 'oficial' | 'geral';
  isScam?: boolean;
  verdictResult?: 'correct' | 'incorrect' | null;
  onPropClick?: (propType: string) => void;
}

export const Sticker3DScene: React.FC<Sticker3DSceneProps> = ({
  caseId = '',
  scenarioType,
  verdictResult = null,
  onPropClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredProp, setHoveredProp] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Identificação do contexto específico do enunciado
  const isCase1 = caseId === 'case-1-whatsapp' || (scenarioType === 'whatsapp' && !caseId.includes('6'));
  const isCase2 = caseId === 'case-2-correios' || scenarioType === 'correios';
  const isCase3 = caseId === 'case-3-compra-aprovada';
  const isCase4 = caseId === 'case-4-falsa-central';
  const isCase5 = caseId === 'case-5-loja-falsa-promocao' || scenarioType === 'loja';
  const isCase6 = caseId === 'case-6-sms-seguranca-real';
  const isCase7 = caseId === 'case-7-vaga-tarefas' || scenarioType === 'tarefas';
  const isCase8 = caseId === 'case-8-receita-ecac' || scenarioType === 'oficial';
  const isCase9 = caseId === 'case-9-mao-fantasma-suporte' || scenarioType === 'remoto';

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const container = mountRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth || 600;
    const height = 340;

    // 1. Cena Three.js
    const scene = new THREE.Scene();
    scene.background = null; // Fundo transparente para Sticker die-cut

    // 2. Câmera Perspectiva Estúdio
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 7.8);
    camera.lookAt(0, -0.1, 0);

    // 3. Renderizador WebGL
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // 4. Iluminação Estúdio Glossy Clay / Cel-Shading
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 7, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x70a5ff, 1.1);
    fillLight.position.set(-5, 3, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    rimLight.position.set(0, -4, -3);
    scene.add(rimLight);

    // 5. Grupo Raiz do Sticker 3D
    const stickerRoot = new THREE.Group();
    scene.add(stickerRoot);

    // Placa Traseira Branca de Borda Die-Cut do Sticker (Vinil Físico)
    const backingGeo = new THREE.BoxGeometry(5.2, 3.5, 0.15);
    const backingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.05,
    });
    const stickerBacking = new THREE.Mesh(backingGeo, backingMat);
    stickerBacking.position.z = -0.18;
    stickerBacking.castShadow = true;
    stickerRoot.add(stickerBacking);

    // Borda Interna Suave
    const innerBorderGeo = new THREE.BoxGeometry(5.05, 3.35, 0.17);
    const innerBorderMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
    });
    const innerBorder = new THREE.Mesh(innerBorderGeo, innerBorderMat);
    innerBorder.position.z = -0.14;
    stickerRoot.add(innerBorder);

    // Armazenamento de Objetos Interativos para Raycaster
    const interactiveObjects: THREE.Object3D[] = [];

    // Helper: Material Glossy Estilo Clay/Sticker
    const createStickerMaterial = (color: number, roughness = 0.22, metalness = 0.06) => {
      return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
      });
    };

    // Helper: Borda Die-Cut Branca (Inverted Hull)
    const addWhiteOutline = (mesh: THREE.Mesh, scaleMultiplier = 1.1) => {
      const outlineMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.BackSide,
      });
      const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat);
      outlineMesh.scale.multiplyScalar(scaleMultiplier);
      mesh.add(outlineMesh);
    };

    // Helper: Contorno Preto de Nanquim (Inverted Hull Comic Ink)
    const addBlackInkOutline = (mesh: THREE.Mesh, scaleMultiplier = 1.08) => {
      const outlineMat = new THREE.MeshBasicMaterial({
        color: 0x090b10,
        side: THREE.BackSide,
      });
      const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat);
      outlineMesh.scale.multiplyScalar(scaleMultiplier);
      mesh.add(outlineMesh);
      return outlineMesh;
    };

    // Helper: Criar Cilindro de Membro (Braço / Perna Palito)
    const createStickSegment = (
      start: THREE.Vector3,
      end: THREE.Vector3,
      radius = 0.045,
      color = 0x090b10
    ) => {
      const dir = new THREE.Vector3().subVectors(end, start);
      const length = dir.length();
      const geo = new THREE.CylinderGeometry(radius, radius, length, 14);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.25,
      });
      const cyl = new THREE.Mesh(geo, mat);

      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      cyl.position.copy(mid);
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      return cyl;
    };

    // =========================================================================
    // FACTORY DO BONECO PALITO (Fidelidade ao arquivo images.jpeg)
    // =========================================================================
    const createBonecoPalito = (
      customPose: 'pondering' | 'holding_phone' | 'holding_coffee' | 'alarmed' | 'inspecting' = 'pondering'
    ) => {
      const stickmanGroup = new THREE.Group();
      stickmanGroup.name = 'boneco-detetive';

      // 1. Cabeça (Esfera Branca com Contorno Preto de Nanquim)
      const headRadius = 0.54;
      const headGeo = new THREE.SphereGeometry(headRadius, 32, 32);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.set(0, 0.76, 0);
      headMesh.castShadow = true;
      addBlackInkOutline(headMesh, 1.07);
      stickmanGroup.add(headMesh);

      // 2. Os 3 Fios de Cabelo Icônicos (\ | /) no topo da cabeça (conforme images.jpeg)
      const hairMat = new THREE.MeshStandardMaterial({
        color: 0x090b10,
        roughness: 0.2,
      });

      // Fio Esquerdo (curvado para a esquerda)
      const hairLeftCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(-0.16, 0.78, 0.05),
        new THREE.Vector3(-0.28, 0.94, 0.08)
      );
      const hairLeftGeo = new THREE.TubeGeometry(hairLeftCurve, 12, 0.032, 8, false);
      const hairLeft = new THREE.Mesh(hairLeftGeo, hairMat);
      headMesh.add(hairLeft);

      // Fio Central (quase reto para cima, leve inclinação)
      const hairCenterCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.52, 0),
        new THREE.Vector3(0.02, 0.84, 0),
        new THREE.Vector3(0.05, 1.04, 0)
      );
      const hairCenterGeo = new THREE.TubeGeometry(hairCenterCurve, 12, 0.034, 8, false);
      const hairCenter = new THREE.Mesh(hairCenterGeo, hairMat);
      headMesh.add(hairCenter);

      // Fio Direito (curvado para a direita)
      const hairRightCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.5, 0),
        new THREE.Vector3(0.18, 0.78, 0.05),
        new THREE.Vector3(0.3, 0.94, 0.08)
      );
      const hairRightGeo = new THREE.TubeGeometry(hairRightCurve, 12, 0.032, 8, false);
      const hairRight = new THREE.Mesh(hairRightGeo, hairMat);
      headMesh.add(hairRight);

      // 3. Rosto Expressivo com Textura Canvas HD
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 512;
      faceCanvas.height = 512;
      const faceCtx = faceCanvas.getContext('2d')!;

      const updateFaceCanvas = (
        mode: 'pondering' | 'happy' | 'shocked' | 'inspecting',
        blink = false
      ) => {
        faceCtx.clearRect(0, 0, 512, 512);
        faceCtx.strokeStyle = '#090b10';
        faceCtx.fillStyle = '#090b10';
        faceCtx.lineCap = 'round';
        faceCtx.lineJoin = 'round';

        if (mode === 'happy') {
          // Sobrancelhas alegres
          faceCtx.lineWidth = 14;
          faceCtx.beginPath();
          faceCtx.moveTo(150, 160);
          faceCtx.quadraticCurveTo(205, 135, 245, 160);
          faceCtx.stroke();
          faceCtx.beginPath();
          faceCtx.moveTo(275, 160);
          faceCtx.quadraticCurveTo(315, 135, 360, 160);
          faceCtx.stroke();

          // Olhos em arco sorridente ^ ^
          faceCtx.lineWidth = 14;
          faceCtx.beginPath();
          faceCtx.moveTo(175, 240);
          faceCtx.quadraticCurveTo(205, 205, 235, 240);
          faceCtx.stroke();
          faceCtx.beginPath();
          faceCtx.moveTo(285, 240);
          faceCtx.quadraticCurveTo(315, 205, 345, 240);
          faceCtx.stroke();

          // Sorriso largo
          faceCtx.lineWidth = 14;
          faceCtx.beginPath();
          faceCtx.arc(260, 280, 48, 0.15 * Math.PI, 0.85 * Math.PI, false);
          faceCtx.stroke();
        } else if (mode === 'shocked') {
          // Sobrancelhas em aflição
          faceCtx.lineWidth = 14;
          faceCtx.beginPath();
          faceCtx.moveTo(150, 150);
          faceCtx.lineTo(235, 185);
          faceCtx.stroke();
          faceCtx.beginPath();
          faceCtx.moveTo(365, 150);
          faceCtx.lineTo(280, 185);
          faceCtx.stroke();

          // Olhos arregalados O O
          faceCtx.lineWidth = 12;
          faceCtx.beginPath();
          faceCtx.arc(200, 235, 24, 0, Math.PI * 2);
          faceCtx.stroke();
          faceCtx.beginPath();
          faceCtx.arc(315, 235, 24, 0, Math.PI * 2);
          faceCtx.stroke();

          // Pupilas em pânico
          faceCtx.beginPath();
          faceCtx.arc(200, 235, 8, 0, Math.PI * 2);
          faceCtx.arc(315, 235, 8, 0, Math.PI * 2);
          faceCtx.fill();

          // Boca trêmula
          faceCtx.lineWidth = 12;
          faceCtx.beginPath();
          faceCtx.moveTo(210, 320);
          faceCtx.lineTo(235, 335);
          faceCtx.lineTo(260, 315);
          faceCtx.lineTo(285, 335);
          faceCtx.lineTo(310, 320);
          faceCtx.stroke();

          // Gota de suor cômica escorrendo
          faceCtx.fillStyle = '#2997ff';
          faceCtx.beginPath();
          faceCtx.moveTo(380, 160);
          faceCtx.bezierCurveTo(360, 185, 360, 215, 380, 220);
          faceCtx.bezierCurveTo(400, 215, 400, 185, 380, 160);
          faceCtx.fill();
        } else {
          // MODO DEFAULT / PONDERING / INVESTIGATING (Réplica Fiel de images.jpeg)
          // 1. Sobrancelha Esquerda (viewer's left) - Arqueada bem alta, sinal de dúvida/questionamento
          faceCtx.lineWidth = 14;
          faceCtx.beginPath();
          faceCtx.moveTo(150, 190);
          faceCtx.quadraticCurveTo(205, 135, 245, 185);
          faceCtx.stroke();

          // 2. Sobrancelha Direita (viewer's right) - Mais baixa e concentrada
          faceCtx.beginPath();
          faceCtx.moveTo(275, 202);
          faceCtx.quadraticCurveTo(315, 192, 360, 212);
          faceCtx.stroke();

          // 3. Olhos ovais pretos sólidos expressivos
          if (blink) {
            faceCtx.lineWidth = 12;
            faceCtx.beginPath();
            faceCtx.moveTo(180, 245);
            faceCtx.lineTo(230, 245);
            faceCtx.stroke();
            faceCtx.beginPath();
            faceCtx.moveTo(290, 245);
            faceCtx.lineTo(340, 245);
            faceCtx.stroke();
          } else {
            faceCtx.beginPath();
            faceCtx.ellipse(205, 242, 14, 25, 0, 0, Math.PI * 2);
            faceCtx.fill();

            faceCtx.beginPath();
            faceCtx.ellipse(315, 242, 14, 25, 0, 0, Math.PI * 2);
            faceCtx.fill();
          }

          // 4. Boca ondulada de dúvida ("Hmm... será que é golpe?")
          faceCtx.lineWidth = 13;
          faceCtx.beginPath();
          faceCtx.moveTo(215, 315);
          faceCtx.bezierCurveTo(240, 308, 265, 326, 305, 308);
          faceCtx.stroke();
        }
      };

      const initialMode =
        verdictResult === 'correct'
          ? 'happy'
          : verdictResult === 'incorrect'
          ? 'shocked'
          : 'pondering';
      updateFaceCanvas(initialMode);

      const faceTexture = new THREE.CanvasTexture(faceCanvas);
      faceTexture.needsUpdate = true;

      const faceGeo = new THREE.PlaneGeometry(0.76, 0.76);
      const faceMat = new THREE.MeshBasicMaterial({
        map: faceTexture,
        transparent: true,
        depthWrite: false,
      });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      faceMesh.position.set(0, 0.76, 0.52);
      stickmanGroup.add(faceMesh);

      // 4. Pescoço (Pequeno conector preto)
      const neckGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.22, 12);
      const neckMesh = new THREE.Mesh(neckGeo, hairMat);
      neckMesh.position.set(0, 0.16, 0);
      stickmanGroup.add(neckMesh);

      // 5. Tronco Pílula Branco com Contorno Preto (conforme images.jpeg)
      const torsoGeo = new THREE.CapsuleGeometry(0.24, 0.68, 16, 16);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
      torsoMesh.position.set(-0.06, -0.36, 0);
      addBlackInkOutline(torsoMesh, 1.08);
      stickmanGroup.add(torsoMesh);

      // 6. Braços e Mãos
      const jointMat = hairMat;

      // Braço Direito (viewer's left / personagem à direita)
      if (customPose === 'holding_phone') {
        // Segurando o telefone perto do ouvido
        const rShoulder = new THREE.Vector3(-0.28, -0.1, 0);
        const rElbow = new THREE.Vector3(-0.55, 0.2, 0.2);
        const rHand = new THREE.Vector3(-0.48, 0.7, 0.35);

        stickmanGroup.add(createStickSegment(rShoulder, rElbow));
        stickmanGroup.add(createStickSegment(rElbow, rHand));

        const rHandSphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), jointMat);
        rHandSphere.position.copy(rHand);
        stickmanGroup.add(rHandSphere);
      } else if (customPose === 'holding_coffee') {
        // Segurando a caneca de café na mão esquerda
        const rShoulder = new THREE.Vector3(-0.28, -0.1, 0);
        const rElbow = new THREE.Vector3(-0.6, -0.38, 0.15);
        const rHand = new THREE.Vector3(-0.35, -0.2, 0.45);

        stickmanGroup.add(createStickSegment(rShoulder, rElbow));
        stickmanGroup.add(createStickSegment(rElbow, rHand));

        const rHandSphere = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), jointMat);
        rHandSphere.position.copy(rHand);
        stickmanGroup.add(rHandSphere);
      } else {
        // POSE OFICIAL DE IMAGES.JPEG: Mão na cintura (relaxada/inquisitiva)
        const rShoulder = new THREE.Vector3(-0.28, -0.1, 0);
        const rElbow = new THREE.Vector3(-0.65, -0.42, 0.05);
        const rHand = new THREE.Vector3(-0.32, -0.7, 0.08);

        stickmanGroup.add(createStickSegment(rShoulder, rElbow));
        stickmanGroup.add(createStickSegment(rElbow, rHand));

        const rJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), jointMat);
        rJoint.position.copy(rElbow);
        stickmanGroup.add(rJoint);

        const rHandLoop = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.03, 8, 16), jointMat);
        rHandLoop.position.copy(rHand);
        rHandLoop.rotation.y = Math.PI / 2;
        stickmanGroup.add(rHandLoop);
      }

      // Braço Esquerdo (viewer's right / personagem à esquerda)
      // POSE OFICIAL DE IMAGES.JPEG: MÃO NO QUEIXO EM PROFUNDA REFLEXÃO
      const lShoulder = new THREE.Vector3(0.18, -0.1, 0);
      const lElbow = new THREE.Vector3(0.38, -0.42, 0.18);
      const lHand = new THREE.Vector3(0.08, 0.32, 0.46);

      stickmanGroup.add(createStickSegment(lShoulder, lElbow));
      stickmanGroup.add(createStickSegment(lElbow, lHand));

      const lJoint = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), jointMat);
      lJoint.position.copy(lElbow);
      stickmanGroup.add(lJoint);

      // Mão em concha tocando o queixo (exatamente como images.jpeg)
      const chinHandGroup = new THREE.Group();
      chinHandGroup.position.copy(lHand);

      const finger1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.16, 8),
        jointMat
      );
      finger1.rotation.z = -0.4;
      finger1.position.set(-0.04, 0.04, 0);

      const finger2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 0.14, 8),
        jointMat
      );
      finger2.rotation.z = 0.3;
      finger2.position.set(0.04, 0.02, 0);

      chinHandGroup.add(finger1, finger2);
      stickmanGroup.add(chinHandGroup);

      // 7. Pernas Palito e Pés Orais (conforme images.jpeg)
      const lHip = new THREE.Vector3(-0.16, -0.85, 0);
      const lFootPos = new THREE.Vector3(-0.22, -1.82, 0);
      stickmanGroup.add(createStickSegment(lHip, lFootPos, 0.042));

      // Perna direita com leve quebra no joelho (postura relaxada de pé)
      const rHip = new THREE.Vector3(0.06, -0.85, 0);
      const rKnee = new THREE.Vector3(0.24, -1.35, 0.05);
      const rFootPos = new THREE.Vector3(0.32, -1.82, 0);
      stickmanGroup.add(createStickSegment(rHip, rKnee, 0.042));
      stickmanGroup.add(createStickSegment(rKnee, rFootPos, 0.042));

      // Pés Ovais Pretos Planos
      const footGeo = new THREE.BoxGeometry(0.28, 0.08, 0.16);
      const lFoot = new THREE.Mesh(footGeo, jointMat);
      lFoot.position.set(-0.25, -1.84, 0.05);
      const rFoot = new THREE.Mesh(footGeo, jointMat);
      rFoot.position.set(0.35, -1.84, 0.05);
      rFoot.rotation.y = -0.2;
      stickmanGroup.add(lFoot, rFoot);

      // 8. Sombra de Hachura Cômica no Chão (Traços de nanquim de images.jpeg)
      const hatchCanvas = document.createElement('canvas');
      hatchCanvas.width = 512;
      hatchCanvas.height = 256;
      const hatchCtx = hatchCanvas.getContext('2d')!;

      // Gradiente suave de contato
      const grad = hatchCtx.createRadialGradient(256, 128, 10, 256, 128, 140);
      grad.addColorStop(0, 'rgba(9, 11, 16, 0.35)');
      grad.addColorStop(1, 'rgba(9, 11, 16, 0)');
      hatchCtx.fillStyle = grad;
      hatchCtx.beginPath();
      hatchCtx.ellipse(256, 128, 180, 55, 0, 0, Math.PI * 2);
      hatchCtx.fill();

      // Traços de Hachura Inclinados (Sketch Cross-Hatching)
      hatchCtx.strokeStyle = '#090b10';
      hatchCtx.lineWidth = 4;
      hatchCtx.lineCap = 'round';
      for (let x = 120; x <= 390; x += 14) {
        hatchCtx.beginPath();
        hatchCtx.moveTo(x - 22, 148);
        hatchCtx.lineTo(x + 18, 108);
        hatchCtx.stroke();
      }

      const hatchTexture = new THREE.CanvasTexture(hatchCanvas);
      hatchTexture.needsUpdate = true;

      const hatchGeo = new THREE.PlaneGeometry(2.4, 1.2);
      const hatchMat = new THREE.MeshBasicMaterial({
        map: hatchTexture,
        transparent: true,
        depthWrite: false,
      });
      const hatchMesh = new THREE.Mesh(hatchGeo, hatchMat);
      hatchMesh.rotation.x = -Math.PI / 2;
      hatchMesh.position.set(0.05, -1.87, 0.05);
      stickmanGroup.add(hatchMesh);

      return {
        group: stickmanGroup,
        headMesh,
        chinHandGroup,
        updateFace: updateFaceCanvas,
        faceTexture,
      };
    };

    // =========================================================================
    // INSTANCIAÇÃO DO BONECO PALITO CONFORME O CENÁRIO
    // =========================================================================
    let stickmanInstance: ReturnType<typeof createBonecoPalito>;

    if (isCase4) {
      stickmanInstance = createBonecoPalito('holding_phone');
      stickmanInstance.group.position.set(-1.45, 0.2, 0.5);
    } else if (isCase3) {
      stickmanInstance = createBonecoPalito('holding_coffee');
      stickmanInstance.group.position.set(-1.45, 0.2, 0.5);
    } else {
      stickmanInstance = createBonecoPalito('pondering');
      stickmanInstance.group.position.set(-1.45, 0.2, 0.5);
    }

    // Leve rotação de 15 graus para observar a cena no centro
    stickmanInstance.group.rotation.y = 0.25;
    stickerRoot.add(stickmanInstance.group);
    interactiveObjects.push(stickmanInstance.group);

    // =========================================================================
    // CENÁRIO 1: WhatsApp Filho / Parente com Celular Quebrado
    // =========================================================================
    if (isCase1) {
      // 1. Celular Trincado 3D (Interativo)
      const phoneGroup = new THREE.Group();
      phoneGroup.name = 'celular-quebrado';
      phoneGroup.position.set(0.15, -0.05, 0.5);

      const phoneBodyGeo = new THREE.BoxGeometry(1.25, 1.95, 0.14);
      const phoneBodyMat = createStickerMaterial(0x1e272e, 0.2);
      const phoneBody = new THREE.Mesh(phoneBodyGeo, phoneBodyMat);
      addWhiteOutline(phoneBody, 1.08);
      phoneGroup.add(phoneBody);

      // Tela verde WhatsApp
      const screenGeo = new THREE.BoxGeometry(1.12, 1.76, 0.05);
      const screenMat = createStickerMaterial(0x0e3a1f, 0.15);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.08;
      phoneGroup.add(screen);

      // Rachaduras cômicas estilizadas na tela
      const crackMat = createStickerMaterial(0xffffff);
      const crack1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.95, 8), crackMat);
      crack1.rotation.z = 0.75;
      crack1.position.set(0.1, 0.2, 0.12);

      const crack2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), crackMat);
      crack2.rotation.z = -0.55;
      crack2.position.set(-0.15, -0.15, 0.12);
      phoneGroup.add(crack1, crack2);

      // Band-aid no topo do celular
      const plasterGeo = new THREE.BoxGeometry(0.4, 0.14, 0.05);
      const plasterMat = createStickerMaterial(0xffb59b);
      const plaster = new THREE.Mesh(plasterGeo, plasterMat);
      plaster.position.set(0.2, 0.65, 0.13);
      plaster.rotation.z = -0.3;
      phoneGroup.add(plaster);

      stickerRoot.add(phoneGroup);
      interactiveObjects.push(phoneGroup);

      // 2. Balão 3D de Pix Urgente do WhatsApp com Moeda R$ 480
      const bubbleGroup = new THREE.Group();
      bubbleGroup.name = 'whatsapp-pix';
      bubbleGroup.position.set(1.45, 0.7, 0.7);

      const bubbleGeo = new THREE.BoxGeometry(1.5, 0.85, 0.15);
      const bubbleMat = createStickerMaterial(0x25d366, 0.25);
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      addWhiteOutline(bubble, 1.1);
      bubbleGroup.add(bubble);

      // Moeda Dourada
      const coinGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 32);
      const coinMat = createStickerMaterial(0xffcc00, 0.15, 0.6);
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.x = Math.PI / 2;
      coin.position.set(0, 0, 0.12);
      bubbleGroup.add(coin);

      stickerRoot.add(bubbleGroup);
      interactiveObjects.push(bubbleGroup);
    }

    // =========================================================================
    // CENÁRIO 2: Correios / Encomenda Retida na Alfândega
    // =========================================================================
    else if (isCase2) {
      // 1. Esteira Rolante 3D
      const beltGeo = new THREE.BoxGeometry(3.0, 0.22, 1.4);
      const beltMat = createStickerMaterial(0x2f3542, 0.5);
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0.3, -1.0, 0.3);
      stickerRoot.add(belt);

      // 2. Caixa de Encomenda 3D (Interativa)
      const packageGroup = new THREE.Group();
      packageGroup.name = 'pacote-correios';
      packageGroup.position.set(-0.25, -0.4, 0.5);

      const boxGeo = new THREE.BoxGeometry(1.2, 1.0, 1.0);
      const boxMat = createStickerMaterial(0xdfa05d, 0.4);
      const box = new THREE.Mesh(boxGeo, boxMat);
      addWhiteOutline(box, 1.08);
      packageGroup.add(box);

      // Fita Adesiva
      const tapeGeo = new THREE.BoxGeometry(1.24, 0.22, 1.04);
      const tapeMat = createStickerMaterial(0xb57c3e, 0.3);
      packageGroup.add(new THREE.Mesh(tapeGeo, tapeMat));

      stickerRoot.add(packageGroup);
      interactiveObjects.push(packageGroup);

      // 3. Cancela Alfandegária Listrada Vermelha e Branca
      const barrierGroup = new THREE.Group();
      barrierGroup.position.set(1.1, -0.4, 0.7);

      const postGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.5, 16);
      const postMat = createStickerMaterial(0x444444);
      barrierGroup.add(new THREE.Mesh(postGeo, postMat));

      const barGeo = new THREE.BoxGeometry(1.8, 0.18, 0.12);
      const barMat = createStickerMaterial(0xff3b30, 0.3);
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-0.7, 0.35, 0);
      bar.rotation.z = -0.25;
      addWhiteOutline(bar, 1.12);
      barrierGroup.add(bar);

      // 4. Carimbo 3D de "TAXA PENDENTE"
      const stampGroup = new THREE.Group();
      stampGroup.name = 'taxa-alfandega';
      stampGroup.position.set(1.25, 0.85, 0.8);

      const stampPlateGeo = new THREE.BoxGeometry(1.5, 0.7, 0.14);
      const stampPlateMat = createStickerMaterial(0xff3b30, 0.2);
      const stampPlate = new THREE.Mesh(stampPlateGeo, stampPlateMat);
      addWhiteOutline(stampPlate, 1.12);
      stampGroup.add(stampPlate);

      stickerRoot.add(barrierGroup, stampGroup);
      interactiveObjects.push(stampGroup);
    }

    // =========================================================================
    // CENÁRIO 3: Padaria Estrela / Notificação Legítima de Cartão NFC
    // =========================================================================
    else if (isCase3) {
      // 1. Balcão de Madeira
      const counterGeo = new THREE.BoxGeometry(3.2, 0.3, 1.4);
      const counterMat = createStickerMaterial(0x8a532b, 0.4);
      const counter = new THREE.Mesh(counterGeo, counterMat);
      counter.position.set(0.3, -1.0, 0.2);
      stickerRoot.add(counter);

      // 2. Caneca de Café fumegante segurada pelo boneco
      const cupGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.5, 20);
      const cupMat = createStickerMaterial(0xffffff, 0.2);
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(-1.0, -0.05, 0.7);
      addWhiteOutline(cup, 1.1);
      stickerRoot.add(cup);

      // 3. Máquina de Cartão POS 3D (Interativa)
      const terminalGroup = new THREE.Group();
      terminalGroup.name = 'terminal-padaria';
      terminalGroup.position.set(0.2, -0.38, 0.6);

      const posGeo = new THREE.BoxGeometry(1.05, 1.35, 0.38);
      const posMat = createStickerMaterial(0x2d3436, 0.3);
      const pos = new THREE.Mesh(posGeo, posMat);
      pos.rotation.x = 0.35;
      addWhiteOutline(pos, 1.08);
      terminalGroup.add(pos);

      // Tela verde da maquininha
      const screenGeo = new THREE.BoxGeometry(0.75, 0.48, 0.05);
      const screenMat = createStickerMaterial(0x00b894, 0.2);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 0.28, 0.24);
      screen.rotation.x = 0.35;
      terminalGroup.add(screen);

      stickerRoot.add(terminalGroup);
      interactiveObjects.push(terminalGroup);

      // 4. Cartão com Ondas NFC Verdes Legítimas
      const cardGroup = new THREE.Group();
      cardGroup.name = 'cartao-nfc';
      cardGroup.position.set(1.35, 0.45, 0.8);

      const cardGeo = new THREE.BoxGeometry(1.15, 0.72, 0.05);
      const cardMat = createStickerMaterial(0x0984e3, 0.2);
      const card = new THREE.Mesh(cardGeo, cardMat);
      card.rotation.z = 0.25;
      addWhiteOutline(card, 1.12);
      cardGroup.add(card);

      const ringGeo = new THREE.TorusGeometry(0.48, 0.03, 8, 24, Math.PI);
      const ringMat = createStickerMaterial(0x00ff88, 0.2);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0.55, 0.18, 0.1);
      cardGroup.add(ring);

      stickerRoot.add(cardGroup);
      interactiveObjects.push(cardGroup);
    }

    // =========================================================================
    // CENÁRIO 4: Falsa Central Telefônica 0800 & Conta Cofre
    // =========================================================================
    else if (isCase4) {
      // 1. Aparelho Telefônico Retrô Segurado pelo Boneco
      const phoneGroup = new THREE.Group();
      phoneGroup.name = 'telefone-0800';
      phoneGroup.position.set(-1.0, 0.85, 0.8);

      const handsetGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.9, 16);
      const handsetMat = createStickerMaterial(0xd63031, 0.25);
      const handset = new THREE.Mesh(handsetGeo, handsetMat);
      handset.rotation.z = 0.3;
      addWhiteOutline(handset, 1.1);
      phoneGroup.add(handset);

      stickerRoot.add(phoneGroup);
      interactiveObjects.push(phoneGroup);

      // 2. Holograma BINA 0800 Flutuante (Spoofing)
      const binaGroup = new THREE.Group();
      binaGroup.name = 'bina-spoofing';
      binaGroup.position.set(0.1, 0.85, 0.8);

      const binaPlateGeo = new THREE.BoxGeometry(1.65, 0.65, 0.1);
      const binaPlateMat = createStickerMaterial(0x0984e3, 0.2);
      const binaPlate = new THREE.Mesh(binaPlateGeo, binaPlateMat);
      addWhiteOutline(binaPlate, 1.12);
      binaGroup.add(binaPlate);

      stickerRoot.add(binaGroup);
      interactiveObjects.push(binaGroup);

      // 3. Cofre Bancário Giratório com Engrenagens
      const vaultGroup = new THREE.Group();
      vaultGroup.name = 'cofre-bancario';
      vaultGroup.position.set(1.4, -0.15, 0.5);

      const vaultBodyGeo = new THREE.BoxGeometry(1.35, 1.45, 0.85);
      const vaultBodyMat = createStickerMaterial(0x636e72, 0.3, 0.4);
      const vaultBody = new THREE.Mesh(vaultBodyGeo, vaultBodyMat);
      addWhiteOutline(vaultBody, 1.08);
      vaultGroup.add(vaultBody);

      const wheelGeo = new THREE.TorusGeometry(0.32, 0.075, 12, 24);
      const wheelMat = createStickerMaterial(0xfdcb6e, 0.15, 0.8);
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.z = 0.52;
      vaultGroup.add(wheel);

      stickerRoot.add(vaultGroup);
      interactiveObjects.push(vaultGroup);
    }

    // =========================================================================
    // CENÁRIO 5: Loja Falsa / Air Fryer 85% OFF no Instagram
    // =========================================================================
    else if (isCase5) {
      // 1. Fritadeira Air Fryer 3D (Interativa)
      const fryerGroup = new THREE.Group();
      fryerGroup.name = 'air-fryer';
      fryerGroup.position.set(-0.25, -0.22, 0.6);

      const fryerBodyGeo = new THREE.CylinderGeometry(0.65, 0.75, 1.35, 32);
      const fryerBodyMat = createStickerMaterial(0x1e272e, 0.2);
      const fryerBody = new THREE.Mesh(fryerBodyGeo, fryerBodyMat);
      addWhiteOutline(fryerBody, 1.08);
      fryerGroup.add(fryerBody);

      const handleGeo = new THREE.BoxGeometry(0.38, 0.14, 0.32);
      const handleMat = createStickerMaterial(0xc7ecee, 0.1, 0.5);
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(0, -0.1, 0.8);
      fryerGroup.add(handle);

      stickerRoot.add(fryerGroup);
      interactiveObjects.push(fryerGroup);

      // 2. Tag de Promoção Explosiva "-85% OFF"
      const promoGroup = new THREE.Group();
      promoGroup.name = 'promocao-fryer';
      promoGroup.position.set(1.2, 0.68, 0.8);

      const tagGeo = new THREE.BoxGeometry(1.5, 0.75, 0.1);
      const tagMat = createStickerMaterial(0xff3b30, 0.2);
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.rotation.z = -0.15;
      addWhiteOutline(tag, 1.12);
      promoGroup.add(tag);

      // 3. Cartão com Bloqueio [X] forçando Pix
      const blockedGroup = new THREE.Group();
      blockedGroup.position.set(1.2, -0.55, 0.6);

      const cardGeo = new THREE.BoxGeometry(1.15, 0.68, 0.05);
      const cardMat = createStickerMaterial(0x718093, 0.4);
      const card = new THREE.Mesh(cardGeo, cardMat);
      addWhiteOutline(card, 1.1);
      blockedGroup.add(card);

      stickerRoot.add(promoGroup, blockedGroup);
      interactiveObjects.push(promoGroup);
    }

    // =========================================================================
    // CENÁRIO 6: SMS 2FA Autêntico / Login Bancário no PC
    // =========================================================================
    else if (isCase6) {
      // 1. Monitor Desktop com tela de banco
      const pcGroup = new THREE.Group();
      pcGroup.name = 'computador-login';
      pcGroup.position.set(-0.25, 0.08, 0.4);

      const screenGeo = new THREE.BoxGeometry(1.65, 1.15, 0.1);
      const screenMat = createStickerMaterial(0x0984e3, 0.3);
      const pcScreen = new THREE.Mesh(screenGeo, screenMat);
      addWhiteOutline(pcScreen, 1.08);
      pcGroup.add(pcScreen);

      const standGeo = new THREE.CylinderGeometry(0.08, 0.14, 0.55, 16);
      const standMat = createStickerMaterial(0x636e72);
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.set(0, -0.75, 0);
      pcGroup.add(stand);

      stickerRoot.add(pcGroup);
      interactiveObjects.push(pcGroup);

      // 2. Escudo Protetor 3D com Token [ 839-201 ]
      const shieldGroup = new THREE.Group();
      shieldGroup.name = 'token-2fa';
      shieldGroup.position.set(1.35, 0.15, 0.7);

      const shieldGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.14, 6);
      const shieldMat = createStickerMaterial(0x10ac84, 0.2);
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.rotation.x = Math.PI / 2;
      addWhiteOutline(shield, 1.12);
      shieldGroup.add(shield);

      stickerRoot.add(shieldGroup);
      interactiveObjects.push(shieldGroup);
    }

    // =========================================================================
    // CENÁRIO 7: Golpe das Tarefas / Pirâmide de Curtidas
    // =========================================================================
    else if (isCase7) {
      // 1. Botão 3D de Play / Curtida do YouTube
      const playGroup = new THREE.Group();
      playGroup.name = 'tarefas-curtida';
      playGroup.position.set(-0.35, 0.35, 0.6);

      const buttonGeo = new THREE.BoxGeometry(1.25, 0.85, 0.16);
      const buttonMat = createStickerMaterial(0xff0000, 0.2);
      const playBtn = new THREE.Mesh(buttonGeo, buttonMat);
      addWhiteOutline(playBtn, 1.12);
      playGroup.add(playBtn);

      const triGeo = new THREE.ConeGeometry(0.24, 0.32, 3);
      const triMat = createStickerMaterial(0xffffff);
      const tri = new THREE.Mesh(triGeo, triMat);
      tri.rotation.z = -Math.PI / 2;
      tri.position.z = 0.14;
      playGroup.add(tri);

      stickerRoot.add(playGroup);
      interactiveObjects.push(playGroup);

      // 2. Pirâmide Financeira de 3 Degraus
      const pyramidGroup = new THREE.Group();
      pyramidGroup.name = 'piramide-financeira';
      pyramidGroup.position.set(1.25, -0.4, 0.5);

      const step1Geo = new THREE.BoxGeometry(1.4, 0.32, 0.55);
      const step1Mat = createStickerMaterial(0x00b894, 0.3);
      const step1 = new THREE.Mesh(step1Geo, step1Mat);
      step1.position.y = -0.45;
      addWhiteOutline(step1, 1.08);

      const step2Geo = new THREE.BoxGeometry(1.0, 0.42, 0.55);
      const step2Mat = createStickerMaterial(0xfdcb6e, 0.2);
      const step2 = new THREE.Mesh(step2Geo, step2Mat);
      step2.position.y = -0.08;
      addWhiteOutline(step2, 1.08);

      const step3Geo = new THREE.BoxGeometry(0.55, 0.52, 0.55);
      const step3Mat = createStickerMaterial(0xd63031, 0.2);
      const step3 = new THREE.Mesh(step3Geo, step3Mat);
      step3.position.y = 0.38;
      addWhiteOutline(step3, 1.08);

      pyramidGroup.add(step1, step2, step3);
      stickerRoot.add(pyramidGroup);
      interactiveObjects.push(pyramidGroup);
    }

    // =========================================================================
    // CENÁRIO 8: Gov.br / Malha Fina e-CAC Oficial
    // =========================================================================
    else if (isCase8) {
      // 1. Selo Ouro Gov.br
      const govGroup = new THREE.Group();
      govGroup.name = 'govbr-selo-ouro';
      govGroup.position.set(-0.25, 0.18, 0.6);

      const medalGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.14, 32);
      const medalMat = createStickerMaterial(0xf1c40f, 0.15, 0.6);
      const medal = new THREE.Mesh(medalGeo, medalMat);
      medal.rotation.x = Math.PI / 2;
      addWhiteOutline(medal, 1.1);
      govGroup.add(medal);

      stickerRoot.add(govGroup);
      interactiveObjects.push(govGroup);

      // 2. Pasta Fiscal Oficial de Auditoria IRPF
      const folderGroup = new THREE.Group();
      folderGroup.name = 'caixa-postal-ecac';
      folderGroup.position.set(1.25, -0.1, 0.5);

      const folderGeo = new THREE.BoxGeometry(1.35, 1.7, 0.18);
      const folderMat = createStickerMaterial(0x1351b4, 0.3); // Azul Gov.br
      const folder = new THREE.Mesh(folderGeo, folderMat);
      addWhiteOutline(folder, 1.08);
      folderGroup.add(folder);

      stickerRoot.add(folderGroup);
      interactiveObjects.push(folderGroup);
    }

    // =========================================================================
    // CENÁRIO 9: Golpe da Mão Fantasma / Suporte Remoto AnyDesk
    // =========================================================================
    else if (isCase9) {
      // 1. Smartphone da Vítima
      const victimPhoneGroup = new THREE.Group();
      victimPhoneGroup.name = 'celular-remoto';
      victimPhoneGroup.position.set(-0.2, -0.4, 0.5);

      const phoneGeo = new THREE.BoxGeometry(1.2, 1.85, 0.14);
      const phoneMat = createStickerMaterial(0x2d3436, 0.2);
      const phone = new THREE.Mesh(phoneGeo, phoneMat);
      addWhiteOutline(phone, 1.08);
      victimPhoneGroup.add(phone);

      stickerRoot.add(victimPhoneGroup);
      interactiveObjects.push(victimPhoneGroup);

      // 2. Mão Cibernética ("Mão Fantasma") com Cordas de Marionete
      const ghostHandGroup = new THREE.Group();
      ghostHandGroup.name = 'mao-fantasma-suporte';
      ghostHandGroup.position.set(1.15, 0.85, 0.85);

      const palmGeo = new THREE.SphereGeometry(0.46, 24, 24);
      const palmMat = new THREE.MeshStandardMaterial({
        color: 0x9b59b6,
        roughness: 0.15,
        wireframe: true,
      });
      const palm = new THREE.Mesh(palmGeo, palmMat);
      ghostHandGroup.add(palm);

      for (let i = 0; i < 4; i++) {
        const fingerGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.55, 12);
        const finger = new THREE.Mesh(fingerGeo, palmMat);
        finger.position.set(-0.32 + i * 0.22, -0.42, 0);
        ghostHandGroup.add(finger);
      }

      // Cordas de Marionete
      const stringGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.4, 6);
      const stringMat = createStickerMaterial(0x9b59b6);
      const string1 = new THREE.Mesh(stringGeo, stringMat);
      string1.position.set(0, 1.15, 0);
      ghostHandGroup.add(string1);

      stickerRoot.add(ghostHandGroup);
      interactiveObjects.push(ghostHandGroup);
    }

    // =========================================================================
    // CENÁRIO GENÉRICO / DINÂMICO
    // =========================================================================
    else {
      const shieldGroup = new THREE.Group();
      shieldGroup.name = 'escudo-geral';
      shieldGroup.position.set(0.6, 0, 0.5);

      const shieldGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.2, 6);
      const shieldMat = createStickerMaterial(0x0071e3, 0.2);
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.rotation.x = Math.PI / 2;
      addWhiteOutline(shield, 1.1);
      shieldGroup.add(shield);

      stickerRoot.add(shieldGroup);
      interactiveObjects.push(shieldGroup);
    }

    // Partículas de Estrelas Douradas no Veredito Correto
    let particlesGroup: THREE.Group | null = null;
    if (verdictResult === 'correct') {
      particlesGroup = new THREE.Group();
      const starGeo = new THREE.DodecahedronGeometry(0.08);
      const starMat = createStickerMaterial(0xf1c40f, 0.2, 0.7);
      for (let i = 0; i < 24; i++) {
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(
          (Math.random() - 0.5) * 4.4,
          (Math.random() - 0.5) * 3.2,
          0.8 + Math.random() * 0.8
        );
        particlesGroup.add(star);
      }
      scene.add(particlesGroup);
    }

    // 6. Controles de Parallax Tátil e Raycasting
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      mouse.x = normX;
      mouse.y = normY;

      targetRotY = normX * 0.32;
      targetRotX = -normY * 0.22;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let topParent = intersects[0].object;
        while (topParent.parent && topParent.parent !== stickerRoot) {
          topParent = topParent.parent;
        }
        setHoveredProp(topParent.name || 'Pista Pericial');
        canvas.style.cursor = 'pointer';
      } else {
        setHoveredProp(null);
        canvas.style.cursor = 'default';
      }
    };

    const handlePointerDown = () => {
      setIsInteracting(true);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let topParent = intersects[0].object;
        while (topParent.parent && topParent.parent !== stickerRoot) {
          topParent = topParent.parent;
        }

        // Efeito Squash & Stretch
        const originalScale = topParent.scale.clone();
        topParent.scale.set(1.18, 0.88, 1.18);
        setTimeout(() => {
          topParent.scale.copy(originalScale);
        }, 180);

        if (onPropClick && topParent.name) {
          onPropClick(topParent.name);
        }
      }
    };

    const handlePointerUp = () => {
      setIsInteracting(false);
    };

    const handleMouseLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
      setHoveredProp(null);
      setIsInteracting(false);
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
    canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
    canvas.addEventListener('touchend', handlePointerUp);

    // 7. Loop de Animação 3D com Física de Bouncy Springs e Expressão do Boneco
    let animationFrameId: number;
    const startTime = performance.now();
    let lastBlinkTime = 0;
    let isBlinking = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Piscar de olhos cômico a cada 3.5 a 5 segundos
      if (now - lastBlinkTime > 3800 && !isBlinking && !verdictResult) {
        isBlinking = true;
        stickmanInstance.updateFace('pondering', true);
        stickmanInstance.faceTexture.needsUpdate = true;
        setTimeout(() => {
          isBlinking = false;
          stickmanInstance.updateFace('pondering', false);
          stickmanInstance.faceTexture.needsUpdate = true;
          lastBlinkTime = now;
        }, 160);
      }

      // Flutuação suave (Idle Bobbing) do Sticker 3D
      const floatY = Math.sin(elapsed * 2.2) * 0.1;
      stickerRoot.position.y = floatY;

      // Sutil movimento inquisitivo na mão do queixo (dedo dando leves batidinhas no queixo)
      if (stickmanInstance.chinHandGroup) {
        stickmanInstance.chinHandGroup.rotation.z = Math.sin(elapsed * 3.5) * 0.08;
      }

      // Respiração leve do Boneco Palito
      stickmanInstance.headMesh.position.y = 0.76 + Math.sin(elapsed * 2.5) * 0.02;

      // Interpolação suave de rotação (Lerp)
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      stickerRoot.rotation.x = currentRotX;
      stickerRoot.rotation.y = currentRotY;

      // Efeitos de comemoração ou alarme conforme o resultado
      if (verdictResult === 'correct') {
        stickerRoot.rotation.z = Math.sin(elapsed * 4) * 0.05;
        stickmanInstance.group.position.y = 0.2 + Math.abs(Math.sin(elapsed * 6)) * 0.15; // Pulinhos de vitória
        if (particlesGroup) {
          particlesGroup.rotation.y += 0.02;
        }
      } else if (verdictResult === 'incorrect') {
        stickerRoot.rotation.z = Math.sin(elapsed * 12) * 0.07; // Tremor de erro
        stickmanInstance.group.position.x = -1.45 + Math.sin(elapsed * 20) * 0.03; // Calafrio
      } else {
        stickerRoot.rotation.z = Math.sin(elapsed * 1.5) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Observer de Redimensionamento
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        if (newWidth > 0) {
          camera.aspect = newWidth / height;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, height);
        }
      }
    });

    resizeObserver.observe(container);

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchend', handlePointerUp);
      renderer.dispose();
    };
  }, [caseId, scenarioType, verdictResult, isCase1, isCase2, isCase3, isCase4, isCase5, isCase6, isCase7, isCase8, isCase9, onPropClick]);

  return (
    <div
      ref={mountRef}
      className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0e0f14] via-[#14161f] to-[#181a26] border border-white/[0.08] shadow-2xl p-4 sm:p-5 select-none transition-all"
    >
      {/* Grade Cibernética Suave */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header do Sticker 3D */}
      <div className="relative z-10 flex items-center justify-between pb-3 mb-2 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#bf5af2] animate-pulse" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#bf5af2]" />
            Cenário Holográfico 3D • Boneco Palito & Sticker
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {hoveredProp ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-semibold text-[#00ff88] bg-[#00ff88]/10 px-2.5 py-0.5 rounded-full border border-[#00ff88]/20 flex items-center gap-1"
            >
              <Search className="w-3 h-3" /> Inspecionar: {hoveredProp}
            </motion.span>
          ) : (
            <span className="text-[10px] text-[#86868b] flex items-center gap-1">
              <MousePointer className="w-3 h-3 text-[#2997ff]" /> Incline & Toque nos Elementos
            </span>
          )}
        </div>
      </div>

      {/* Canvas Three.js do Sticker 3D */}
      <div className="relative w-full h-[340px] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className={`w-full h-full block transition-transform duration-150 ${
            isInteracting ? 'scale-[0.98]' : 'hover:scale-[1.005]'
          }`}
        />

        {/* Notificação Flutuante de Veredito no Sticker */}
        {verdictResult === 'correct' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-4 right-4 bg-[#30d158]/20 border border-[#30d158]/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-white font-bold shadow-lg shadow-green-500/20"
          >
            <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
            <span>Veredito Confirmado!</span>
          </motion.div>
        )}

        {verdictResult === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-4 right-4 bg-[#ff3b30]/20 border border-[#ff3b30]/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-white font-bold shadow-lg shadow-red-500/20"
          >
            <AlertTriangle className="w-4 h-4 text-[#ff453a]" />
            <span>Alerta de Violação!</span>
          </motion.div>
        )}
      </div>

      {/* Rodapé Informativo */}
      <div className="relative z-10 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#86868b]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#bf5af2]" />
          <span>Física de Spring • Contorno Ink Cel-Shaded • Réplica Fiel</span>
        </div>
        <span className="text-[10px] text-white/60">
          Gire o mouse ou toque para periciar o cenário
        </span>
      </div>
    </div>
  );
};
