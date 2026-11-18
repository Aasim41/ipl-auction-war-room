'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface PlayerPos {
  id: string;
  name: string;
  role: string;
  x: number;
  z: number;
  posName: string;
}

// 11 Default Fielding Positions on a 3D Cricket Ground (x, z in world units)
const DEFAULT_FIELD_POSITIONS: Omit<PlayerPos, 'id' | 'name' | 'role'>[] = [
  { posName: 'Wicketkeeper', x: 0, z: -8.5 },
  { posName: '1st Slip', x: 2.2, z: -9.5 },
  { posName: 'Gully / Point', x: 7.5, z: -5.0 },
  { posName: 'Cover Point', x: 10.5, z: -1.5 },
  { posName: 'Extra Cover', x: 8.5, z: 4.5 },
  { posName: 'Mid-Off', x: 3.5, z: 8.0 },
  { posName: 'Bowler', x: 0, z: 6.5 },
  { posName: 'Mid-On', x: -3.5, z: 8.0 },
  { posName: 'Short Mid-Wicket', x: -7.5, z: 3.5 },
  { posName: 'Deep Mid-Wicket', x: -14.0, z: 6.0 },
  { posName: 'Deep Square Leg', x: -13.5, z: -4.5 },
];

interface ThreeLineupFieldProps {
  franchiseColor?: string;
  franchiseShort?: string;
  players?: Array<{ id: string; name: string; role: string }>;
  selectedPlayerId?: string | null;
  onSelectPlayer?: (playerId: string) => void;
}

