'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeTradeTableProps {
  myColor?: string;
  myShort?: string;
  rivalColor?: string;
  rivalShort?: string;
  cashDelta?: number;
  dealStatus?: 'pending' | 'agreed' | 'rejected';
}

export function ThreeTradeTable({
  myColor = '#fbbf24',
  myShort = 'CSK',
  rivalColor = '#3b82f6',
  rivalShort = 'MI',
  cashDelta = 0,
  dealStatus = 'pending',
}: ThreeTradeTableProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 240;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    container.replaceChildren(renderer.domElement);

    // 2. Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointMy = new THREE.PointLight(new THREE.Color(myColor), 3, 20);
    pointMy.position.set(-5, 4, 0);
    scene.add(pointMy);

    const pointRival = new THREE.PointLight(new THREE.Color(rivalColor), 3, 20);
    pointRival.position.set(5, 4, 0);
    scene.add(pointRival);

    // 3. Central War Table Base (Dark Obsidian & Metal)
    const tableGeo = new THREE.CylinderGeometry(8.5, 9.0, 0.6, 48);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
    });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = -0.3;
    table.receiveShadow = true;
    scene.add(table);

    // Holographic Grid Rings on table surface
    const ringGeo1 = new THREE.RingGeometry(6.5, 6.7, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, opacity: 0.4, transparent: true, side: THREE.DoubleSide });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = 0.02;
    scene.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(3.5, 3.65, 36);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xa855f7, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.03;
    scene.add(ring2);

    // 4. Two Team Pedestals (Left = My Franchise, Right = Rival Franchise)
    const createTeamPedestal = (xPos: number, colorHex: string, shortLabel: string) => {
      const group = new THREE.Group();
      group.position.set(xPos, 0, 0);

      // Base Pedestal
      const baseGeo = new THREE.CylinderGeometry(2.0, 2.3, 0.8, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.7,
        roughness: 0.3,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.4;
      group.add(base);

      // Neon Accent Ring
      const neonGeo = new THREE.TorusGeometry(2.1, 0.08, 16, 48);
      const neonMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(colorHex) });
      const neon = new THREE.Mesh(neonGeo, neonMat);
      neon.rotation.x = Math.PI / 2;
      neon.position.y = 0.82;
      group.add(neon);

      // Floating 3D Team Crest Emblem Token
      const emblemGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.25, 32);
      const emblemMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        metalness: 0.9,
        roughness: 0.2,
      });
      const emblem = new THREE.Mesh(emblemGeo, emblemMat);
      emblem.position.y = 2.0;
      emblem.rotation.x = 0.4;
      emblem.name = 'emblem';
      group.add(emblem);

      // Text Sprite for Team Short Code
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = colorHex;
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shortLabel, 64, 32);
      }
      const labelTex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: labelTex });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, 3.2, 0);
      sprite.scale.set(1.8, 0.9, 1);
      group.add(sprite);

      scene.add(group);
      return group;
    };

    const myPedestal = createTeamPedestal(-4.5, myColor, myShort);
    const rivalPedestal = createTeamPedestal(4.5, rivalColor, rivalShort);

    // 5. Central 3D Energy Trade Portal
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 1.2, 0);

    const portalCoreGeo = new THREE.SphereGeometry(0.7, 24, 24);
    const portalCoreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const portalCore = new THREE.Mesh(portalCoreGeo, portalCoreMat);
    portalGroup.add(portalCore);

    // Rotating Gyro Rings
    const gyro1Geo = new THREE.TorusGeometry(1.4, 0.05, 16, 48);
    const gyro1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: false });
    const gyro1 = new THREE.Mesh(gyro1Geo, gyro1Mat);
    portalGroup.add(gyro1);

    const gyro2Geo = new THREE.TorusGeometry(1.8, 0.05, 16, 48);
    const gyro2Mat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: false });
    const gyro2 = new THREE.Mesh(gyro2Geo, gyro2Mat);
    portalGroup.add(gyro2);

    scene.add(portalGroup);

    // 6. Particle Energy Bridge (Transfer flow)
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(myColor);
    const c2 = new THREE.Color(rivalColor);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      positions[i * 3] = -4.5 + t * 9.0;
      positions[i * 3 + 1] = 1.2 + Math.sin(t * Math.PI) * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;

      const mixed = c1.clone().lerp(c2, t);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Interactive Pointer Drag to Orbit
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

    // 8. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (isRotating && !isDragging) {
        targetAngle += 0.004;
      }
      currentAngle += (targetAngle - currentAngle) * 0.08;

      camera.position.x = Math.sin(currentAngle) * 15;
      camera.position.z = Math.cos(currentAngle) * 15;
      camera.position.y = 8 + Math.sin(currentAngle * 0.5) * 1.5;
      camera.lookAt(0, 1.0, 0);

      // Rotate portal gyro rings
      gyro1.rotation.x = elapsed * 1.2;
      gyro1.rotation.y = elapsed * 0.9;
      gyro2.rotation.y = -elapsed * 1.0;
      gyro2.rotation.z = elapsed * 0.7;

      // Floating emblems
      const myEmblem = myPedestal.getObjectByName('emblem');
      if (myEmblem) {
        myEmblem.rotation.y = elapsed * 1.5;
        myEmblem.position.y = 2.0 + Math.sin(elapsed * 2) * 0.15;
      }
      const rivalEmblem = rivalPedestal.getObjectByName('emblem');
      if (rivalEmblem) {
        rivalEmblem.rotation.y = -elapsed * 1.5;
        rivalEmblem.position.y = 2.0 + Math.sin(elapsed * 2 + 1) * 0.15;
      }

      // Pulse particle positions along bridge
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        let x = arr[i * 3];
        x += 0.08;
        if (x > 4.5) x = -4.5;
        arr[i * 3] = x;
        const norm = (x + 4.5) / 9.0;
        arr[i * 3 + 1] = 1.2 + Math.sin(norm * Math.PI) * 1.5 + Math.sin(elapsed * 4 + i) * 0.1;
      }
      posAttr.needsUpdate = true;

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
  }, [myColor, myShort, rivalColor, rivalShort, cashDelta, dealStatus, isRotating]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-slate-950/90 shadow-2xl">
      <div 
        ref={mountRef} 
        className="w-full h-56 sm:h-72 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Overlay Badge */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/15 text-[10px] font-mono font-bold text-amber-300 shadow-md backdrop-blur-md">
            ⚡ 3D WAR ROOM TABLE
          </span>
          <span className="text-[10px] font-mono text-gray-400 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-white/10 hidden sm:inline">
            Drag to Rotate 360°
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/15 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white">{myShort} ⇄ {rivalShort}</span>
        </div>
      </div>

      {/* Bottom Status Ticker */}
      <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[10px] font-mono text-gray-400 pointer-events-none">
        <span className="bg-slate-900/80 px-2 py-0.5 rounded-md border border-white/5">
          {cashDelta !== 0 ? `Purse Flow: ₹${Math.abs(cashDelta).toFixed(1)} Cr` : 'Player-for-Player Exchange'}
        </span>
        <span className="text-amber-400 font-bold uppercase">
          {dealStatus === 'agreed' ? '✓ Trade Term Accepted' : 'Trade Matrix Active'}
        </span>
      </div>
    </div>
  );
}
