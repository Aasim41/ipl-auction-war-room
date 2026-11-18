'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeSquadLockerProps {
  franchiseColor?: string;
  franchiseShort?: string;
  totalPlayers?: number;
  activeRole?: string;
}

export function ThreeSquadLocker({
  franchiseColor = '#fbbf24',
  franchiseShort = 'CSK',
  totalPlayers = 25,
  activeRole = 'ALL',
}: ThreeSquadLockerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 220;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 14);
    camera.lookAt(0, 1.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    container.replaceChildren(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const teamPoint = new THREE.PointLight(new THREE.Color(franchiseColor), 3.5, 25);
    teamPoint.position.set(0, 5, 2);
    scene.add(teamPoint);

    const spotOverhead = new THREE.SpotLight(0xffffff, 2.5, 30, Math.PI / 4, 0.4);
    spotOverhead.position.set(0, 10, 0);
    spotOverhead.target.position.set(0, 0, 0);
    scene.add(spotOverhead);
    scene.add(spotOverhead.target);

    // 3. Vault Floor & Back Wall
    const floorGeo = new THREE.PlaneGeometry(24, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.2,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Metallic Lockers in background
    const lockerGroup = new THREE.Group();
    lockerGroup.position.set(0, 0, -4);

    const lockerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3,
    });
    const neonLockerMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(franchiseColor) });

    for (let i = -4; i <= 4; i++) {
      const locker = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.8, 0.8), lockerMat);
      locker.position.set(i * 1.5, 1.9, 0);
      locker.castShadow = true;
      lockerGroup.add(locker);

      // Accent strip
      const strip = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.08, 0.02), neonLockerMat);
      strip.position.set(i * 1.5, 3.2, 0.42);
      lockerGroup.add(strip);
    }
    scene.add(lockerGroup);

    // 4. Central Vault Star Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(2.4, 2.8, 0.6, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.15,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.3;
    scene.add(pedestal);

    // Glowing Pedestal Ring
    const ringGeo = new THREE.TorusGeometry(2.5, 0.08, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(franchiseColor) });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.62;
    scene.add(ring);

    // 5. 3D Floating Hologram Star / Crystal
    const crystalGeo = new THREE.OctahedronGeometry(1.2, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(franchiseColor),
      emissive: new THREE.Color(franchiseColor),
      emissiveIntensity: 0.3,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.7,
      thickness: 1.0,
      transparent: true,
      opacity: 0.9,
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 2.4;
    scene.add(crystal);

    // Floating 3D Gold Championship Stars orbiting the crystal
    const starsGroup = new THREE.Group();
    starsGroup.position.set(0, 2.4, 0);

    const starGeo = new THREE.TetrahedronGeometry(0.25, 0);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.95, roughness: 0.1 });
    const starCount = 5;
    for (let i = 0; i < starCount; i++) {
      const s = new THREE.Mesh(starGeo, starMat);
      const angle = (i / starCount) * Math.PI * 2;
      s.position.set(Math.cos(angle) * 2.0, 0, Math.sin(angle) * 2.0);
      starsGroup.add(s);
    }
    scene.add(starsGroup);

    // 6. Interactive Drag Orbit
    let isDragging = false;
    let prevX = 0;
    let targetAngle = 0;
    let currentAngle = 0;

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('pointerdown', (e) => {
      isDragging = true;
      setIsRotating(false);
      prevX = e.clientX;
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      targetAngle += (e.clientX - prevX) * 0.008;
      prevX = e.clientX;
    });
    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    // 7. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (isRotating && !isDragging) {
        targetAngle += 0.004;
      }
      currentAngle += (targetAngle - currentAngle) * 0.08;

      camera.position.x = Math.sin(currentAngle) * 14;
      camera.position.z = Math.cos(currentAngle) * 14;
      camera.position.y = 5.0 + Math.sin(currentAngle * 0.5) * 1.0;
      camera.lookAt(0, 1.8, 0);

      // Rotate central crystal and stars
      crystal.rotation.y = elapsed * 1.2;
      crystal.rotation.x = Math.sin(elapsed) * 0.3;
      crystal.position.y = 2.4 + Math.sin(elapsed * 2) * 0.15;

      starsGroup.rotation.y = -elapsed * 0.8;

      renderer.render(scene, camera);
    };

    animate();

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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [franchiseColor, franchiseShort, totalPlayers, activeRole, isRotating]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-slate-950/90 shadow-2xl">
      <div 
        ref={mountRef} 
        className="w-full h-52 sm:h-64 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Overlay Badge */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span 
            className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase text-slate-950 shadow-md flex items-center gap-1.5"
            style={{ backgroundColor: franchiseColor }}
          >
            <span>🏆 SQUAD VAULT</span>
            <span>•</span>
            <span>{franchiseShort}</span>
          </span>
          <span className="text-[10px] font-mono text-gray-400 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-white/10 hidden sm:inline">
            Drag to Inspect 360°
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/15 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md">
          <span className="text-amber-400 font-bold">{totalPlayers} Contracts Active</span>
        </div>
      </div>

      {/* Bottom Status Ticker */}
      <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[10px] font-mono text-gray-400 pointer-events-none">
        <span className="bg-slate-900/80 px-2 py-0.5 rounded-md border border-white/5">
          Role Filter: <span className="text-white font-bold">{activeRole}</span>
        </span>
        <span className="text-emerald-400 font-bold">
          ✓ Full Squad Roster Ready
        </span>
      </div>
    </div>
  );
}
