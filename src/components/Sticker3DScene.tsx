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
    scene.background = null; // Fundo transparente para o efeito Sticker flutuante

    // 2. Câmera Perspectiva Estúdio Isométrica
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderizador WebGL com Antialias e Tone Mapping suave
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

    // 4. Iluminação Estúdio para Efeito 3D Sticker Glossy (Candy/Clay Shading)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Luz Direcional Principal (Key Light com brilho quente)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Luz de Preenchimento Azulada Suave (Fill Light)
    const fillLight = new THREE.DirectionalLight(0x70a5ff, 1.2);
    fillLight.position.set(-5, 3, 4);
    scene.add(fillLight);

    // Luz de Borda / Rim Light para destacar o contorno do Sticker
    const rimLight = new THREE.DirectionalLight(0xfff0d0, 1.5);
    rimLight.position.set(0, -4, -4);
    scene.add(rimLight);

    // 5. Grupo Raiz do Sticker 3D (receberá rotação e animações de spring)
    const stickerRoot = new THREE.Group();
    scene.add(stickerRoot);

    // Sombra Projetada Suave em forma de pílula sob o Sticker
    const shadowGeo = new THREE.PlaneGeometry(4.2, 1.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -2.1;
    scene.add(shadowMesh);

    // Placa Traseira Branca de Borda Die-Cut do Sticker (Contorno Físico de Vinil)
    const backingGeo = new THREE.BoxGeometry(4.8, 3.4, 0.16);
    const backingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.05,
    });
    const stickerBacking = new THREE.Mesh(backingGeo, backingMat);
    stickerBacking.position.z = -0.15;
    stickerBacking.castShadow = true;
    stickerRoot.add(stickerBacking);

    // Borda Interna Suave do Sticker
    const innerBorderGeo = new THREE.BoxGeometry(4.65, 3.25, 0.18);
    const innerBorderMat = new THREE.MeshStandardMaterial({
      color: 0xf5f7fb,
      roughness: 0.35,
    });
    const innerBorder = new THREE.Mesh(innerBorderGeo, innerBorderMat);
    innerBorder.position.z = -0.12;
    stickerRoot.add(innerBorder);

    // Armazenamento de Objetos Interativos para Raycaster
    const interactiveObjects: THREE.Object3D[] = [];

    // Helper: Material Glossy Estilo Clay/Sticker
    const createStickerMaterial = (color: number, roughness = 0.25, metalness = 0.05) => {
      return new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
      });
    };

    // Helper: Borda Branca Die-Cut em torno de uma geometria
    const addWhiteOutline = (mesh: THREE.Mesh, scaleMultiplier = 1.1) => {
      const outlineMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.BackSide,
      });
      const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMat);
      outlineMesh.scale.multiplyScalar(scaleMultiplier);
      mesh.add(outlineMesh);
    };

    // =========================================================================
    // CENÁRIO 1: WhatsApp Filho / Parente com Celular Quebrado
    // =========================================================================
    if (isCase1) {
      // 1. Avatar 3D da Filha com Curativo/Band-aid
      const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
      const headMat = createStickerMaterial(0xffdbac, 0.3);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(-1.3, 0.4, 0.2);
      head.castShadow = true;
      addWhiteOutline(head, 1.08);
      stickerRoot.add(head);

      // Cabelo Estilizado
      const hairGeo = new THREE.SphereGeometry(0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const hairMat = createStickerMaterial(0x5c3826, 0.4);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(-1.3, 0.55, 0.2);
      stickerRoot.add(hair);

      // Band-aid na bochecha (simbolizando o celular quebrado/acidente)
      const plasterGeo = new THREE.BoxGeometry(0.35, 0.12, 0.05);
      const plasterMat = createStickerMaterial(0xffb59b);
      const plaster = new THREE.Mesh(plasterGeo, plasterMat);
      plaster.position.set(-0.95, 0.35, 0.85);
      plaster.rotation.z = 0.4;
      stickerRoot.add(plaster);

      // Olhos Expressivos Tristes/Preocupados
      const eyeMat = createStickerMaterial(0x222222, 0.1);
      const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-1.1, 0.45, 0.85);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(-1.5, 0.45, 0.85);
      stickerRoot.add(eyeL, eyeR);

      // 2. Celular Trincado 3D (Interativo)
      const phoneGroup = new THREE.Group();
      phoneGroup.name = 'celular-quebrado';
      phoneGroup.position.set(0.3, -0.1, 0.5);

      const phoneBodyGeo = new THREE.BoxGeometry(1.2, 1.9, 0.15);
      const phoneBodyMat = createStickerMaterial(0x242426, 0.2);
      const phoneBody = new THREE.Mesh(phoneBodyGeo, phoneBodyMat);
      addWhiteOutline(phoneBody, 1.08);
      phoneGroup.add(phoneBody);

      // Tela com trincos estilizados
      const screenGeo = new THREE.BoxGeometry(1.05, 1.7, 0.05);
      const screenMat = createStickerMaterial(0x0e3a1f, 0.15); // Verde WhatsApp
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.08;
      phoneGroup.add(screen);

      // Rachadura na tela
      const crackGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.9, 8);
      const crackMat = createStickerMaterial(0xffffff);
      const crack1 = new THREE.Mesh(crackGeo, crackMat);
      crack1.rotation.z = 0.7;
      crack1.position.set(0.1, 0.2, 0.12);
      const crack2 = new THREE.Mesh(crackGeo, crackMat);
      crack2.rotation.z = -0.5;
      crack2.position.set(-0.15, -0.1, 0.12);
      phoneGroup.add(crack1, crack2);

      stickerRoot.add(phoneGroup);
      interactiveObjects.push(phoneGroup);

      // 3. Balão 3D de Pix Urgente do WhatsApp
      const bubbleGroup = new THREE.Group();
      bubbleGroup.name = 'whatsapp-pix';
      bubbleGroup.position.set(1.4, 0.8, 0.7);

      const bubbleGeo = new THREE.BoxGeometry(1.6, 0.9, 0.15);
      const bubbleMat = createStickerMaterial(0x25d366, 0.25);
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      addWhiteOutline(bubble, 1.1);
      bubbleGroup.add(bubble);

      // Moeda Dourada Flutuante R$ 480
      const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 32);
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
      const beltGeo = new THREE.BoxGeometry(3.6, 0.25, 1.6);
      const beltMat = createStickerMaterial(0x3a3d45, 0.5);
      const belt = new THREE.Mesh(beltGeo, beltMat);
      belt.position.set(0, -1.1, 0.3);
      stickerRoot.add(belt);

      // 2. Caixa de Encomenda 3D (Interativa)
      const packageGroup = new THREE.Group();
      packageGroup.name = 'pacote-correios';
      packageGroup.position.set(-0.7, -0.4, 0.5);

      const boxGeo = new THREE.BoxGeometry(1.3, 1.1, 1.1);
      const boxMat = createStickerMaterial(0xdfa05d, 0.4);
      const box = new THREE.Mesh(boxGeo, boxMat);
      addWhiteOutline(box, 1.08);
      packageGroup.add(box);

      // Fita Adesiva
      const tapeGeo = new THREE.BoxGeometry(1.35, 0.25, 1.15);
      const tapeMat = createStickerMaterial(0xb57c3e, 0.3);
      const tape = new THREE.Mesh(tapeGeo, tapeMat);
      packageGroup.add(tape);

      stickerRoot.add(packageGroup);
      interactiveObjects.push(packageGroup);

      // 3. Cancela Alfandegária Listrada Vermelha e Branca
      const barrierGroup = new THREE.Group();
      barrierGroup.position.set(0.8, -0.4, 0.7);

      const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.6, 16);
      const postMat = createStickerMaterial(0x444444);
      const post = new THREE.Mesh(postGeo, postMat);
      barrierGroup.add(post);

      const barGeo = new THREE.BoxGeometry(2.0, 0.18, 0.12);
      const barMat = createStickerMaterial(0xff3b30, 0.3);
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-0.8, 0.4, 0);
      bar.rotation.z = -0.25;
      addWhiteOutline(bar, 1.15);
      barrierGroup.add(bar);

      // 4. Carimbo 3D de "TAXA PENDENTE"
      const stampGroup = new THREE.Group();
      stampGroup.name = 'taxa-alfandega';
      stampGroup.position.set(1.1, 0.9, 0.8);

      const stampPlateGeo = new THREE.BoxGeometry(1.6, 0.75, 0.15);
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
      const counterGeo = new THREE.BoxGeometry(3.8, 0.35, 1.5);
      const counterMat = createStickerMaterial(0x8a532b, 0.4);
      const counter = new THREE.Mesh(counterGeo, counterMat);
      counter.position.set(0, -1.0, 0.2);
      stickerRoot.add(counter);

      // 2. Xícara Fumegante de Café
      const cupGeo = new THREE.CylinderGeometry(0.45, 0.35, 0.75, 24);
      const cupMat = createStickerMaterial(0xffffff, 0.2);
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(-1.2, -0.4, 0.5);
      addWhiteOutline(cup, 1.1);
      stickerRoot.add(cup);

      // 3. Máquina de Cartão POS 3D (Interativa)
      const terminalGroup = new THREE.Group();
      terminalGroup.name = 'terminal-padaria';
      terminalGroup.position.set(0.2, -0.35, 0.6);

      const posGeo = new THREE.BoxGeometry(1.1, 1.4, 0.4);
      const posMat = createStickerMaterial(0x2d3436, 0.3);
      const pos = new THREE.Mesh(posGeo, posMat);
      pos.rotation.x = 0.35;
      addWhiteOutline(pos, 1.08);
      terminalGroup.add(pos);

      // Tela verde da maquininha
      const screenGeo = new THREE.BoxGeometry(0.8, 0.5, 0.05);
      const screenMat = createStickerMaterial(0x00b894, 0.2);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(0, 0.3, 0.25);
      screen.rotation.x = 0.35;
      terminalGroup.add(screen);

      stickerRoot.add(terminalGroup);
      interactiveObjects.push(terminalGroup);

      // 4. Cartão com Ondas NFC Verdes Legítimas
      const cardGroup = new THREE.Group();
      cardGroup.name = 'cartao-nfc';
      cardGroup.position.set(1.3, 0.5, 0.8);

      const cardGeo = new THREE.BoxGeometry(1.2, 0.75, 0.05);
      const cardMat = createStickerMaterial(0x0984e3, 0.2);
      const card = new THREE.Mesh(cardGeo, cardMat);
      card.rotation.z = 0.25;
      addWhiteOutline(card, 1.12);
      cardGroup.add(card);

      // Anéis de Sinal NFC
      const ringGeo = new THREE.TorusGeometry(0.5, 0.03, 8, 24, Math.PI);
      const ringMat = createStickerMaterial(0x00ff88, 0.2);
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.position.set(0.6, 0.2, 0.1);
      cardGroup.add(ring1);

      stickerRoot.add(cardGroup);
      interactiveObjects.push(cardGroup);
    }

    // =========================================================================
    // CENÁRIO 4: Falsa Central Telefônica 0800 & Conta Cofre
    // =========================================================================
    else if (isCase4) {
      // 1. Aparelho Telefônico Retrô em Chamada Tensa
      const phoneGroup = new THREE.Group();
      phoneGroup.name = 'telefone-0800';
      phoneGroup.position.set(-1.1, -0.2, 0.6);

      const handsetGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16);
      const handsetMat = createStickerMaterial(0xd63031, 0.25);
      const handset = new THREE.Mesh(handsetGeo, handsetMat);
      handset.rotation.z = 0.5;
      addWhiteOutline(handset, 1.1);
      phoneGroup.add(handset);

      stickerRoot.add(phoneGroup);
      interactiveObjects.push(phoneGroup);

      // 2. Holograma BINA 0800 Flutuante (Spoofing)
      const binaGroup = new THREE.Group();
      binaGroup.name = 'bina-spoofing';
      binaGroup.position.set(-0.2, 0.9, 0.8);

      const binaPlateGeo = new THREE.BoxGeometry(1.8, 0.65, 0.1);
      const binaPlateMat = createStickerMaterial(0x0984e3, 0.2);
      const binaPlate = new THREE.Mesh(binaPlateGeo, binaPlateMat);
      addWhiteOutline(binaPlate, 1.12);
      binaGroup.add(binaPlate);

      stickerRoot.add(binaGroup);
      interactiveObjects.push(binaGroup);

      // 3. Cofre Bancário Giratório com Engrenagens ("Conta Cofre de Proteção")
      const vaultGroup = new THREE.Group();
      vaultGroup.name = 'cofre-bancario';
      vaultGroup.position.set(1.3, -0.1, 0.5);

      const vaultBodyGeo = new THREE.BoxGeometry(1.4, 1.5, 0.9);
      const vaultBodyMat = createStickerMaterial(0x636e72, 0.3, 0.4);
      const vaultBody = new THREE.Mesh(vaultBodyGeo, vaultBodyMat);
      addWhiteOutline(vaultBody, 1.08);
      vaultGroup.add(vaultBody);

      // Volante do Cofre
      const wheelGeo = new THREE.TorusGeometry(0.35, 0.08, 12, 24);
      const wheelMat = createStickerMaterial(0xfdcb6e, 0.15, 0.8);
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.position.z = 0.55;
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
      fryerGroup.position.set(-0.8, -0.2, 0.6);

      const fryerBodyGeo = new THREE.CylinderGeometry(0.7, 0.8, 1.4, 32);
      const fryerBodyMat = createStickerMaterial(0x1e272e, 0.2);
      const fryerBody = new THREE.Mesh(fryerBodyGeo, fryerBodyMat);
      addWhiteOutline(fryerBody, 1.08);
      fryerGroup.add(fryerBody);

      // Puxador da gaveta
      const handleGeo = new THREE.BoxGeometry(0.4, 0.15, 0.35);
      const handleMat = createStickerMaterial(0xc7ecee, 0.1, 0.5);
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(0, -0.1, 0.85);
      fryerGroup.add(handle);

      stickerRoot.add(fryerGroup);
      interactiveObjects.push(fryerGroup);

      // 2. Tag de Promoção Explosiva "-85% OFF"
      const promoGroup = new THREE.Group();
      promoGroup.name = 'promocao-fryer';
      promoGroup.position.set(1.0, 0.7, 0.8);

      const tagGeo = new THREE.BoxGeometry(1.6, 0.8, 0.1);
      const tagMat = createStickerMaterial(0xff3b30, 0.2);
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.rotation.z = -0.15;
      addWhiteOutline(tag, 1.12);
      promoGroup.add(tag);

      // 3. Cartão com Bloqueio [X] forçando Pix
      const blockedGroup = new THREE.Group();
      blockedGroup.position.set(1.1, -0.6, 0.6);

      const cardGeo = new THREE.BoxGeometry(1.2, 0.7, 0.05);
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
      pcGroup.position.set(-1.0, 0.1, 0.4);

      const screenGeo = new THREE.BoxGeometry(1.8, 1.2, 0.1);
      const screenMat = createStickerMaterial(0x0984e3, 0.3);
      const pcScreen = new THREE.Mesh(screenGeo, screenMat);
      addWhiteOutline(pcScreen, 1.08);
      pcGroup.add(pcScreen);

      const standGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.6, 16);
      const standMat = createStickerMaterial(0x636e72);
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.set(0, -0.8, 0);
      pcGroup.add(stand);

      stickerRoot.add(pcGroup);
      interactiveObjects.push(pcGroup);

      // 2. Feixe de Sincronização de Dados
      const beamGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 8);
      const beamMat = createStickerMaterial(0x00d2d3, 0.1);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(0.1, 0.1, 0.5);
      stickerRoot.add(beam);

      // 3. Escudo Protetor 3D com Token [ 839-201 ]
      const shieldGroup = new THREE.Group();
      shieldGroup.name = 'token-2fa';
      shieldGroup.position.set(1.2, 0.2, 0.7);

      const shieldGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 6);
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
      playGroup.position.set(-1.2, 0.4, 0.6);

      const buttonGeo = new THREE.BoxGeometry(1.3, 0.9, 0.18);
      const buttonMat = createStickerMaterial(0xff0000, 0.2);
      const playBtn = new THREE.Mesh(buttonGeo, buttonMat);
      addWhiteOutline(playBtn, 1.12);
      playGroup.add(playBtn);

      // Triângulo branco do Play
      const triGeo = new THREE.ConeGeometry(0.25, 0.35, 3);
      const triMat = createStickerMaterial(0xffffff);
      const tri = new THREE.Mesh(triGeo, triMat);
      tri.rotation.z = -Math.PI / 2;
      tri.position.z = 0.15;
      playGroup.add(tri);

      stickerRoot.add(playGroup);
      interactiveObjects.push(playGroup);

      // 2. Pirâmide de 3 Degraus (Isca R$ 20 -> Trava R$ 100 -> Ilusão R$ 500)
      const pyramidGroup = new THREE.Group();
      pyramidGroup.name = 'piramide-financeira';
      pyramidGroup.position.set(0.9, -0.4, 0.5);

      // Degrau 1: Liberado (Verde)
      const step1Geo = new THREE.BoxGeometry(1.6, 0.35, 0.6);
      const step1Mat = createStickerMaterial(0x00b894, 0.3);
      const step1 = new THREE.Mesh(step1Geo, step1Mat);
      step1.position.y = -0.5;
      addWhiteOutline(step1, 1.08);

      // Degrau 2: Cadeado VIP
      const step2Geo = new THREE.BoxGeometry(1.1, 0.45, 0.6);
      const step2Mat = createStickerMaterial(0xfdcb6e, 0.2);
      const step2 = new THREE.Mesh(step2Geo, step2Mat);
      step2.position.y = -0.1;
      addWhiteOutline(step2, 1.08);

      // Degrau 3: Miragem
      const step3Geo = new THREE.BoxGeometry(0.6, 0.55, 0.6);
      const step3Mat = createStickerMaterial(0xd63031, 0.2);
      const step3 = new THREE.Mesh(step3Geo, step3Mat);
      step3.position.y = 0.4;
      addWhiteOutline(step3, 1.08);

      pyramidGroup.add(step1, step2, step3);
      stickerRoot.add(pyramidGroup);
      interactiveObjects.push(pyramidGroup);
    }

    // =========================================================================
    // CENÁRIO 8: Gov.br / Malha Fina e-CAC Oficial
    // =========================================================================
    else if (isCase8) {
      // 1. Totem Institucional Gov.br com Selo Ouro
      const govGroup = new THREE.Group();
      govGroup.name = 'govbr-selo-ouro';
      govGroup.position.set(-0.9, 0.2, 0.6);

      const medalGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.15, 32);
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
      folderGroup.position.set(1.1, -0.1, 0.5);

      const folderGeo = new THREE.BoxGeometry(1.4, 1.8, 0.2);
      const folderMat = createStickerMaterial(0x1351b4, 0.3); // Azul Gov.br
      const folder = new THREE.Mesh(folderGeo, folderMat);
      addWhiteOutline(folder, 1.08);
      folderGroup.add(folder);

      // Selo de 30 Dias de Prazo Legal
      const badgeGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24);
      const badgeMat = createStickerMaterial(0x00b894, 0.2);
      const badge = new THREE.Mesh(badgeGeo, badgeMat);
      badge.rotation.x = Math.PI / 2;
      badge.position.set(0.4, 0.5, 0.15);
      folderGroup.add(badge);

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

      const phoneGeo = new THREE.BoxGeometry(1.3, 2.0, 0.15);
      const phoneMat = createStickerMaterial(0x2d3436, 0.2);
      const phone = new THREE.Mesh(phoneGeo, phoneMat);
      addWhiteOutline(phone, 1.08);
      victimPhoneGroup.add(phone);

      stickerRoot.add(victimPhoneGroup);
      interactiveObjects.push(victimPhoneGroup);

      // 2. Mão Cibernética Translúcida ("Mão Fantasma") com Cordas de Marionete
      const ghostHandGroup = new THREE.Group();
      ghostHandGroup.name = 'mao-fantasma-suporte';
      ghostHandGroup.position.set(0.6, 0.9, 0.9);

      // Palma da mão cibernética
      const palmGeo = new THREE.SphereGeometry(0.5, 24, 24);
      const palmMat = new THREE.MeshStandardMaterial({
        color: 0x9b59b6,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85,
        wireframe: true,
      });
      const palm = new THREE.Mesh(palmGeo, palmMat);
      ghostHandGroup.add(palm);

      // Dedos cibernéticos apontando para a tela
      for (let i = 0; i < 4; i++) {
        const fingerGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12);
        const finger = new THREE.Mesh(fingerGeo, palmMat);
        finger.position.set(-0.35 + i * 0.25, -0.45, 0);
        ghostHandGroup.add(finger);
      }

      // Cordas de Marionete descendo do topo
      const stringGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.5, 6);
      const stringMat = createStickerMaterial(0x9b59b6);
      const string1 = new THREE.Mesh(stringGeo, stringMat);
      string1.position.set(0, 1.2, 0);
      ghostHandGroup.add(string1);

      stickerRoot.add(ghostHandGroup);
      interactiveObjects.push(ghostHandGroup);
    }

    // =========================================================================
    // CENÁRIO GENÉRICO / DINÂMICO DE SEGURANÇA
    // =========================================================================
    else {
      const shieldGroup = new THREE.Group();
      shieldGroup.name = 'escudo-geral';
      shieldGroup.position.set(0, 0, 0.5);

      const shieldGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 6);
      const shieldMat = createStickerMaterial(0x0071e3, 0.2);
      const shield = new THREE.Mesh(shieldGeo, shieldMat);
      shield.rotation.x = Math.PI / 2;
      addWhiteOutline(shield, 1.1);
      shieldGroup.add(shield);

      stickerRoot.add(shieldGroup);
      interactiveObjects.push(shieldGroup);
    }

    // =========================================================================
    // EFEITO DE PARTICULAS E REAÇÕES PERICIAIS AO VEREDITO
    // =========================================================================
    let particlesGroup: THREE.Group | null = null;
    if (verdictResult === 'correct') {
      particlesGroup = new THREE.Group();
      const starGeo = new THREE.DodecahedronGeometry(0.08);
      const starMat = createStickerMaterial(0xf1c40f, 0.2, 0.7);
      for (let i = 0; i < 24; i++) {
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          0.8 + Math.random() * 0.8
        );
        particlesGroup.add(star);
      }
      scene.add(particlesGroup);
    }

    // 6. Controles de Parallax Tátil e Raycasting Interativo
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

      // Inclinação Parallax 3D Suave (Sticker Tilt)
      targetRotY = normX * 0.35;
      targetRotX = -normY * 0.25;

      // Raycast para verificar hover nos objetos periciais
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let topParent = intersects[0].object;
        while (topParent.parent && topParent.parent !== stickerRoot) {
          topParent = topParent.parent;
        }
        setHoveredProp(topParent.name || 'Pista');
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

        // Animação Squash & Stretch de impacto no objeto clicado
        const originalScale = topParent.scale.clone();
        topParent.scale.set(1.2, 0.85, 1.2);
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

    // 7. Loop de Animação 3D com Física de Bouncy Springs
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Flutuação suave (Idle Bobbing) do Sticker 3D
      const floatY = Math.sin(elapsed * 2.2) * 0.12;
      stickerRoot.position.y = floatY;

      // Sombra projetada reage à distância de flutuação
      shadowMesh.scale.setScalar(1 - floatY * 0.8);
      shadowMat.opacity = 0.28 - floatY * 0.1;

      // Interpolação suave de rotação (Lerp)
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      stickerRoot.rotation.x = currentRotX;
      stickerRoot.rotation.y = currentRotY;

      // Animação de comemoração ou alarme conforme o resultado
      if (verdictResult === 'correct') {
        stickerRoot.rotation.z = Math.sin(elapsed * 4) * 0.06;
        if (particlesGroup) {
          particlesGroup.rotation.y += 0.02;
        }
      } else if (verdictResult === 'incorrect') {
        stickerRoot.rotation.z = Math.sin(elapsed * 12) * 0.08; // Vibração de erro
      } else {
        stickerRoot.rotation.z = Math.sin(elapsed * 1.5) * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Observer de Redimensionamento Responsivo
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
            Cenário Holográfico 3D • Sticker Animado
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {hoveredProp ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-semibold text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded-full border border-[#00ff88]/20 flex items-center gap-1"
            >
              <Search className="w-3 h-3" /> Toque para periciar: {hoveredProp}
            </motion.span>
          ) : (
            <span className="text-[10px] text-[#86868b] flex items-center gap-1">
              <MousePointer className="w-3 h-3 text-[#2997ff]" /> Incline & Toque
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
            <span>Sticker Desbloqueado!</span>
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
          <span>Física de Spring • Borda Die-Cut de Vinil • Shading Suave</span>
        </div>
        <span className="text-[10px] text-white/60">
          Gire o mouse ou toque para inspecionar
        </span>
      </div>
    </div>
  );
};
