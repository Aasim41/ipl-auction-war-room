'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Orbit, Maximize2, Sparkles, Eye, Shield, Zap } from 'lucide-react';

interface PlayerPos3D {
  name: string;
  role: string;
  teamColor?: string;
  isDeep?: boolean;
}

interface ShotTraj3D {
  x: number;
  y: number;
  shotZoneName?: string;
}

interface ThreeCricketArenaProps {
  strikerName?: string;
  strikerRuns?: number;
  nonStrikerName?: string;
  nonStrikerRuns?: number;
  bowlerName?: string;
  bowlerFigures?: string;
  battingTeamColor?: string;
  bowlingTeamColor?: string;
  isBallAnimating?: boolean;
  lastBall?: {
    runs: number;
    isWicket: boolean;
    isFour: boolean;
    isSix: boolean;
    wicketType?: string;
    shotDirection?: { name: string; x: number; y: number };
  } | null;
  fieldingStrategy?: string;
  deepCount?: number;
  onCameraChange?: (mode: string) => void;
}

export default function ThreeCricketArena({
  strikerName = 'Striker',
  strikerRuns = 0,
  nonStrikerName = 'Non-Striker',
  nonStrikerRuns = 0,
  bowlerName = 'Bowler',
  bowlerFigures = '0/0 (0.0)',
  battingTeamColor = '#f59e0b',
  bowlingTeamColor = '#3b82f6',
  isBallAnimating = false,
  lastBall = null,
  fieldingStrategy = 'Standard Balanced',
  deepCount = 2,
}: ThreeCricketArenaProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic 3D Objects refs
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const ballTrailParticlesRef = useRef<THREE.Points | null>(null);
  const stumpsBattingRef = useRef<THREE.Group | null>(null);
  const bailsBattingRef = useRef<THREE.Group | null>(null);
  const batsmanGroupRef = useRef<THREE.Group | null>(null);
  const bowlerGroupRef = useRef<THREE.Group | null>(null);
  const fielderMeshesRef = useRef<THREE.Group[]>([]);
  const floodlightBeamsRef = useRef<THREE.Mesh[]>([]);

  // Camera presets: 'broadcast' | 'batsman' | 'bowler' | 'blimp'
  const [camMode, setCamMode] = useState<'broadcast' | 'batsman' | 'bowler' | 'blimp'>('broadcast');
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // Ball animation state
  const ballAnimProgress = useRef<number>(0);
  const isPlayingBallAnim = useRef<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 280;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913); // Deep night sky
    scene.fog = new THREE.FogExp2(0x060913, 0.007);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 1.5, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    // Warm, bright stadium floodlight ambience
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // 4 Main Floodlight Spotlights
    const lightPositions: [number, number, number][] = [
      [-42, 38, -42],
      [42, 38, -42],
      [-42, 38, 42],
      [42, 38, 42],
    ];

    lightPositions.forEach(([lx, ly, lz], idx) => {
      const spotLight = new THREE.SpotLight(0xfffaed, 3.8, 140, Math.PI / 4, 0.45, 1.2);
      spotLight.position.set(lx, ly, lz);
      spotLight.target.position.set(0, 0, 0);
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      spotLight.shadow.camera.near = 10;
      spotLight.shadow.camera.far = 140;
      spotLight.shadow.bias = -0.0005;
      scene.add(spotLight);
      scene.add(spotLight.target);

      // Floodlight Tower Mast
      const mastGeo = new THREE.CylinderGeometry(0.4, 0.7, ly, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(lx, ly / 2, lz);
      scene.add(mast);

      // Light Crown Grid
      const crownGeo = new THREE.BoxGeometry(4.5, 3, 1.5);
      const crownMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(lx, ly, lz);
      crown.lookAt(0, 0, 0);
      scene.add(crown);

      // Volumetric spotlight cone
      const coneGeo = new THREE.ConeGeometry(18, 55, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xfff7ed,
        transparent: true,
        opacity: 0.045,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.position.set(lx * 0.5, ly * 0.5, lz * 0.5);
      coneMesh.lookAt(0, 0, 0);
      coneMesh.rotateX(Math.PI / 2);
      scene.add(coneMesh);
      floodlightBeamsRef.current.push(coneMesh);
    });

    // 5. 3D Stadium Environment
    // Stadium Outfield Ground
    const groundGeo = new THREE.CylinderGeometry(48, 48, 1, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f5132, // Lush Cricket Green
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Mowing Circular Striping Bands
    for (let r = 8; r <= 44; r += 7) {
      const ringGeo = new THREE.RingGeometry(r, r + 3.2, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x198754,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      scene.add(ring);
    }

    // 30-Yard Circle (Inner Ring)
    const thirtyYardGeo = new THREE.RingGeometry(22, 22.4, 64);
    const thirtyYardMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const thirtyYard = new THREE.Mesh(thirtyYardGeo, thirtyYardMat);
    thirtyYard.rotation.x = -Math.PI / 2;
    thirtyYard.position.y = 0.03;
    scene.add(thirtyYard);

    // Boundary Rope & LED Boards
    const ropeGeo = new THREE.TorusGeometry(46, 0.45, 12, 64);
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.rotation.x = Math.PI / 2;
    rope.position.y = 0.3;
    scene.add(rope);

    // LED Boundary Advertising Boards
    const ledGeo = new THREE.CylinderGeometry(46.8, 46.8, 1.4, 48, 1, true);
    const ledMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.6,
    });
    const ledBoards = new THREE.Mesh(ledGeo, ledMat);
    ledBoards.position.y = 0.7;
    scene.add(ledBoards);

    // Stadium Grandstands Tier 1 & Tier 2
    const standGeo1 = new THREE.CylinderGeometry(52, 48, 6, 48, 1, true);
    const standMat1 = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const stand1 = new THREE.Mesh(standGeo1, standMat1);
    stand1.position.y = 3;
    scene.add(stand1);

    const standGeo2 = new THREE.CylinderGeometry(58, 52, 8, 48, 1, true);
    const standMat2 = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const stand2 = new THREE.Mesh(standGeo2, standMat2);
    stand2.position.y = 9;
    scene.add(stand2);

    // 6. Pitch Strip (22 Yards)
    // In our coordinate space: z goes from -10 (bowling end) to +10 (batting end)
    const pitchWidth = 3.4;
    const pitchLength = 22;
    const pitchGeo = new THREE.PlaneGeometry(pitchWidth, pitchLength);
    const pitchMat = new THREE.MeshStandardMaterial({
      color: 0xc28544, // Clay subcontinent pitch
      roughness: 0.95,
      metalness: 0.05,
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0.04;
    pitch.receiveShadow = true;
    scene.add(pitch);

    // Crease lines (White tape markings)
    const createCrease = (zPos: number, width: number) => {
      const lineGeo = new THREE.PlaneGeometry(width, 0.15);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.05, zPos);
      scene.add(line);
      return line;
    };
    createCrease(8.8, 3.2); // Batting popping crease
    createCrease(-8.8, 3.0); // Bowling popping crease

    // 7. Stumps & Bails
    const createStumpsGroup = (zPos: number) => {
      const group = new THREE.Group();
      group.position.set(0, 0, zPos);

      const stumpGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8);
      const stumpMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });

      // 3 Stumps (off, middle, leg)
      [-0.18, 0, 0.18].forEach(xOff => {
        const stump = new THREE.Mesh(stumpGeo, stumpMat);
        stump.position.set(xOff, 0.7, 0);
        stump.castShadow = true;
        group.add(stump);
      });

      // 2 Bails
      const bailGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6);
      const bailMat = new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.3 });
      const bail1 = new THREE.Mesh(bailGeo, bailMat);
      bail1.rotation.z = Math.PI / 2;
      bail1.position.set(-0.09, 1.43, 0);
      group.add(bail1);

      const bail2 = new THREE.Mesh(bailGeo, bailMat);
      bail2.rotation.z = Math.PI / 2;
      bail2.position.set(0.09, 1.43, 0);
      group.add(bail2);

      scene.add(group);
      return group;
    };

    stumpsBattingRef.current = createStumpsGroup(9.2); // Batting end
    createStumpsGroup(-9.2); // Bowling end

    // 8. 3D Player Avatars
    // Helper to build 3D Player Avatar (Pedestal cylinder + torso + helmet + shadow)
    const createPlayer3DAvatar = (colorHex: string, label: string, isBatter: boolean = false) => {
      const group = new THREE.Group();

      // Glowing aura circle on turf
      const auraGeo = new THREE.RingGeometry(0.5, 0.9, 24);
      const auraMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: isBatter ? 0.75 : 0.45,
        side: THREE.DoubleSide,
      });
      const aura = new THREE.Mesh(auraGeo, auraMat);
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.05;
      group.add(aura);

      // Base Pedestal
      const baseGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.2, 16);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.1;
      base.castShadow = true;
      group.add(base);

      // Torso / Jersey
      const torsoGeo = new THREE.CylinderGeometry(0.35, 0.3, 1.2, 12);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: 0.4,
        metalness: 0.2,
      });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 0.8;
      torso.castShadow = true;
      group.add(torso);

      // Helmet / Head
      const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: isBatter ? 0xf59e0b : 0x0f172a,
        roughness: 0.3,
        metalness: 0.4,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.6;
      head.castShadow = true;
      group.add(head);

      // Cricket Bat (if batter)
      if (isBatter) {
        const batGeo = new THREE.BoxGeometry(0.12, 1.1, 0.06);
        const batMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
        const bat = new THREE.Mesh(batGeo, batMat);
        bat.position.set(0.4, 0.7, 0.2);
        bat.rotation.set(0.2, 0.3, -0.2);
        bat.castShadow = true;
        group.add(bat);
      }

      scene.add(group);
      return group;
    };

    // 1. Striker (Batting Crease: z = 8.4, x = 0.3)
    const striker3D = createPlayer3DAvatar(battingTeamColor, strikerName, true);
    striker3D.position.set(0.3, 0, 8.4);
    batsmanGroupRef.current = striker3D;

    // 2. Non-Striker (SAFE OFFSET: z = -7.8, x = 3.6 - well clear of bowler approach!)
    const nonStriker3D = createPlayer3DAvatar(battingTeamColor, nonStrikerName, false);
    nonStriker3D.position.set(3.4, 0, -7.8);

    // 3. Bowler (Delivery Stride: z = -9.8, x = -1.2)
    const bowler3D = createPlayer3DAvatar(bowlingTeamColor, bowlerName, false);
    bowler3D.position.set(-1.2, 0, -9.8);
    bowlerGroupRef.current = bowler3D;

    // 4. Wicketkeeper (Crouched: z = 12.0, x = 0)
    const wk3D = createPlayer3DAvatar(bowlingTeamColor, 'WK', false);
    wk3D.position.set(0, 0, 11.8);
    wk3D.scale.set(0.9, 0.8, 0.9); // crouched stature

    // 5. 1st Slip (z = 13.5, x = -3.2)
    const slip3D = createPlayer3DAvatar(bowlingTeamColor, 'Slip', false);
    slip3D.position.set(-3.2, 0, 13.2);

    // Dynamic Outfield Fielders based on tactics
    const fieldPositions: [number, number, boolean][] = [
      [18, -12, false],   // Mid-Off
      [-18, -12, false],  // Mid-On
      [24, 6, false],     // Cover Point
      [-22, 8, false],    // Short Mid-Wicket
      [36, -26, true],    // Deep Extra Cover
      [-36, -24, true],   // Deep Mid-Wicket / Long-On
      [38, 22, true],     // Deep Point / Third Man
    ];

    fieldPositions.forEach(([fx, fz, isDeep]) => {
      const f3D = createPlayer3DAvatar(bowlingTeamColor, 'Fielder', false);
      f3D.position.set(fx, 0, fz);
      if (isDeep) {
        f3D.scale.set(1.05, 1.05, 1.05);
      }
      fielderMeshesRef.current.push(f3D);
    });

    // 9. 3D Cricket Ball (Regulation Cork & Red Leather)
    const ballGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Kookaburra / SG Red
      roughness: 0.3,
      metalness: 0.2,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.position.set(-1.2, 1.6, -9.8);
    ballMesh.castShadow = true;
    scene.add(ballMesh);
    ballMeshRef.current = ballMesh;

    // 10. Particle System for Ball Flight Trail
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = 0;
      particlePositions[i + 1] = -100; // start hidden
      particlePositions[i + 2] = 0;

      particleColors[i] = 1.0;
      particleColors[i + 1] = 0.8;
      particleColors[i + 2] = 0.2;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const ballParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(ballParticles);
    ballTrailParticlesRef.current = ballParticles;

    // 11. Animation Loop & Orbit Camera Controller
    let angle = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Rotate light cones subtly
      floodlightBeamsRef.current.forEach((beam, i) => {
        beam.rotation.z += 0.002 * (i % 2 === 0 ? 1 : -1);
      });

      // Handle Camera Modes
      if (camMode === 'broadcast') {
        // High Broadcast Pressbox view with subtle breathing
        camera.position.set(0, 18, 28);
        camera.lookAt(0, 1.5, 0);
      } else if (camMode === 'batsman') {
        // Behind Batter POV looking straight at incoming bowler!
        camera.position.set(0.4, 3.2, 16.5);
        camera.lookAt(0, 1.2, -8.0);
      } else if (camMode === 'bowler') {
        // Bowler delivery stride POV looking at stumps!
        camera.position.set(-1.2, 3.8, -15.5);
        camera.lookAt(0.2, 1.2, 8.5);
      } else if (camMode === 'blimp') {
        // Sky Blimp orbiting camera
        if (isRotating) angle += 0.004;
        camera.position.set(Math.sin(angle) * 58, 42, Math.cos(angle) * 58);
        camera.lookAt(0, 0, 0);
      }

      // Ball Physics Animation Loop
      if (isPlayingBallAnim.current && ballMeshRef.current) {
        ballAnimProgress.current += 0.024;
        const t = Math.min(1, ballAnimProgress.current);

        // Phase 1: Delivery from Bowler to Pitch bounce (t: 0 -> 0.4)
        if (t <= 0.4) {
          const pt = t / 0.4;
          const startX = -1.2, startY = 1.8, startZ = -9.8;
          const bounceX = 0.1, bounceY = 0.15, bounceZ = 3.5;

          ballMeshRef.current.position.x = startX + (bounceX - startX) * pt;
          ballMeshRef.current.position.y = startY + (bounceY - startY) * Math.sin(pt * Math.PI * 0.5) * (1 - pt) + 0.15;
          ballMeshRef.current.position.z = startZ + (bounceZ - startZ) * pt;
          ballMeshRef.current.rotation.x += 0.35;
        } 
        // Phase 2: Bounce off pitch to Batsman impact (t: 0.4 -> 0.6)
        else if (t <= 0.6) {
          const pt = (t - 0.4) / 0.2;
          const bounceX = 0.1, bounceY = 0.15, bounceZ = 3.5;
          const batX = 0.3, batY = 0.9, batZ = 8.4;

          ballMeshRef.current.position.x = bounceX + (batX - bounceX) * pt;
          ballMeshRef.current.position.y = bounceY + (batY - bounceY) * pt + Math.sin(pt * Math.PI) * 0.4;
          ballMeshRef.current.position.z = bounceZ + (batZ - bounceZ) * pt;
        } 
        // Phase 3: Shot Trajectory into the field or into stands! (t: 0.6 -> 1.0)
        else {
          const pt = (t - 0.6) / 0.4;
          const batX = 0.3, batY = 0.9, batZ = 8.4;

          let targetX = 26;
          let targetZ = -22;
          let maxHeight = 16;

          if (lastBall?.isSix) {
            targetX = 42 * (Math.random() > 0.5 ? 1 : -1);
            targetZ = -44;
            maxHeight = 28; // Massive Six high into grandstands!
          } else if (lastBall?.isFour) {
            targetX = 46;
            targetZ = 12;
            maxHeight = 3.5; // Rapid boundary rope skimming!
          } else if (lastBall?.isWicket) {
            targetX = 0.2;
            targetZ = 9.8;
            maxHeight = 1.2;

            // Knock down stumps!
            if (stumpsBattingRef.current) {
              stumpsBattingRef.current.rotation.x = Math.min(Math.PI * 0.45, pt * Math.PI * 0.6);
            }
          }

          ballMeshRef.current.position.x = batX + (targetX - batX) * pt;
          ballMeshRef.current.position.y = batY + (0.2 - batY) * pt + Math.sin(pt * Math.PI) * maxHeight;
          ballMeshRef.current.position.z = batZ + (targetZ - batZ) * pt;

          // Emit trail particles
          if (ballTrailParticlesRef.current) {
            const posAttr = ballTrailParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
            const pArr = posAttr.array as Float32Array;
            const pIdx = Math.floor(pt * (particleCount - 1)) * 3;
            pArr[pIdx] = ballMeshRef.current.position.x;
            pArr[pIdx + 1] = ballMeshRef.current.position.y;
            pArr[pIdx + 2] = ballMeshRef.current.position.z;
            posAttr.needsUpdate = true;
          }
        }

        if (t >= 1) {
          isPlayingBallAnim.current = false;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth || 380;
      const nh = container.clientHeight || 280;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Trigger 3D Delivery Animation when a new ball is bowled
  useEffect(() => {
    if (isBallAnimating) {
      isPlayingBallAnim.current = true;
      ballAnimProgress.current = 0;

      // Reset batting stumps
      if (stumpsBattingRef.current) {
        stumpsBattingRef.current.rotation.x = 0;
      }

      // Reset particle trail
      if (ballTrailParticlesRef.current) {
        const posAttr = ballTrailParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const pArr = posAttr.array as Float32Array;
        for (let i = 0; i < pArr.length; i += 3) {
          pArr[i + 1] = -100;
        }
        posAttr.needsUpdate = true;
      }
    }
  }, [isBallAnimating, lastBall]);

  return (
    <div className="relative w-full h-full min-h-[300px] flex-1 rounded-2xl overflow-hidden bg-slate-950 border border-emerald-500/40 shadow-2xl select-none group">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Overlay: 3D Camera Controls & View Mode Pills */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 text-[10px] font-mono pointer-events-auto shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-bold">3D ARENA</span>
          <span className="text-gray-400">|</span>
          <span className="text-amber-300 font-bold">{fieldingStrategy}</span>
          <span className="text-gray-400 text-[9px]">({deepCount} deep)</span>
        </div>

        {/* Camera Preset Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md p-0.5 rounded-xl border border-white/15 pointer-events-auto shadow-lg">
          <button
            onClick={() => setCamMode('broadcast')}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono transition-all cursor-pointer ${
              camMode === 'broadcast' ? 'bg-amber-500 text-slate-950 font-black' : 'text-gray-300 hover:text-white'
            }`}
            title="Pressbox TV Broadcast Cam"
          >
            🎥 TV
          </button>
          <button
            onClick={() => setCamMode('batsman')}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono transition-all cursor-pointer ${
              camMode === 'batsman' ? 'bg-amber-500 text-slate-950 font-black' : 'text-gray-300 hover:text-white'
            }`}
            title="Batter POV Crease Cam"
          >
            🏏 BAT
          </button>
          <button
            onClick={() => setCamMode('bowler')}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono transition-all cursor-pointer ${
              camMode === 'bowler' ? 'bg-amber-500 text-slate-950 font-black' : 'text-gray-300 hover:text-white'
            }`}
            title="Bowler Crease Cam"
          >
            🎯 BOWL
          </button>
          <button
            onClick={() => {
              setCamMode('blimp');
              setIsRotating(!isRotating);
            }}
            className={`px-2 py-0.5 rounded-lg text-[9px] font-bold font-mono transition-all cursor-pointer ${
              camMode === 'blimp' ? 'bg-amber-500 text-slate-950 font-black' : 'text-gray-300 hover:text-white'
            }`}
            title="Sky Blimp 360° Orbit"
          >
            🚁 SKY
          </button>
        </div>
      </div>

      {/* Floating Tactical Badges for Batters and Bowler on Field */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10 text-[10px] font-mono">
        {/* Striker Badge */}
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-500/40 text-amber-300 shadow-md">
          <span>🏏 {strikerName}*</span>
          <span className="text-white font-bold font-sans">({strikerRuns})</span>
        </div>

        {/* Runner Badge */}
        <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-gray-300 shadow-sm">
          <span>🏃 {nonStrikerName}</span>
          <span className="text-gray-400 font-sans">({nonStrikerRuns})</span>
        </div>

        {/* Bowler Badge */}
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-rose-500/40 text-rose-300 shadow-md">
          <span>🎯 {bowlerName}</span>
          <span className="text-white font-bold font-sans">({bowlerFigures})</span>
        </div>
      </div>
    </div>
  );
}
