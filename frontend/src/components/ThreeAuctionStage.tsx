'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Gavel, Sparkles, Zap, Shield, IndianRupee } from 'lucide-react';

interface ThreeAuctionStageProps {
  currentBid?: number;
  highestBidder?: string;
  bidderColor?: string;
  gavelPhase?: 'bidding' | 'going_once' | 'going_twice' | 'sold';
  playerName?: string;
  playerRole?: string;
}

export default function ThreeAuctionStage({
  currentBid = 2.0,
  highestBidder = 'BCCI Auctioneer',
  bidderColor = '#f59e0b',
  gavelPhase = 'bidding',
  playerName = 'Player Lot',
  playerRole = 'BAT',
}: ThreeAuctionStageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const gavelGroupRef = useRef<THREE.Group | null>(null);
  const shockwaveRingsRef = useRef<THREE.Mesh[]>([]);
  const sparkPointsRef = useRef<THREE.Points | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseXRef = useRef<number>(0);
  const rotYRef = useRef<number>(0);

  // Gavel animation progress (0 = resting on block, 1 = raised high)
  const gavelAnimT = useRef<number>(0);
  const isStrikingRef = useRef<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 260;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.8);
    camera.lookAt(0, 1.2, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0x2a364f, 1.0);
    scene.add(ambientLight);

    // Overhead Auction Spotlight
    const spotLight = new THREE.SpotLight(0xfff5e6, 3.5, 30, Math.PI / 4, 0.4, 1.0);
    spotLight.position.set(0, 8, 4);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);

    // Team Accent Rim Light
    const accentLight = new THREE.PointLight(new THREE.Color(bidderColor), 2.5, 12);
    accentLight.position.set(0, 0.5, 3.5);
    scene.add(accentLight);

    // 5. 3D Stage Group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Materials
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x58240d, // Polished dark mahogany
      roughness: 0.35,
      metalness: 0.15,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
    });

    // Circular Auction Stage Pedestal
    const stageGeo = new THREE.CylinderGeometry(2.8, 3.1, 0.6, 48);
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.3;
    stage.receiveShadow = true;
    stageGroup.add(stage);

    // Gold Pedestal Ring
    const goldRingGeo = new THREE.TorusGeometry(2.82, 0.06, 16, 48);
    const goldRing = new THREE.Mesh(goldRingGeo, goldMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = 0.01;
    stageGroup.add(goldRing);

    // Sound Block (Circular strike disc where gavel hits)
    const blockGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.22, 32);
    const soundBlock = new THREE.Mesh(blockGeo, woodMat);
    soundBlock.position.set(0, 0.11, 0);
    soundBlock.receiveShadow = true;
    soundBlock.castShadow = true;
    stageGroup.add(soundBlock);

    // Sound Block Brass Inlay Ring
    const brassRingGeo = new THREE.TorusGeometry(0.86, 0.04, 12, 32);
    const brassRing = new THREE.Mesh(brassRingGeo, goldMat);
    brassRing.rotation.x = Math.PI / 2;
    brassRing.position.y = 0.22;
    stageGroup.add(brassRing);

    // 6. 3D Wooden Auctioneer's Gavel
    const gavelGroup = new THREE.Group();
    gavelGroup.position.set(0, 0.35, 0);
    stageGroup.add(gavelGroup);
    gavelGroupRef.current = gavelGroup;

    // Gavel Mallet Head (Double-ended cylinder)
    const malletGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.9, 24);
    const mallet = new THREE.Mesh(malletGeo, woodMat);
    mallet.rotation.z = Math.PI / 2;
    mallet.position.set(0, 0.24, 0);
    mallet.castShadow = true;
    gavelGroup.add(mallet);

    // Brass Caps on Mallet Ends
    const capGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 24);
    const leftCap = new THREE.Mesh(capGeo, goldMat);
    leftCap.rotation.z = Math.PI / 2;
    leftCap.position.set(-0.45, 0.24, 0);
    gavelGroup.add(leftCap);

    const rightCap = new THREE.Mesh(capGeo, goldMat);
    rightCap.rotation.z = Math.PI / 2;
    rightCap.position.set(0.45, 0.24, 0);
    gavelGroup.add(rightCap);

    // Gavel Handle (Slender turned wood)
    const handleGeo = new THREE.CylinderGeometry(0.065, 0.09, 1.8, 16);
    const handle = new THREE.Mesh(handleGeo, woodMat);
    handle.position.set(0, 0.24, 0.9);
    handle.rotation.x = Math.PI / 2;
    handle.castShadow = true;
    gavelGroup.add(handle);

    // Handle Gold Pommel Grip
    const pommelGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const pommel = new THREE.Mesh(pommelGeo, goldMat);
    pommel.position.set(0, 0.24, 1.8);
    gavelGroup.add(pommel);

    // 7. Shockwave Rings (Emit on "SOLD" hammer strike)
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(0.9, 1.05, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(bidderColor),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const shockwave = new THREE.Mesh(ringGeo, ringMat);
      shockwave.rotation.x = -Math.PI / 2;
      shockwave.position.y = 0.24;
      stageGroup.add(shockwave);
      shockwaveRingsRef.current.push(shockwave);
    }

    // 8. Sparkle Particles on Gavel Strike
    const sparkCount = 60;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount * 3; i += 3) {
      sparkPos[i] = 0;
      sparkPos[i + 1] = -50; // hidden
      sparkPos[i + 2] = 0;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    stageGroup.add(sparks);
    sparkPointsRef.current = sparks;

    // 9. Interactive Drag to Orbit
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMouseXRef.current = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMouseXRef.current;
      prevMouseXRef.current = e.clientX;
      rotYRef.current += deltaX * 0.012;
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 10. Animation Loop
    let strikeTimer = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Subtle slow orbit when idle
      if (!isDraggingRef.current) {
        rotYRef.current += 0.005;
      }
      stageGroup.rotation.y = rotYRef.current;

      // Animate Gavel Based on Phase
      if (gavelGroupRef.current) {
        let targetAngle = 0;
        let targetY = 0.35;

        if (gavelPhase === 'going_once') {
          targetAngle = -0.35; // raised slightly
          targetY = 0.7;
        } else if (gavelPhase === 'going_twice') {
          targetAngle = -0.7; // raised high, ready to hammer down!
          targetY = 1.1;
        } else if (gavelPhase === 'sold') {
          strikeTimer += 0.08;
          // Strike bounce physics
          if (strikeTimer < 0.6) {
            targetAngle = 0; // struck down!
            targetY = 0.28;
            isStrikingRef.current = true;
          } else {
            targetAngle = -0.15;
            targetY = 0.45;
          }
        } else {
          strikeTimer = 0;
          targetAngle = 0;
          targetY = 0.35;
        }

        gavelGroupRef.current.rotation.x = THREE.MathUtils.lerp(gavelGroupRef.current.rotation.x, targetAngle, 0.2);
        gavelGroupRef.current.position.y = THREE.MathUtils.lerp(gavelGroupRef.current.position.y, targetY, 0.2);
      }

      // Animate Shockwave Rings on SOLD
      if (gavelPhase === 'sold') {
        shockwaveRingsRef.current.forEach((ring, idx) => {
          const s = 1.0 + ((Date.now() * 0.004 + idx * 0.5) % 2.5);
          ring.scale.set(s, s, s);
          const mat = ring.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, 1 - (s - 1.0) / 1.5);
        });
      } else {
        shockwaveRingsRef.current.forEach(ring => {
          (ring.material as THREE.MeshBasicMaterial).opacity = 0;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth || 340;
      const nh = container.clientHeight || 260;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [bidderColor, gavelPhase]);

  return (
    <div className="relative w-full h-[220px] sm:h-[260px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 border border-white/10 shadow-2xl group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Auction HUD */}
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/40 text-[10px] font-mono text-amber-300 pointer-events-none shadow-lg">
        <Gavel size={12} className={gavelPhase === 'sold' ? 'text-rose-500 animate-bounce' : 'text-amber-400'} />
        <span className="font-black uppercase tracking-wider">
          {gavelPhase === 'sold' ? '🔨 HAMMER STRUCK • SOLD!' : gavelPhase === 'going_twice' ? '⚠️ GOING TWICE!' : gavelPhase === 'going_once' ? '⏳ GOING ONCE...' : 'LIVE AUCTION STAGE'}
        </span>
      </div>

      {/* Center 3D Floating Bid Bubble */}
      <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none text-xs font-mono">
        <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 shadow-xl">
          <span className="text-[10px] text-gray-400">Top Bidder:</span>
          <strong className="text-white text-xs truncate max-w-[120px]">{highestBidder}</strong>
        </div>

        <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-amber-600/30 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-500/50 shadow-xl">
          <IndianRupee size={12} className="text-amber-400" />
          <span className="font-black text-amber-300 text-sm">{currentBid.toFixed(2)} Cr</span>
        </div>
      </div>
    </div>
  );
}