export function ThreeLineupField({
  franchiseColor = '#fbbf24',
  franchiseShort = 'IND',
  players = [],
  selectedPlayerId,
  onSelectPlayer,
}: ThreeLineupFieldProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraView, setCameraView] = useState<'3D' | 'TOP' | 'KEEPER'>('3D');
  const [isRotating, setIsRotating] = useState(true);

  // References to keep animation loop clean
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 260;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.022);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    camera.position.set(0, 18, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 2. Lighting Setup (Stadium Night Floodlights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Dynamic Team Colored Underglow
    const teamPoint = new THREE.PointLight(new THREE.Color(franchiseColor), 3, 30);
    teamPoint.position.set(0, 8, 0);
    scene.add(teamPoint);

    // 4 Stadium Corner Floodlight Masts
    const mastCoords = [
      { x: -18, z: -18 },
      { x: 18, z: -18 },
      { x: -18, z: 18 },
      { x: 18, z: 18 },
    ];
    mastCoords.forEach(c => {
      const mastGeo = new THREE.CylinderGeometry(0.15, 0.3, 12, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(c.x, 6, c.z);
      scene.add(mast);

      // Light head
      const headGeo = new THREE.BoxGeometry(1.5, 0.6, 0.8);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(c.x, 12, c.z);
      head.lookAt(0, 0, 0);
      scene.add(head);

      const spot = new THREE.SpotLight(0xfff7ed, 2, 40, Math.PI / 4, 0.5, 1);
      spot.position.set(c.x, 12, c.z);
      spot.target.position.set(0, 0, 0);
      scene.add(spot);
      scene.add(spot.target);
    });

    // 3. 3D Stadium Turf & Pitch
    // Outfield with concentric mowing rings
    const turfGeo = new THREE.CylinderGeometry(18, 18, 0.4, 48);
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.85,
      metalness: 0.1,
    });
    const turf = new THREE.Mesh(turfGeo, turfMat);
    turf.position.y = -0.2;
    turf.receiveShadow = true;
    scene.add(turf);

    // 30-Yard Circle line
    const circleGeo = new THREE.RingGeometry(10.8, 11.0, 48);
    const circleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, opacity: 0.35, transparent: true });
    const circle = new THREE.Mesh(circleGeo, circleMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.y = 0.01;
    scene.add(circle);

    // Pitch Strip (Clay Red-Brown)
    const pitchGeo = new THREE.PlaneGeometry(2.4, 12.0);
    const pitchMat = new THREE.MeshStandardMaterial({
      color: 0xc27847,
      roughness: 0.9,
      metalness: 0.05,
    });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 0.02;
    pitch.receiveShadow = true;
    scene.add(pitch);

    // Crease Markings (Popping Crease & Bowling Crease)
    const creaseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const createCrease = (zPos: number) => {
      const creaseGeo = new THREE.PlaneGeometry(2.2, 0.08);
      const crease = new THREE.Mesh(creaseGeo, creaseMat);
      crease.rotation.x = -Math.PI / 2;
      crease.position.set(0, 0.03, zPos);
      scene.add(crease);
    };
    createCrease(-4.8); // Striker crease
    createCrease(4.8);  // Non-striker crease

    // 3D Stumps and Bails at both ends
    const stumpMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });
    const createStumps = (zPos: number) => {
      const group = new THREE.Group();
      [-0.18, 0, 0.18].forEach(xOff => {
        const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8), stumpMat);
        s.position.set(xOff, 0.375, 0);
        s.castShadow = true;
        group.add(s);
      });
      // Bail
      const bail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 6), stumpMat);
      bail.rotation.z = Math.PI / 2;
      bail.position.set(0, 0.76, 0);
      group.add(bail);

      group.position.set(0, 0, zPos);
      scene.add(group);
    };
    createStumps(-5.2);
    createStumps(5.2);

    // 4. Create 11 3D Player Avatars
    playerMeshesRef.current.clear();
    const teamColorThree = new THREE.Color(franchiseColor);

    DEFAULT_FIELD_POSITIONS.forEach((pos, idx) => {
      const playerGroup = new THREE.Group();
      playerGroup.position.set(pos.x, 0, pos.z);

      // Player Base Ring
      const ringGeo = new THREE.RingGeometry(0.45, 0.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: teamColorThree,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      ring.name = 'ring';
      playerGroup.add(ring);

      // Player 3D Figurine Body (Jersey)
      const bodyGeo = new THREE.CylinderGeometry(0.22, 0.3, 0.75, 12);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: teamColorThree,
        roughness: 0.3,
        metalness: 0.4,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.55;
      body.castShadow = true;
      playerGroup.add(body);

      // Player Head / Helmet
      const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a, // Dark Navy Helmet
        roughness: 0.2,
        metalness: 0.5,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.05;
      head.castShadow = true;
      playerGroup.add(head);

      // Number badge floating over player
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = franchiseColor;
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${idx + 1}`, 32, 32);
      }
      const labelTex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: labelTex });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 1.5, 0);
      sprite.scale.set(0.7, 0.7, 0.7);
      playerGroup.add(sprite);

      scene.add(playerGroup);

      const assignedPlayer = players[idx];
      const pId = assignedPlayer?.id || `slot-${idx}`;
      playerMeshesRef.current.set(pId, playerGroup);
    });

    // 5. Striker Batsman at crease (Opponent / In-play indicator)
    const strikerGroup = new THREE.Group();
    strikerGroup.position.set(0.3, 0, -4.5);
    const batBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.3, 0.75, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
    );
    batBody.position.y = 0.55;
    strikerGroup.add(batBody);
    const batHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 })
    );
    batHead.position.y = 1.05;
    strikerGroup.add(batHead);

    // 3D Wooden Bat
    const batGeo = new THREE.BoxGeometry(0.1, 0.8, 0.04);
    const batMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const bat = new THREE.Mesh(batGeo, batMat);
    bat.position.set(0.3, 0.4, 0.1);
    bat.rotation.z = -0.3;
    strikerGroup.add(bat);

    scene.add(strikerGroup);

    // 6. Interactive Touch Orbit Controls
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let targetAngle = 0;
    let currentAngle = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsRotating(false);
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      targetAngle += deltaX * 0.008;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Raycaster for tapping players in 3D
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = canvasDom.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        // Find which player group was clicked
        for (const hit of intersects) {
          let current: THREE.Object3D | null = hit.object;
          while (current && current.parent !== scene) {
            current = current.parent;
          }
          if (current) {
            for (const [pId, grp] of playerMeshesRef.current.entries()) {
              if (grp === current && onSelectPlayer) {
                onSelectPlayer(pId);
                return;
              }
            }
          }
        }
      }
    };
    canvasDom.addEventListener('click', handleClick);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow gentle stadium orbit if not manually dragging
      if (isRotating && !isDragging) {
        targetAngle += 0.002;
      }

      currentAngle += (targetAngle - currentAngle) * 0.08;

      // Camera view positioning
      if (cameraView === '3D') {
        const radius = 24;
        camera.position.x = Math.sin(currentAngle) * radius;
        camera.position.z = Math.cos(currentAngle) * radius;
        camera.position.y = 17;
        camera.lookAt(0, 0, 0);
      } else if (cameraView === 'TOP') {
        camera.position.set(0, 28, 0.01);
        camera.lookAt(0, 0, 0);
      } else if (cameraView === 'KEEPER') {
        camera.position.set(0, 3.5, -12);
        camera.lookAt(0, 1.2, 5);
      }

      // Selected player pulsating bounce
      if (selectedPlayerId) {
        const selectedGroup = playerMeshesRef.current.get(selectedPlayerId);
        if (selectedGroup) {
          selectedGroup.position.y = Math.sin(elapsed * 6) * 0.15;
          const ring = selectedGroup.getObjectByName('ring') as THREE.Mesh;
          if (ring && ring.material) {
            (ring.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsed * 8) * 0.4;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvasDom.removeEventListener('click', handleClick);
      renderer.dispose();
      scene.clear();
    };
  }, [franchiseColor, cameraView, isRotating, players, selectedPlayerId, onSelectPlayer]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-slate-950/90 shadow-2xl">
      {/* 3D Canvas Mount */}
      <div 
        ref={mountRef} 
        className="w-full h-64 sm:h-80 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Overlay Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span 
            className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase text-slate-950 shadow-lg flex items-center gap-1.5"
            style={{ backgroundColor: franchiseColor }}
          >
            <span>3D FIELD</span>
            <span>•</span>
            <span>{franchiseShort} TACTICAL</span>
          </span>
          <span className="text-[10px] font-mono text-gray-400 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md hidden sm:inline">
            Drag to Orbit 360°
          </span>
        </div>

        {/* Camera Angle Selector Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/15 pointer-events-auto backdrop-blur-md shadow-lg">
          <button
            onClick={() => setCameraView('3D')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${
              cameraView === '3D' ? 'bg-amber-400 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            3D Orbit
          </button>
          <button
            onClick={() => setCameraView('TOP')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${
              cameraView === 'TOP' ? 'bg-amber-400 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Top Radar
          </button>
          <button
            onClick={() => setCameraView('KEEPER')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-black transition-all cursor-pointer ${
              cameraView === 'KEEPER' ? 'bg-amber-400 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Keeper Cam
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[10px] font-mono text-gray-400 pointer-events-none">
        <span className="flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>11 Fielders Synchronized</span>
        </span>
        <span className="text-gray-400">
          Tap player figurine to inspect
        </span>
      </div>
    </div>
  );
}
