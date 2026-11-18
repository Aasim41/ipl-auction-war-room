'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Trophy, Sparkles, RotateCw } from 'lucide-react';

interface ThreeChampionshipCupProps {
  franchiseColor?: string;
  franchiseShort?: string;
  franchiseName?: string;
}

export default function ThreeChampionshipCup({
  franchiseColor = '#fbbf24',
  franchiseShort = 'IPL',
  franchiseName = 'Indian Premier League',
}: ThreeChampionshipCupProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const prevMouseXRef = useRef<number>(0);
  const rotYRef = useRef<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 280;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // transparent background

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 8.5);
    camera.lookAt(0, 2.2, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Main Golden Key Light
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    keyLight.position.set(5, 10, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cyan Rim Light for dramatic contour
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(-6, 6, -4);
    scene.add(rimLight);

    // Team Accent Fill Light
    const accentLight = new THREE.PointLight(new THREE.Color(franchiseColor), 3.0, 15);
    accentLight.position.set(0, -1, 4);
    scene.add(accentLight);

    // 5. 3D Championship Trophy Group
    const trophyGroup = new THREE.Group();
    trophyGroup.position.y = 0.4;
    scene.add(trophyGroup);

    // Polished 24K Gold Material
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.96,
      roughness: 0.12,
    });

    // Dark Obsidian Pedestal Base
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Base Tier 1 (Lower Octagonal / Cylinder Plinth)
    const base1Geo = new THREE.CylinderGeometry(1.6, 1.8, 0.45, 32);
    const base1 = new THREE.Mesh(base1Geo, baseMat);
    base1.position.y = 0.22;
    base1.castShadow = true;
    base1.receiveShadow = true;
    trophyGroup.add(base1);

    // Gold Inscribed Band
    const bandGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.25, 32);
    const band = new THREE.Mesh(bandGeo, goldMat);
    band.position.y = 0.55;
    trophyGroup.add(band);

    // Base Tier 2 (Upper Plinth)
    const base2Geo = new THREE.CylinderGeometry(1.2, 1.45, 0.4, 32);
    const base2 = new THREE.Mesh(base2Geo, baseMat);
    base2.position.y = 0.85;
    trophyGroup.add(base2);

    // Trophy Stem (Curved Hourglass Pillar)
    const stemGeo = new THREE.CylinderGeometry(0.45, 0.65, 1.4, 32);
    const stem = new THREE.Mesh(stemGeo, goldMat);
    stem.position.y = 1.7;
    trophyGroup.add(stem);

    // Stem Ring Ornament (Team-colored jewel ring)
    const ringGeo = new THREE.TorusGeometry(0.68, 0.1, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(franchiseColor),
      metalness: 0.9,
      roughness: 0.2,
      emissive: new THREE.Color(franchiseColor),
      emissiveIntensity: 0.3,
    });
    const jewelRing = new THREE.Mesh(ringGeo, ringMat);
    jewelRing.rotation.x = Math.PI / 2;
    jewelRing.position.y = 1.7;
    trophyGroup.add(jewelRing);

    // Trophy Chalice Bowl (Wide Flared Golden Cup)
    const bowlGeo = new THREE.CylinderGeometry(1.7, 0.45, 1.6, 32, 1, false);
    const bowl = new THREE.Mesh(bowlGeo, goldMat);
    bowl.position.y = 3.1;
    bowl.castShadow = true;
    trophyGroup.add(bowl);

    // Inner Cup Glow Sphere
    const innerGeo = new THREE.SphereGeometry(1.3, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(franchiseColor),
      transparent: true,
      opacity: 0.35,
    });
    const innerGlow = new THREE.Mesh(innerGeo, innerMat);
    innerGlow.position.y = 3.5;
    trophyGroup.add(innerGlow);

    // Ornate Curved Handles (Left and Right Torus arcs)
    const handleGeo = new THREE.TorusGeometry(0.75, 0.1, 16, 32, Math.PI * 1.1);
    
    // Left Handle
    const leftHandle = new THREE.Mesh(handleGeo, goldMat);
    leftHandle.position.set(-1.45, 3.1, 0);
    leftHandle.rotation.z = Math.PI * 0.45;
    trophyGroup.add(leftHandle);

    // Right Handle
    const rightHandle = new THREE.Mesh(handleGeo, goldMat);
    rightHandle.position.set(1.45, 3.1, 0);
    rightHandle.rotation.z = -Math.PI * 0.45;
    rightHandle.rotation.y = Math.PI;
    trophyGroup.add(rightHandle);

    // Trophy Lid Dome & Star Finial
    const domeGeo = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4);
    const dome = new THREE.Mesh(domeGeo, goldMat);
    dome.position.y = 3.8;
    trophyGroup.add(dome);

    // Golden Cricket Ball Crown on Top
    const ballGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const ballCrown = new THREE.Mesh(ballGeo, goldMat);
    ballCrown.position.y = 4.7;
    trophyGroup.add(ballCrown);

    // Seam band on cricket ball crown
    const seamGeo = new THREE.TorusGeometry(0.36, 0.03, 12, 24);
    const seamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const seam = new THREE.Mesh(seamGeo, seamMat);
    seam.rotation.x = Math.PI / 4;
    seam.position.y = 4.7;
    trophyGroup.add(seam);

    // 6. Floating Sparkles / Embers
    const sparkleCount = 90;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    const sparkleVel: number[] = [];

    for (let i = 0; i < sparkleCount; i++) {
      sparklePos[i * 3] = (Math.random() - 0.5) * 5.0;
      sparklePos[i * 3 + 1] = Math.random() * 5.5;
      sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
      sparkleVel.push(0.008 + Math.random() * 0.015);
    }

    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.14,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    scene.add(sparkles);

    // 7. Interactive Touch / Mouse Drag
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

    // 8. Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Auto rotation when not dragging
      if (!isDraggingRef.current && autoRotate) {
        rotYRef.current += 0.008;
      }
      trophyGroup.rotation.y = rotYRef.current;

      // Gentle floating bob
      trophyGroup.position.y = 0.4 + Math.sin(Date.now() * 0.0018) * 0.12;

      // Animate floating embers upward
      const posAttr = sparkleGeo.attributes.position as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;
      for (let i = 0; i < sparkleCount; i++) {
        pArr[i * 3 + 1] += sparkleVel[i];
        if (pArr[i * 3 + 1] > 6.0) {
          pArr[i * 3 + 1] = 0.1;
          pArr[i * 3] = (Math.random() - 0.5) * 5.0;
          pArr[i * 3 + 2] = (Math.random() - 0.5) * 5.0;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const nw = container.clientWidth || 340;
      const nh = container.clientHeight || 280;
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
  }, [franchiseColor, autoRotate]);

  return (
    <div className="relative w-full h-[260px] sm:h-[300px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)] group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Badge */}
      <div className="absolute top-2.5 left-3 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/40 text-[10px] font-mono text-amber-300 pointer-events-none shadow-lg">
        <Trophy size={12} className="text-amber-400 animate-pulse" />
        <span className="font-black tracking-wider uppercase">IPL CHAMPIONSHIP CUP</span>
      </div>

      {/* 3D Orbit Hint & Auto-rotate Toggle */}
      <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-full border text-[10px] font-mono transition-all cursor-pointer ${
            autoRotate
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-white/10 text-gray-400'
          }`}
          title={autoRotate ? 'Pause 3D Spin' : 'Resume 3D Spin'}
        >
          <RotateCw size={12} className={autoRotate ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Bottom Floating Plaque */}
      <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none text-[10px] font-mono text-gray-400">
        <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-white/10 backdrop-blur-sm">
          🖐 Drag to inspect 3D Trophy
        </span>
        <span className="text-amber-400 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-sm">
          🏆 Goal: 2027 Glory
        </span>
      </div>
    </div>
  );
}
