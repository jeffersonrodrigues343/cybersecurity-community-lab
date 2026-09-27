import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, ZoomIn } from 'lucide-react';

interface DetectiveDiorama3DProps {
  caseId?: string;
  scenarioType: 'whatsapp' | 'correios' | 'banco' | 'loja' | 'tarefas' | 'remoto' | 'oficial' | 'geral';
  isScam?: boolean;
  verdictResult?: 'correct' | 'incorrect' | null;
  onPropClick?: (propType: string) => void;
  interactive?: boolean;
}

export const DetectiveDiorama3D: React.FC<DetectiveDiorama3DProps> = ({
  caseId = '',
  scenarioType,
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
    scene.background = new THREE.Color(0x0a0a0d);
    scene.fog = new THREE.FogExp2(0x0a0a0d, 0.045);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.4, 6.2);
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

    // --- 2. ILUMINAÇÃO ESTILIZADA DE CINEMA CYBER ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimBlue = new THREE.PointLight(0x2997ff, 3.5, 14);
    rimBlue.position.set(-4, 3, -2);
    scene.add(rimBlue);

    const rimWarm = new THREE.PointLight(0xff9f0a, 2.5, 12);
    rimWarm.position.set(4, 3, -2);
    scene.add(rimWarm);

    // --- 3. PLATAFORMA BASE DO DIORAMA ---
    const baseGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.35, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x141418,
      roughness: 0.4,
      metalness: 0.5,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.175;
    baseMesh.receiveShadow = true;
    scene.add(baseMesh);

    // Anel LED de status pericial
    const ringGeo = new THREE.TorusGeometry(3.25, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: verdictResult === 'correct' ? 0x30d158 : verdictResult === 'incorrect' ? 0xff3b30 : 0x0071e3,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    // Grade holográfica de chão
    const gridHelper = new THREE.GridHelper(5.5, 12, 0x0071e3, 0x1e222b);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Objetos interativos para clique / raycast
    const interactiveObjects: THREE.Object3D[] = [];

    // Referências para animações dinâmicas personalizadas por caso
    const animState: {
      update: (time: number) => void;
      headGroup?: THREE.Group;
    } = {
      update: () => {},
    };

    // Helper: Criação de um boneco estilizado
    const createCharacter = (options: {
      coatColor: number;
      pantsColor: number;
      skinColor?: number;
      hasVisor?: boolean;
      visorColor?: number;
      hasCap?: boolean;
      capColor?: number;
      scale?: number;
    }) => {
      const charGroup = new THREE.Group();
      const scale = options.scale || 1;
      charGroup.scale.set(scale, scale, scale);

      const legMat = new THREE.MeshStandardMaterial({ color: options.pantsColor, roughness: 0.6 });
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.75, 16), legMat);
      legL.position.set(-0.16, 0.38, 0);
      legL.castShadow = true;
      charGroup.add(legL);

      const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.75, 16), legMat);
      legR.position.set(0.16, 0.38, 0);
      legR.castShadow = true;
      charGroup.add(legR);

      const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.3 });
      const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.28), shoeMat);
      shoeL.position.set(-0.16, 0.05, 0.05);
      charGroup.add(shoeL);

      const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.28), shoeMat);
      shoeR.position.set(0.16, 0.05, 0.05);
      charGroup.add(shoeR);

      const coatMat = new THREE.MeshStandardMaterial({ color: options.coatColor, roughness: 0.5, metalness: 0.2 });
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.85, 20), coatMat);
      torso.position.y = 1.1;
      torso.castShadow = true;
      charGroup.add(torso);

      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.68, 0);
      charGroup.add(headGroup);

      const headMat = new THREE.MeshStandardMaterial({ color: options.skinColor || 0xe6ceb8, roughness: 0.5 });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), headMat);
      head.castShadow = true;
      headGroup.add(head);

      if (options.hasVisor) {
        const visorMat = new THREE.MeshStandardMaterial({
          color: options.visorColor || 0x0071e3,
          emissive: options.visorColor || 0x0071e3,
          emissiveIntensity: 0.7,
          metalness: 0.9,
          roughness: 0.1,
        });
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.18), visorMat);
        visor.position.set(0, 0.02, 0.15);
        headGroup.add(visor);
      }

      if (options.hasCap) {
        const capMat = new THREE.MeshStandardMaterial({ color: options.capColor || 0x16181f, roughness: 0.6 });
        const capBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 24), capMat);
        capBrim.position.set(0, 0.16, 0);
        headGroup.add(capBrim);

        const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.22, 24), capMat);
        capCrown.position.set(0, 0.27, 0);
        headGroup.add(capCrown);
      }

      return { charGroup, torso, headGroup };
    };

    // Helper: Criação de Feixe Laser de Perícia
    const createScannerLaser = (posX: number, posY: number, posZ: number) => {
      const scanBeamGeo = new THREE.ConeGeometry(0.35, 1.4, 24, 1, true);
      const scanBeamMat = new THREE.MeshBasicMaterial({
        color: 0x0071e3,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
      });
      const scanBeam = new THREE.Mesh(scanBeamGeo, scanBeamMat);
      scanBeam.position.set(posX, posY, posZ);
      scanBeam.rotation.x = Math.PI / 2.2;
      scene.add(scanBeam);
      return scanBeam;
    };

    // =========================================================================
    // CONSTRUÇÃO ESPECÍFICA DO CENÁRIO COM BASE NO CONTEXTO DO ENUNCIADO
    // =========================================================================

    // Identificação precisa do contexto
    const isCase1 = caseId === 'case-1-whatsapp' || (scenarioType === 'whatsapp' && !caseId.includes('6'));
    const isCase2 = caseId === 'case-2-correios' || scenarioType === 'correios';
    const isCase3 = caseId === 'case-3-compra-aprovada';
    const isCase4 = caseId === 'case-4-falsa-central';
    const isCase5 = caseId === 'case-5-loja-falsa-promocao' || scenarioType === 'loja';
    const isCase6 = caseId === 'case-6-sms-seguranca-real';
    const isCase7 = caseId === 'case-7-vaga-tarefas' || scenarioType === 'tarefas';
    const isCase8 = caseId === 'case-8-receita-ecac' || scenarioType === 'oficial';
    const isCase9 = caseId === 'case-9-mao-fantasma-suporte' || scenarioType === 'remoto';

    if (isCase1) {
      // -----------------------------------------------------------------------
      // CENÁRIO 1: A MÃE COM O CELULAR E A SITUAÇÃO DA FILHA (TELA TRINCADA NO CHÃO)
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x8a3b5c, // Vestimenta casual/materna elegante
        pantsColor: 0x22242a,
        hasVisor: true,
        visorColor: 0x2997ff,
      });
      charGroup.position.set(-1.1, 0, 0.4);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Smartphone na mão da mãe recebendo a mensagem
      const phoneInHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.38, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x111216, metalness: 0.8 })
      );
      phoneInHand.position.set(-0.85, 1.25, 0.65);
      phoneInHand.rotation.set(-0.3, 0.2, 0);
      phoneInHand.userData = { propName: 'celular_whatsapp' };
      scene.add(phoneInHand);
      interactiveObjects.push(phoneInHand);

      // Balão de Chat WhatsApp Flutuante com 'Pix de R$ 480?'
      const chatBubble = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.38, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x25d366, emissive: 0x128c7e, emissiveIntensity: 0.4 })
      );
      chatBubble.position.set(-0.7, 1.85, 0.6);
      scene.add(chatBubble);

      // MESA DA SITUAÇÃO ALEGADA NO ENUNCIADO: Celular Trincado + Cadernos da Faculdade
      const table = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.75, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x1e2026, roughness: 0.5 })
      );
      table.position.set(0.9, 0.375, 0.1);
      scene.add(table);

      // O Celular antigo quebrado com a tela trincada
      const brokenPhone = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.04, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x08090b, roughness: 0.2 })
      );
      brokenPhone.position.set(0.7, 0.77, 0.2);
      brokenPhone.rotation.y = 0.35;
      brokenPhone.userData = { propName: 'celular_quebrado' };
      scene.add(brokenPhone);
      interactiveObjects.push(brokenPhone);

      // Efeito de trinca na tela do aparelho (Wireframe X)
      const crack = new THREE.Mesh(
        new THREE.PlaneGeometry(0.28, 0.55),
        new THREE.MeshBasicMaterial({ color: 0xff3b30, wireframe: true })
      );
      crack.rotation.x = -Math.PI / 2;
      crack.rotation.z = 0.35;
      crack.position.set(0.7, 0.795, 0.2);
      scene.add(crack);

      // Livros / Caderno da Faculdade
      const books = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.18, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x0071e3, roughness: 0.7 })
      );
      books.position.set(1.2, 0.84, -0.1);
      books.rotation.y = -0.2;
      scene.add(books);

      // Moeda / Chave Pix Flutuante com Partículas de Urgência
      const pixCoin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.04, 24),
        new THREE.MeshStandardMaterial({ color: 0x30d158, metalness: 0.8, emissive: 0x30d158, emissiveIntensity: 0.5 })
      );
      pixCoin.position.set(0.7, 1.35, 0.2);
      pixCoin.rotation.x = Math.PI / 3;
      scene.add(pixCoin);

      const scannerBeam = createScannerLaser(0.7, 0.9, 0.2);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 2.5) * 0.02;
        pixCoin.rotation.y = time * 2;
        pixCoin.position.y = 1.35 + Math.sin(time * 3) * 0.05;
        chatBubble.position.y = 1.85 + Math.sin(time * 2) * 0.03;
        scannerBeam.rotation.y = Math.sin(time * 2) * 0.3;
      };
    } else if (isCase2) {
      // -----------------------------------------------------------------------
      // CENÁRIO 2: A ENCOMENDA RETIDA NA ALFÂNDEGA SOB CANCELA / BARREIRA ADUANEIRA
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x1d3557, // Inspetor aduaneiro / carteiro
        pantsColor: 0x111625,
        hasCap: true,
        capColor: 0x1d3557,
        hasVisor: true,
        visorColor: 0xffd60a,
      });
      charGroup.position.set(-1.2, 0, 0.3);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Balcão de Fiscalização Aduaneira / Esteira
      const conveyor = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.7, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x2b2d35, metalness: 0.6, roughness: 0.4 })
      );
      conveyor.position.set(0.6, 0.35, 0);
      scene.add(conveyor);

      // Caixa de Encomenda Retida dos Correios
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.55, 0.65),
        new THREE.MeshStandardMaterial({ color: 0xb08257, roughness: 0.85 })
      );
      box.position.set(0.6, 0.975, 0);
      box.castShadow = true;
      box.userData = { propName: 'pacote_correios' };
      scene.add(box);
      interactiveObjects.push(box);

      // Fita Amarela/Azul dos Correios
      const tape = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.09, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xffd60a, roughness: 0.4 })
      );
      tape.position.set(0.6, 0.975, 0);
      scene.add(tape);

      // Cancela / Barreira de Alfândega Fechada (Listrada Amarelo e Preto)
      const gatePost = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.6, 16),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      gatePost.position.set(-0.25, 0.8, 0.5);
      scene.add(gatePost);

      const gateArm = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.08, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xff9f0a, emissive: 0xff9f0a, emissiveIntensity: 0.3 })
      );
      gateArm.position.set(0.65, 1.35, 0.5);
      scene.add(gateArm);

      // Carimbo 3D Vermelho: "TAXA PENDENTE R$ 27,90"
      const taxStamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.24, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff3b30, emissiveIntensity: 0.5 })
      );
      taxStamp.position.set(0.6, 1.7, 0);
      scene.add(taxStamp);

      const scannerBeam = createScannerLaser(0.6, 1.1, 0);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 2.2) * 0.02;
        taxStamp.position.y = 1.7 + Math.sin(time * 2.5) * 0.04;
        scannerBeam.rotation.y = Math.sin(time * 2.2) * 0.4;
      };
    } else if (isCase3) {
      // -----------------------------------------------------------------------
      // CENÁRIO 3: PADARIA ESTRELA - PAGAMENTO POR APROXIMAÇÃO (CONTACTLESS REAL)
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x2a9d8f, // Roupas casuais diurnas
        pantsColor: 0x264653,
        hasVisor: false,
      });
      charGroup.position.set(-1.0, 0, 0.4);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Balcão de Padaria com acabamento em madeira
      const counter = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.8, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.6 })
      );
      counter.position.set(0.8, 0.4, 0.1);
      scene.add(counter);

      // Xícara de Café Quente da Padaria
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.09, 0.22, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      cup.position.set(1.3, 0.91, 0.2);
      scene.add(cup);

      // Maquininha de Cartão POS (Terminal Bancário da Padaria)
      const posMachine = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.18, 0.55),
        new THREE.MeshStandardMaterial({ color: 0x1f232b, metalness: 0.7 })
      );
      posMachine.position.set(0.5, 0.89, 0.2);
      posMachine.rotation.y = -0.2;
      posMachine.userData = { propName: 'maquininha_padaria' };
      scene.add(posMachine);
      interactiveObjects.push(posMachine);

      // Cartão Físico com Chip encostado na Maquininha (Contactless)
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.02, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x820ad1, metalness: 0.6 }) // Nubank Roxo
      );
      card.position.set(0.48, 1.05, 0.2);
      card.rotation.set(0.1, -0.2, 0.1);
      scene.add(card);

      // Ondas Verdes de NFC / Aproximação Concluída
      const nfcWave = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.025, 16, 32),
        new THREE.MeshBasicMaterial({ color: 0x30d158, transparent: true, opacity: 0.8 })
      );
      nfcWave.position.set(0.48, 1.15, 0.2);
      nfcWave.rotation.x = Math.PI / 2;
      scene.add(nfcWave);

      // Notificação Push Segura Flutuando
      const pushNotification = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.25, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x30d158, emissive: 0x30d158, emissiveIntensity: 0.4 })
      );
      pushNotification.position.set(0.5, 1.65, 0.2);
      scene.add(pushNotification);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 2.2) * 0.02;
        nfcWave.scale.setScalar(1 + Math.sin(time * 4) * 0.15);
        pushNotification.position.y = 1.65 + Math.sin(time * 2) * 0.03;
      };
    } else if (isCase4) {
      // -----------------------------------------------------------------------
      // CENÁRIO 4: FALSA CENTRAL - NÚMERO 0800 COM BINA MASCARADA E COFRE ILUSÓRIO
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x3d3a45,
        pantsColor: 0x1f1d24,
        hasVisor: true,
        visorColor: 0xff3b30, // Alerta vermelho
      });
      charGroup.position.set(-1.0, 0, 0.4);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Telefone grudado na orelha da vítima
      const earPhone = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.28, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x0c0d10 })
      );
      earPhone.position.set(-0.76, 1.68, 0.38);
      earPhone.rotation.z = -0.2;
      scene.add(earPhone);

      // Número Holográfico Mascarado: "0800 729 0001" (com glitch no ar)
      const binarHolo = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.35, 0.05),
        new THREE.MeshStandardMaterial({
          color: 0xff3b30,
          emissive: 0xff3b30,
          emissiveIntensity: 0.6,
          wireframe: true,
        })
      );
      binarHolo.position.set(-0.7, 2.2, 0.4);
      scene.add(binarHolo);

      // O "COFRE DE SEGURANÇA PROVISÓRIO" (Cofre Bancário Ilusório)
      const safeBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.1, 1.0),
        new THREE.MeshStandardMaterial({ color: 0x22242a, metalness: 0.85, roughness: 0.2 })
      );
      safeBox.position.set(0.9, 0.55, 0);
      safeBox.userData = { propName: 'conta_cofre' };
      scene.add(safeBox);
      interactiveObjects.push(safeBox);

      // Roda de Aço Giratória do Cofre
      const safeWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.05, 16, 24),
        new THREE.MeshStandardMaterial({ color: 0xffd60a, metalness: 0.9 })
      );
      safeWheel.position.set(0.9, 0.55, 0.52);
      scene.add(safeWheel);

      // Moedas e Cifrões sendo puxados para o cofre falso
      const moneyStream = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.08, 16, 32),
        new THREE.MeshStandardMaterial({ color: 0xff9f0a, emissive: 0xff9f0a, emissiveIntensity: 0.4 })
      );
      moneyStream.position.set(0.9, 1.45, 0);
      moneyStream.rotation.x = Math.PI / 2.5;
      scene.add(moneyStream);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 3.5) * 0.02; // Respiração mais ofegante/tensa
        safeWheel.rotation.z = time * 1.5;
        moneyStream.rotation.z = -time * 2;
        binarHolo.position.x = -0.7 + (Math.random() - 0.5) * 0.03; // Efeito de ruído/glitch na BINA
      };
    } else if (isCase5) {
      // -----------------------------------------------------------------------
      // CENÁRIO 5: ANÚNCIO DO INSTAGRAM - AIR FRYER COM 85% DE DESCONTO
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x4a4e69,
        pantsColor: 0x22223b,
        hasVisor: true,
        visorColor: 0xff9f0a,
      });
      charGroup.position.set(-1.1, 0, 0.4);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Pedestal da Loja Falsa / Vitrine Digital
      const displayPedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.95, 0.7, 32),
        new THREE.MeshStandardMaterial({ color: 0x1f2026, metalness: 0.7, roughness: 0.3 })
      );
      displayPedestal.position.set(0.8, 0.35, 0);
      scene.add(displayPedestal);

      // A Air Fryer Digital 3D anunciada com 85% de desconto
      const airFryerBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.28, 0.58, 24),
        new THREE.MeshStandardMaterial({ color: 0x111215, metalness: 0.85, roughness: 0.2 })
      );
      airFryerBody.position.set(0.8, 0.99, 0);
      airFryerBody.castShadow = true;
      airFryerBody.userData = { propName: 'air_fryer_promocao' };
      scene.add(airFryerBody);
      interactiveObjects.push(airFryerBody);

      // Puxador cromado da gaveta da Air Fryer
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.24, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.1 })
      );
      handle.position.set(0.8, 0.95, 0.32);
      scene.add(handle);

      // Placa de Super Promoção Flutuante: "-85% OFF • R$ 119,90"
      const promoTag = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.35, 0.05),
        new THREE.MeshStandardMaterial({ color: 0xff3b30, emissive: 0xff3b30, emissiveIntensity: 0.5 })
      );
      promoTag.position.set(0.8, 1.6, 0);
      scene.add(promoTag);

      // Cartão de Crédito com Bloqueio (X Vermelho)
      const blockedCard = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.26, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5 })
      );
      blockedCard.position.set(0.25, 0.85, 0.5);
      blockedCard.rotation.x = -Math.PI / 4;
      scene.add(blockedCard);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 2.2) * 0.02;
        airFryerBody.rotation.y = time * 0.8;
        handle.rotation.y = time * 0.8;
        promoTag.position.y = 1.6 + Math.sin(time * 2.5) * 0.05;
        promoTag.rotation.y = Math.sin(time * 1.5) * 0.2;
      };
    } else if (isCase6) {
      // -----------------------------------------------------------------------
      // CENÁRIO 6: AUTENTICAÇÃO REAL EM 2 FATORES (USUÁRIO NO COMPUTADOR + CELULAR)
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x0071e3, // Azul Banco do Brasil
        pantsColor: 0x161a24,
        hasVisor: false,
      });
      charGroup.position.set(-0.9, 0, 0.4);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Mesa de Escritório com Computador Desktop
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.8, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x1e2026, roughness: 0.5 })
      );
      desk.position.set(0.5, 0.4, 0);
      scene.add(desk);

      // Monitor Desktop Aberto no Site do Banco
      const monitor = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.6, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x111216, metalness: 0.8 })
      );
      monitor.position.set(0.4, 1.15, -0.2);
      scene.add(monitor);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.88, 0.52),
        new THREE.MeshBasicMaterial({ color: 0x002d62 }) // Azul BB
      );
      screen.position.set(0.4, 1.15, -0.174);
      scene.add(screen);

      // Celular ao lado do teclado recebendo o código SMS legítimo
      const phone2FA = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.03, 0.45),
        new THREE.MeshStandardMaterial({ color: 0x090a0c })
      );
      phone2FA.position.set(0.9, 0.82, 0.2);
      phone2FA.rotation.y = -0.3;
      phone2FA.userData = { propName: 'celular_2fa' };
      scene.add(phone2FA);
      interactiveObjects.push(phone2FA);

      // Código 2FA Seguro Flutuante: "839-201"
      const codeBanner = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.3, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x30d158, emissive: 0x30d158, emissiveIntensity: 0.5 })
      );
      codeBanner.position.set(0.9, 1.35, 0.2);
      scene.add(codeBanner);

      // Escudo Protetor de 2 Fatores Conectando PC e Celular
      const shield2FA = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.035, 16, 32),
        new THREE.MeshBasicMaterial({ color: 0x2997ff, transparent: true, opacity: 0.7 })
      );
      shield2FA.position.set(0.65, 1.25, 0);
      scene.add(shield2FA);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 2.2) * 0.02;
        codeBanner.position.y = 1.35 + Math.sin(time * 2.8) * 0.04;
        shield2FA.rotation.z = time * 1.2;
      };
    } else if (isCase7) {
      // -----------------------------------------------------------------------
      // CENÁRIO 7: GOLPE DAS TAREFAS - CURTIR VÍDEOS COM PIRÂMIDE DE DEPÓSITOS
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x2b2d42,
        pantsColor: 0x1d1e2c,
        hasVisor: true,
        visorColor: 0x2997ff,
      });
      charGroup.position.set(-1.1, 0, 0.4);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Degraus da Pirâmide de Tarefas
      const step1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.35, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x30d158, roughness: 0.5 }) // R$ 20 liberados
      );
      step1.position.set(0.2, 0.175, 0.3);
      scene.add(step1);

      const step2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xff9f0a, roughness: 0.5 }) // Pix de R$ 100 exigido
      );
      step2.position.set(0.8, 0.35, 0);
      step2.userData = { propName: 'tarefa_vip' };
      scene.add(step2);
      interactiveObjects.push(step2);

      const step3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.1, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xff3b30, roughness: 0.5 }) // R$ 500 inalcançáveis
      );
      step3.position.set(1.4, 0.55, -0.3);
      scene.add(step3);

      // Botão 3D de "LIKE / CURTIDA" Flutuante (YouTube / Telegram)
      const likeBadge = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.35, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.4 })
      );
      likeBadge.position.set(0.2, 0.75, 0.3);
      scene.add(likeBadge);

      // Cadeado VIP no segundo degrau
      const vipLock = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.04, 16, 24),
        new THREE.MeshStandardMaterial({ color: 0xffd60a, metalness: 0.9 })
      );
      vipLock.position.set(0.8, 1.05, 0);
      scene.add(vipLock);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 2.2) * 0.02;
        likeBadge.position.y = 0.75 + Math.sin(time * 3) * 0.04;
        vipLock.rotation.y = time * 2;
      };
    } else if (isCase8) {
      // -----------------------------------------------------------------------
      // CENÁRIO 8: RECEITA FEDERAL / GOV.BR - CAIXA POSTAL OFICIAL COM SELO OURO
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x1f2421,
        pantsColor: 0x141715,
        hasVisor: false,
      });
      charGroup.position.set(-1.0, 0, 0.4);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Totem Oficial do Portal Gov.br
      const portalTotem = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x1b2838, metalness: 0.7, roughness: 0.3 })
      );
      portalTotem.position.set(0.8, 0.75, 0);
      portalTotem.userData = { propName: 'portal_gov_ecac' };
      scene.add(portalTotem);
      interactiveObjects.push(portalTotem);

      // Selo Oficial Gov.br Ouro (Brasão Dourado)
      const goldSeal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.05, 32),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.1, emissive: 0xffd700, emissiveIntensity: 0.3 })
      );
      goldSeal.position.set(0.8, 1.7, 0);
      goldSeal.rotation.x = Math.PI / 2;
      scene.add(goldSeal);

      // Caixa Postal Interna com Documento de Malha Fina
      const docFolder = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.04, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xf5f5f7, roughness: 0.8 })
      );
      docFolder.position.set(0.8, 0.85, 0.3);
      scene.add(docFolder);

      // Relógio do Prazo Legal: "30 DIAS"
      const termBadge = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.25, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x30d158, emissive: 0x30d158, emissiveIntensity: 0.4 })
      );
      termBadge.position.set(0.8, 1.25, 0.3);
      scene.add(termBadge);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 2.2) * 0.02;
        goldSeal.rotation.z = time * 0.6;
        termBadge.position.y = 1.25 + Math.sin(time * 2) * 0.03;
      };
    } else if (isCase9) {
      // -----------------------------------------------------------------------
      // CENÁRIO 9: GOLPE DA MÃO FANTASMA - ACESSO REMOTO INVADINDO O CELULAR
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x212529,
        pantsColor: 0x16181b,
        hasVisor: true,
        visorColor: 0xff3b30,
      });
      charGroup.position.set(-1.0, 0, 0.4);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      // Mesa de Trabalho
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.8, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.5 })
      );
      desk.position.set(0.7, 0.4, 0.1);
      scene.add(desk);

      // Celular / Tablet Alvo do Golpe
      const targetPhone = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.04, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x090a0c, metalness: 0.8 })
      );
      targetPhone.position.set(0.7, 0.82, 0.2);
      targetPhone.userData = { propName: 'celular_anydesk' };
      scene.add(targetPhone);
      interactiveObjects.push(targetPhone);

      // A "MÃO FANTASMA" HOLOGRÁFICA (Tentando invadir e tocar na tela)
      const ghostHandGroup = new THREE.Group();
      ghostHandGroup.position.set(0.7, 1.45, 0.2);
      scene.add(ghostHandGroup);

      const ghostPalm = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.08, 0.35),
        new THREE.MeshBasicMaterial({ color: 0xff3b30, wireframe: true, transparent: true, opacity: 0.6 })
      );
      ghostHandGroup.add(ghostPalm);

      // Dedos da mão fantasma
      for (let i = -2; i <= 2; i++) {
        const finger = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.02, 0.28, 8),
          new THREE.MeshBasicMaterial({ color: 0xff3b30, wireframe: true, transparent: true, opacity: 0.7 })
        );
        finger.position.set(i * 0.07, -0.15, 0.15);
        finger.rotation.x = Math.PI / 4;
        ghostHandGroup.add(finger);
      }

      // Fios de controle de marionete cibernética
      const puppetWires = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 1.2, 8),
        new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.3 })
      );
      puppetWires.position.set(0.7, 2.1, 0.2);
      scene.add(puppetWires);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 3) * 0.02;
        // Movimento de aproximação e clique da mão fantasma descendo em direção à tela
        ghostHandGroup.position.y = 1.35 + Math.sin(time * 3.5) * 0.12;
        ghostHandGroup.rotation.z = Math.sin(time * 2) * 0.15;
      };
    } else {
      // -----------------------------------------------------------------------
      // CENÁRIO PADRÃO DINÂMICO MULTICANAL
      // -----------------------------------------------------------------------
      const { charGroup, torso, headGroup } = createCharacter({
        coatColor: 0x1e272e,
        pantsColor: 0x14171a,
        hasVisor: true,
        visorColor: 0x0071e3,
      });
      charGroup.position.set(-0.9, 0, 0.3);
      scene.add(charGroup);
      animState.headGroup = headGroup;

      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.75, 1.0),
        new THREE.MeshStandardMaterial({ color: 0x1c1e24 })
      );
      desk.position.set(0.8, 0.375, 0);
      scene.add(desk);

      const device = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x0a0b0e, metalness: 0.8 })
      );
      device.position.set(0.8, 0.78, 0.1);
      device.userData = { propName: 'dispositivo_forense' };
      scene.add(device);
      interactiveObjects.push(device);

      animState.update = (time) => {
        torso.position.y = 1.1 + Math.sin(time * 2.2) * 0.02;
      };
    }

    // --- 4. PARTICULAS CYBER DE AMBIENTE ---
    const particlesCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 5.5;
      particlePos[i + 1] = Math.random() * 3.5;
      particlePos[i + 2] = (Math.random() - 0.5) * 4.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x2997ff,
      size: 0.04,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 5. INTERAÇÃO DO MOUSE E RAYCASTER ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const targetLookAt = new THREE.Vector2(0, 0);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetLookAt.x = mouse.x;
      targetLookAt.y = mouse.y;

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

    // --- 6. RENDER LOOP COM ANIMAÇÃO ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Atualiza o estado da cena específica do caso
      animState.update(elapsedTime);

      // Rastreamento suave do cursor pela cabeça do personagem
      if (animState.headGroup) {
        animState.headGroup.rotation.y = THREE.MathUtils.lerp(animState.headGroup.rotation.y, targetLookAt.x * 0.5, 0.08);
        animState.headGroup.rotation.x = THREE.MathUtils.lerp(animState.headGroup.rotation.x, -targetLookAt.y * 0.25, 0.08);
      }

      // Rotação suave do anel e partículas
      ringMesh.rotation.z = elapsedTime * 0.25;
      particles.rotation.y = elapsedTime * 0.035;

      // Reação ao resultado do veredito
      if (verdictResult === 'correct') {
        ringMat.color.setHex(0x30d158);
      } else if (verdictResult === 'incorrect') {
        ringMat.color.setHex(0xff3b30);
      } else {
        ringMat.color.setHex(0x0071e3);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 280;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- 7. CLEANUP TOTAL DE RECURSOS ---
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
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
    };
  }, [caseId, scenarioType, verdictResult, interactive, onPropClick]);

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
          <span>Encenação 3D do Enunciado</span>
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
          <span>Mova o mouse para interagir com a cena do dilema</span>
        </span>

        {hoveredProp && (
          <span className="flex items-center gap-1 text-[#2997ff] font-medium bg-[#0071e3]/15 backdrop-blur-md px-2 py-0.5 rounded-full border border-[#0071e3]/30 animate-bounce">
            <ZoomIn className="w-3 h-3" /> Toque para Inspecionar Elemento
          </span>
        )}
      </div>
    </div>
  );
};
