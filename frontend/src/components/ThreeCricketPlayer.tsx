'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeCricketPlayerProps {
  franchiseColor?: string;
  franchiseShort?: string;
  playerName?: string;
  role?: 'BAT' | 'BOWL' | 'AR' | 'WK';
  jerseyNumber?: number;
  height?: number;
}

export function ThreeCricketPlayer({
  franchiseColor = '#fbbf24',
  franchiseShort = 'CSK',
  playerName = 'Icon Striker',
  role = 'BAT',
  jerseyNumber = 7,
  height = 320,
}: ThreeCricketPlayerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentPose, setCurrentPose] = useState<'stance' | 'drive' | 'appeal'>('stance');
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const viewHeight = height;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = null; // Transparent so it floats seamlessly on the card/stage!

    const camera = new THREE.PerspectiveCamera(40, width / viewHeight, 0.1, 50);
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 2.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, viewHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 2. Realistic Stadium Floodlight Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Light (Stadium Mast 1)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Rim/Back Light (Stadium Mast 2) for dramatic character silhouette edge
    const rimLight = new THREE.DirectionalLight(new THREE.Color(franchiseColor), 2.5);
    rimLight.position.set(-5, 6, -5);
    scene.add(rimLight);

    // Warm Under-bounce light from turf pitch
    const turfBounce = new THREE.PointLight(0x15803d, 1.2, 8);
    turfBounce.position.set(0, 0.5, 2);
    scene.add(turfBounce);

    // 3. Circular Turf & Crease Display Pedestal
    const pedestalGroup = new THREE.Group();

    // Turf disk
    const turfGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.35, 48);
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.8,
      metalness: 0.1,
    });
    const turf = new THREE.Mesh(turfGeo, turfMat);
    turf.position.y = -0.175;
    turf.receiveShadow = true;
    pedestalGroup.add(turf);

    // Clay pitch strip across turf
    const clayGeo = new THREE.PlaneGeometry(1.2, 3.2);
    const clayMat = new THREE.MeshStandardMaterial({ color: 0xba7947, roughness: 0.9 });
    const clay = new THREE.Mesh(clayGeo, clayMat);
    clay.rotation.x = -Math.PI / 2;
    clay.position.y = 0.01;
    clay.receiveShadow = true;
    pedestalGroup.add(clay);

    // White Crease Line
    const creaseGeo = new THREE.PlaneGeometry(1.2, 0.08);
    const creaseMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const crease = new THREE.Mesh(creaseGeo, creaseMat);
    crease.rotation.x = -Math.PI / 2;
    crease.position.set(0, 0.02, 0.4);
    pedestalGroup.add(crease);

    // Glowing Neon Team Ring at edge
    const ringGeo = new THREE.TorusGeometry(2.5, 0.05, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(franchiseColor) });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    pedestalGroup.add(ring);

    scene.add(pedestalGroup);

    // 4. Fully Articulated 3D Cricket Player Character
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, 0, 0.3);

    const teamMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(franchiseColor),
      metalness: 0.4,
      roughness: 0.4,
    });
    const navyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.6,
      roughness: 0.3,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.2,
      roughness: 0.6,
    });
    const goldWillowMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.5,
      metalness: 0.1,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.6,
    });

    // ── Legs with Batting Pads ──
    const createLeg = (xOff: number, zOff: number, angle: number) => {
      const legGrp = new THREE.Group();
      legGrp.position.set(xOff, 0, zOff);
      legGrp.rotation.y = angle;

      // Cricket Shoes (Spikes)
      const shoeGeo = new THREE.BoxGeometry(0.24, 0.16, 0.5);
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const shoe = new THREE.Mesh(shoeGeo, shoeMat);
      shoe.position.set(0, 0.08, 0.08);
      shoe.castShadow = true;
      legGrp.add(shoe);

      // Batting Pad (Molded protection with knee roll)
      const padGeo = new THREE.CylinderGeometry(0.18, 0.15, 1.3, 16);
      const pad = new THREE.Mesh(padGeo, whiteMat);
      pad.position.set(0, 0.72, 0);
      pad.scale.set(1.0, 1.0, 0.7);
      pad.castShadow = true;
      legGrp.add(pad);

      // Knee roll bulge
      const kneeGeo = new THREE.SphereGeometry(0.19, 16, 12);
      const knee = new THREE.Mesh(kneeGeo, whiteMat);
      knee.position.set(0, 1.15, 0.05);
      knee.scale.set(1.0, 0.6, 0.8);
      legGrp.add(knee);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.8, 16);
      const thigh = new THREE.Mesh(thighGeo, whiteMat);
      thigh.position.set(0, 1.7, 0);
      thigh.castShadow = true;
      legGrp.add(thigh);

      return legGrp;
    };

    const leftLeg = createLeg(-0.35, -0.15, 0.2);
    const rightLeg = createLeg(0.35, 0.15, -0.2);
    characterGroup.add(leftLeg);
    characterGroup.add(rightLeg);

    // ── Torso (Jersey & Chest) ──
    const torsoGrp = new THREE.Group();
    torsoGrp.position.set(0, 2.1, 0);

    // Torso body
    const torsoGeo = new THREE.CylinderGeometry(0.42, 0.36, 1.15, 16);
    const torso = new THREE.Mesh(torsoGeo, teamMat);
    torso.position.y = 0.58;
    torso.scale.set(1.1, 1.0, 0.8);
    torso.castShadow = true;
    torsoGrp.add(torso);

    // Team side stripe
    const stripeGeo = new THREE.BoxGeometry(0.04, 1.1, 0.6);
    const stripe = new THREE.Mesh(stripeGeo, navyMat);
    stripe.position.set(0.44, 0.58, 0);
    torsoGrp.add(stripe);

    // Jersey Number on back
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${jerseyNumber}`, 64, 64);
    }
    const numTex = new THREE.CanvasTexture(canvas);
    const numMat = new THREE.MeshBasicMaterial({ map: numTex });
    const numMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), numMat);
    numMesh.position.set(0, 0.65, -0.36);
    numMesh.rotation.y = Math.PI;
    torsoGrp.add(numMesh);

    // ── Head & Helmet with Face Grill ──
    const headGrp = new THREE.Group();
    headGrp.position.set(0, 1.25, 0);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.25, 12), skinMat);
    neck.position.y = 0.12;
    headGrp.add(neck);

    // Face / Head
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), skinMat);
    face.position.set(0, 0.35, 0.05);
    headGrp.add(face);

    // Cricket Helmet Outer Shell (Glossy Team/Navy colored)
    const helmetGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const helmet = new THREE.Mesh(helmetGeo, navyMat);
    helmet.position.set(0, 0.42, -0.02);
    helmet.scale.set(1.0, 1.05, 1.1);
    helmet.castShadow = true;
    headGrp.add(helmet);

    // Helmet Peak / Visor Brow
    const peakGeo = new THREE.BoxGeometry(0.48, 0.06, 0.3);
    const peak = new THREE.Mesh(peakGeo, navyMat);
    peak.position.set(0, 0.38, 0.3);
    peak.rotation.x = 0.1;
    headGrp.add(peak);

    // Metal Face Grill
    const grillMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.1 });
    const grillFrame = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 8, 24, Math.PI), grillMat);
    grillFrame.position.set(0, 0.22, 0.3);
    grillFrame.rotation.x = Math.PI;
    headGrp.add(grillFrame);

    torsoGrp.add(headGrp);

    // ── Arms, Gloves & Cricket Bat ──
    const batGrp = new THREE.Group();

    // Left Arm (Top hand on bat)
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.85, 12), teamMat);
    leftArm.position.set(-0.52, 0.65, 0.1);
    leftArm.rotation.set(0.6, 0, 0.4);
    leftArm.castShadow = true;
    torsoGrp.add(leftArm);

    // Right Arm (Bottom hand on bat)
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.85, 12), teamMat);
    rightArm.position.set(0.35, 0.6, 0.25);
    rightArm.rotation.set(0.8, 0, -0.3);
    rightArm.castShadow = true;
    torsoGrp.add(rightArm);

    // Padded Batting Gloves
    const gloveGeo = new THREE.BoxGeometry(0.22, 0.22, 0.26);
    const gloveL = new THREE.Mesh(gloveGeo, whiteMat);
    gloveL.position.set(-0.25, 0.2, 0.45);
    torsoGrp.add(gloveL);

    const gloveR = new THREE.Mesh(gloveGeo, whiteMat);
    gloveR.position.set(-0.08, 0.15, 0.55);
    torsoGrp.add(gloveR);

    // 3D English Willow Cricket Bat
    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.24, 1.4, 0.08);
    const blade = new THREE.Mesh(bladeGeo, goldWillowMat);
    blade.position.set(0, -0.7, 0);
    blade.castShadow = true;
    batGrp.add(blade);

    // Bat Colored Grip Handle
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12);
    const handle = new THREE.Mesh(handleGeo, teamMat);
    handle.position.set(0, 0.25, 0);
    batGrp.add(handle);

    // Bat placement relative to hands
    batGrp.position.set(-0.15, 0.25, 0.5);
    batGrp.rotation.set(-0.2, 0.1, 0.15);
    torsoGrp.add(batGrp);

    characterGroup.add(torsoGrp);
    scene.add(characterGroup);

    // 5. Interactive Touch/Mouse Orbit
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
      targetAngle += (e.clientX - prevX) * 0.01;
      prevX = e.clientX;
    });
    window.addEventListener('pointerup', () => {
      isDragging = false;
    });

    // 6. Animation Loop (Breathing, Bat Tapping, Idle Stance)
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (isRotating && !isDragging) {
        targetAngle += 0.005;
      }
      currentAngle += (targetAngle - currentAngle) * 0.08;

      camera.position.x = Math.sin(currentAngle) * 7.5;
      camera.position.z = Math.cos(currentAngle) * 7.5;
      camera.lookAt(0, 2.3, 0);

      // Natural Cricket Stance Idle Motion
      // 1. Subtle rhythmic torso breathing
      torsoGrp.position.y = 2.1 + Math.sin(elapsed * 2.5) * 0.03;
      torsoGrp.rotation.z = Math.sin(elapsed * 1.5) * 0.02;

      // 2. Head scans down pitch
      headGrp.rotation.y = Math.sin(elapsed * 1.2) * 0.08;

      // 3. Bat tapping on the crease (classic batsman readiness routine)
      if (currentPose === 'stance') {
        const tap = Math.max(0, Math.sin(elapsed * 4));
        batGrp.rotation.x = -0.2 + tap * 0.12;
      }

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
  }, [franchiseColor, franchiseShort, playerName, role, jerseyNumber, height, currentPose, isRotating]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/60 via-[#0a180f]/80 to-slate-950/90 border border-emerald-500/20 shadow-2xl backdrop-blur-md">
      {/* 3D Canvas Mount */}
      <div 
        ref={mountRef} 
        style={{ height: `${height}px` }}
        className="w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Overlay Badges */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span 
            className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase text-slate-950 shadow-md flex items-center gap-1.5"
            style={{ backgroundColor: franchiseColor }}
          >
            <span>🏏 3D CRICKET PRO</span>
            <span>•</span>
            <span>#{jerseyNumber} {franchiseShort}</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30 hidden sm:inline">
            Drag to Rotate 360°
          </span>
        </div>

        <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-white/10 text-[10px] font-mono font-bold text-amber-300 shadow-md pointer-events-auto">
          {playerName}
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="absolute bottom-2 inset-x-3 flex items-center justify-between text-[10px] font-mono text-gray-400 pointer-events-none">
        <span className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-md border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Willow: English Grade 1</span>
        </span>
        <span className="text-amber-400 font-bold uppercase">
          Match Ready Stance
        </span>
      </div>
    </div>
  );
}
