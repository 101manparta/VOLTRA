/**
 * VOLTRA AI Office — Three.js 3D Virtual Software Engineering Office
 * 
 * 60 FPS lightweight, high-aesthetic 3D workspace rendering 6 AI Software Engineering agents
 * with procedural desks, multi-monitor consoles, dynamic typing/thinking animations,
 * interactive raycasting, and smooth camera presets.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OFFICE_ZONES } from '../data/initialAgents';
import { AgentState, CameraPreset } from '../types';

interface ThreeOfficeSceneProps {
  agents: AgentState[];
  selectedAgentId: string;
  onSelectAgent: (id: string) => void;
  cameraPreset: CameraPreset;
}

export const ThreeOfficeScene: React.FC<ThreeOfficeSceneProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  cameraPreset
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const agentMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 16, 18));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Keep a ref to latest agents & callbacks for animation loop
  const agentsRef = useRef(agents);
  agentsRef.current = agents;
  const selectedAgentIdRef = useRef(selectedAgentId);
  selectedAgentIdRef.current = selectedAgentId;

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 16, 18);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't look under floor
    controls.minDistance = 4;
    controls.maxDistance = 35;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
    mainLight.position.set(12, 22, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -16;
    mainLight.shadow.camera.right = 16;
    mainLight.shadow.camera.top = 16;
    mainLight.shadow.camera.bottom = -16;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    // Subtle blue fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-15, 10, -10);
    scene.add(fillLight);

    // Accent Zone Lights
    const addZonePointLight = (x: number, z: number, color: number) => {
      const pl = new THREE.PointLight(color, 2.5, 9, 1.5);
      pl.position.set(x, 2.2, z);
      scene.add(pl);
    };
    addZonePointLight(0, 0, 0x10b981);    // Orchestrator (Emerald)
    addZonePointLight(-6, -3.5, 0x06b6d4); // Frontend (Cyan)
    addZonePointLight(-6, 3.5, 0x8b5cf6);  // Backend (Violet)
    addZonePointLight(6, 3.5, 0xf59e0b);   // Database (Amber)
    addZonePointLight(6, -3.5, 0xec4899);  // Testing (Pink)
    addZonePointLight(0, -7, 0x3b82f6);    // DevOps (Blue)

    // 6. Architectural Office Environment
    buildOfficeEnvironment(scene);

    // 7. Raycaster for clicking agents
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let cur: THREE.Object3D | null = hit.object;
        while (cur && cur !== scene) {
          if (cur.userData?.agentId) {
            onSelectAgent(cur.userData.agentId);
            return;
          }
          cur = cur.parent;
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', handlePointerDown);

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation & Render Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Camera Transition to target
      camera.position.lerp(targetCamPosRef.current, 0.05);
      controls.target.lerp(targetCamLookRef.current, 0.05);
      controls.update();

      // Update 3D Agents
      agentsRef.current.forEach((agent) => {
        let group = agentMeshesRef.current.get(agent.id);

        if (!group) {
          group = createAgentMesh(agent);
          agentMeshesRef.current.set(agent.id, group);
          scene.add(group);
        }

        // Update position from lerped currentPosition
        const [cx, cy, cz] = agent.currentPosition;
        group.position.set(cx, cy, cz);
        group.rotation.y = agent.rotationY;

        // Selection highlight ring
        const isSelected = agent.id === selectedAgentIdRef.current;
        const selectRing = group.getObjectByName('selectionRing');
        if (selectRing) {
          selectRing.visible = isSelected;
          selectRing.rotation.z = time * 2;
        }

        // Typing animation for arms when WORKING
        const leftArm = group.getObjectByName('leftArm');
        const rightArm = group.getObjectByName('rightArm');
        if (agent.status === 'WORKING') {
          if (leftArm && rightArm) {
            leftArm.rotation.x = -0.5 + Math.sin(time * 12) * 0.12;
            rightArm.rotation.x = -0.5 + Math.cos(time * 12 + 1) * 0.12;
          }
        } else if (leftArm && rightArm) {
          leftArm.rotation.x = -0.2;
          rightArm.rotation.x = -0.2;
        }

        // Thinking hologram ring rotation overhead
        const thinkingRing = group.getObjectByName('thinkingRing');
        if (thinkingRing) {
          thinkingRing.visible = agent.status === 'THINKING';
          if (thinkingRing.visible) {
            thinkingRing.rotation.y = time * 3;
            thinkingRing.position.y = 1.6 + Math.sin(time * 4) * 0.06;
          }
        }

        // Overhead status beacon bobbing
        const beacon = group.getObjectByName('overheadBeacon');
        if (beacon) {
          beacon.position.y = 1.7 + Math.sin(time * 2 + agent.id.charCodeAt(0)) * 0.05;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (domEl && domEl.parentNode) {
        domEl.parentNode.removeChild(domEl);
      }
      agentMeshesRef.current.clear();
    };
  }, []);

  // Update Camera Target based on Preset
  useEffect(() => {
    if (cameraPreset === 'overview') {
      targetCamPosRef.current.set(0, 16, 18);
      targetCamLookRef.current.set(0, 0.5, 0);
    } else {
      const zone = OFFICE_ZONES[cameraPreset];
      if (zone) {
        targetCamPosRef.current.set(...zone.cameraPosition);
        targetCamLookRef.current.set(...zone.cameraTarget);
      }
    }
  }, [cameraPreset]);

  return (
    <div className="relative w-full h-full min-h-[480px] bg-[#07090E] overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* 3D Scene Controls Overlay Guide */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
        <span>Click Avatar to Inspect</span>
        <span>·</span>
        <span>Drag to Orbit</span>
        <span>·</span>
        <span>Scroll to Zoom</span>
      </div>
    </div>
  );
};

/**
 * Builds the modern architectural 3D Software Engineering workspace
 */
function buildOfficeEnvironment(scene: THREE.Scene) {
  // 1. Office Floor (Dark composite slab)
  const floorGeo = new THREE.BoxGeometry(26, 0.4, 22);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0c101a,
    roughness: 0.6,
    metalness: 0.4
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Floor Grid Overlay
  const gridHelper = new THREE.GridHelper(24, 24, 0x1e293b, 0x111827);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // Glass Balustrades / Perimeter Walls
  const wallMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.7,
    thickness: 0.5
  });

  const createPerimeterWall = (w: number, d: number, x: number, z: number) => {
    const wallGeo = new THREE.BoxGeometry(w, 1.2, d);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(x, 0.6, z);
    scene.add(wall);
  };
  createPerimeterWall(26, 0.2, 0, -11); // Back
  createPerimeterWall(26, 0.2, 0, 11);  // Front
  createPerimeterWall(0.2, 22, -13, 0); // Left
  createPerimeterWall(0.2, 22, 13, 0);  // Right

  // Cyber Circuit pathways connecting zones to Central Orchestrator
  const createPathway = (x1: number, z1: number, x2: number, z2: number, color: number) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dz, dx);

    const pathGeo = new THREE.PlaneGeometry(length, 0.15);
    const pathMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.rotation.x = -Math.PI / 2;
    path.rotation.z = -angle;
    path.position.set((x1 + x2) / 2, 0.02, (z1 + z2) / 2);
    scene.add(path);
  };
  createPathway(0, 0, -6, -3.5, 0x06b6d4); // To Frontend
  createPathway(0, 0, -6, 3.5, 0x8b5cf6);  // To Backend
  createPathway(0, 0, 6, 3.5, 0xf59e0b);   // To Database
  createPathway(0, 0, 6, -3.5, 0xec4899);  // To Testing
  createPathway(0, 0, 0, -7, 0x3b82f6);    // To DevOps

  // Zone 1: Central Orchestrator Glass Dais
  const daisGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.3, 32);
  const daisMat = new THREE.MeshStandardMaterial({ color: 0x09141f, roughness: 0.3, metalness: 0.8 });
  const dais = new THREE.Mesh(daisGeo, daisMat);
  dais.position.set(0, 0.15, 0);
  dais.receiveShadow = true;
  scene.add(dais);

  const ringGeo = new THREE.RingGeometry(2.35, 2.45, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
  const daisRing = new THREE.Mesh(ringGeo, ringMat);
  daisRing.rotation.x = -Math.PI / 2;
  daisRing.position.set(0, 0.31, 0);
  scene.add(daisRing);

  // Central Hologram Column
  const holoGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.2, 16);
  const holoMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.3, wireframe: true });
  const holo = new THREE.Mesh(holoGeo, holoMat);
  holo.position.set(0, 1.4, -0.6);
  scene.add(holo);

  // Zone Desks & Furniture
  buildEngineeringDesk(scene, -6, -3.5, Math.PI / 4, 0x06b6d4, 'FRONTEND');
  buildEngineeringDesk(scene, -6, 3.5, -Math.PI / 4, 0x8b5cf6, 'BACKEND');
  buildDatabaseSanctuary(scene, 6, 3.5, -3 * Math.PI / 4);
  buildTestingStation(scene, 6, -3.5, 3 * Math.PI / 4);
  buildDevOpsCluster(scene, 0, -7, Math.PI);
}

/**
 * Builds standard dual/triple monitor software engineering desks
 */
function buildEngineeringDesk(
  scene: THREE.Scene,
  x: number,
  z: number,
  rotY: number,
  accentColor: number,
  label: string
) {
  const deskGroup = new THREE.Group();
  deskGroup.position.set(x, 0, z);
  deskGroup.rotation.y = rotY;

  // Table top
  const topGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
  const topMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.3 });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.set(0, 0.75, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  deskGroup.add(top);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.08, 0.75, 1.1);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
  const legL = new THREE.Mesh(legGeo, legMat);
  legL.position.set(-1.1, 0.375, 0);
  deskGroup.add(legL);
  const legR = new THREE.Mesh(legGeo, legMat);
  legR.position.set(1.1, 0.375, 0);
  deskGroup.add(legR);

  // Dual Curved Monitors
  const monGeo = new THREE.BoxGeometry(0.9, 0.5, 0.04);
  const monMat = new THREE.MeshBasicMaterial({ color: accentColor });
  const monFrameMat = new THREE.MeshStandardMaterial({ color: 0x020617 });

  // Screen 1
  const s1 = new THREE.Mesh(monGeo, monMat);
  s1.position.set(-0.48, 1.15, -0.2);
  s1.rotation.y = 0.15;
  deskGroup.add(s1);

  // Screen 2
  const s2 = new THREE.Mesh(monGeo, monMat);
  s2.position.set(0.48, 1.15, -0.2);
  s2.rotation.y = -0.15;
  deskGroup.add(s2);

  // Keyboard & Mouse
  const kbGeo = new THREE.BoxGeometry(0.5, 0.02, 0.18);
  const kbMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
  const kb = new THREE.Mesh(kbGeo, kbMat);
  kb.position.set(0, 0.8, 0.2);
  deskGroup.add(kb);

  // Office Ergonomic Chair
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), chairMat);
  seat.position.set(0, 0.45, 0.7);
  deskGroup.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.06), chairMat);
  back.position.set(0, 0.8, 0.98);
  deskGroup.add(back);

  scene.add(deskGroup);
}

/**
 * Builds the Database Area with server storage towers and glowing cylinders
 */
function buildDatabaseSanctuary(scene: THREE.Scene, x: number, z: number, rotY: number) {
  buildEngineeringDesk(scene, x, z, rotY, 0xf59e0b, 'DATABASE');

  const cluster = new THREE.Group();
  cluster.position.set(x + 1.8, 0, z + 1.2);

  // 3 PostgreSQL PostGIS Data Cylinders
  const cylGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.6, 16);
  const cylMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });

  for (let i = 0; i < 3; i++) {
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.set((i - 1) * 0.9, 0.8, 0);
    cyl.castShadow = true;
    cluster.add(cyl);

    // Glowing data level rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.02, 8, 24), ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.set((i - 1) * 0.9, 0.5, 0);
    cluster.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.02, 8, 24), ringMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.set((i - 1) * 0.9, 1.1, 0);
    cluster.add(ring2);
  }

  scene.add(cluster);
}

/**
 * Builds the Testing Area with diagnostic test hardware
 */
function buildTestingStation(scene: THREE.Scene, x: number, z: number, rotY: number) {
  buildEngineeringDesk(scene, x, z, rotY, 0xec4899, 'TESTING');

  const rack = new THREE.Group();
  rack.position.set(x + 1.8, 0, z - 1.2);

  const rackGeo = new THREE.BoxGeometry(0.8, 2.0, 0.8);
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5 });
  const rackMesh = new THREE.Mesh(rackGeo, rackMat);
  rackMesh.position.set(0, 1.0, 0);
  rackMesh.castShadow = true;
  rack.add(rackMesh);

  // Status lamps
  const lampMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), lampMat);
  lamp.position.set(0, 2.1, 0);
  rack.add(lamp);

  scene.add(rack);
}

/**
 * Builds the DevOps Cloud Server cluster with high-density server rack blades
 */
function buildDevOpsCluster(scene: THREE.Scene, x: number, z: number, rotY: number) {
  buildEngineeringDesk(scene, x, z, rotY, 0x3b82f6, 'DEVOPS');

  const servers = new THREE.Group();
  servers.position.set(x, 0, z - 2.2);

  for (let i = -2; i <= 2; i++) {
    const bladeGeo = new THREE.BoxGeometry(0.9, 2.4, 0.7);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x090e17, roughness: 0.4, metalness: 0.6 });
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.set(i * 1.1, 1.2, 0);
    blade.castShadow = true;
    servers.add(blade);

    // Activity LEDs
    const ledMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x3b82f6 : 0x10b981 });
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.02), ledMat);
    led.position.set(i * 1.1, 1.8, 0.36);
    servers.add(led);
  }

  scene.add(servers);
}

/**
 * Creates a stylized procedural low-poly AI Software Engineering Agent avatar
 */
function createAgentMesh(agent: AgentState): THREE.Group {
  const group = new THREE.Group();
  group.userData = { agentId: agent.id };

  const hexColor = parseInt(agent.avatarColor.replace('#', '0x'), 16);
  const secondaryHex = parseInt(agent.secondaryColor.replace('#', '0x'), 16);

  // 1. Torso
  const torsoGeo = new THREE.BoxGeometry(0.5, 0.6, 0.3);
  const torsoMat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.4, metalness: 0.2 });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.set(0, 0.75, 0);
  torso.castShadow = true;
  group.add(torso);

  // 2. Head with glowing cyber visor
  const headGeo = new THREE.BoxGeometry(0.38, 0.38, 0.34);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0, 1.25, 0);
  head.castShadow = true;
  group.add(head);

  // Glowing Visor
  const visorGeo = new THREE.BoxGeometry(0.34, 0.12, 0.06);
  const visorMat = new THREE.MeshBasicMaterial({ color: secondaryHex });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 1.27, 0.17);
  group.add(visor);

  // 3. Articulated Arms
  const armGeo = new THREE.BoxGeometry(0.12, 0.45, 0.12);
  const armMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });

  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.name = 'leftArm';
  leftArm.position.set(-0.35, 0.7, 0.1);
  leftArm.rotation.x = -0.3;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.name = 'rightArm';
  rightArm.position.set(0.35, 0.7, 0.1);
  rightArm.rotation.x = -0.3;
  group.add(rightArm);

  // 4. Selection Highlight Ring (on the floor)
  const ringGeo = new THREE.RingGeometry(0.7, 0.85, 24);
  const ringMat = new THREE.MeshBasicMaterial({ color: hexColor, side: THREE.DoubleSide });
  const selectionRing = new THREE.Mesh(ringGeo, ringMat);
  selectionRing.name = 'selectionRing';
  selectionRing.rotation.x = -Math.PI / 2;
  selectionRing.position.set(0, 0.02, 0);
  selectionRing.visible = false;
  group.add(selectionRing);

  // 5. Overhead Status Beacon
  const beaconGeo = new THREE.SphereGeometry(0.1, 16, 16);
  const beaconMat = new THREE.MeshBasicMaterial({ color: secondaryHex });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.name = 'overheadBeacon';
  beacon.position.set(0, 1.7, 0);
  group.add(beacon);

  // 6. Thinking Ring (hidden by default)
  const thinkGeo = new THREE.TorusGeometry(0.3, 0.03, 8, 24);
  const thinkMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const thinkingRing = new THREE.Mesh(thinkGeo, thinkMat);
  thinkingRing.name = 'thinkingRing';
  thinkingRing.rotation.x = Math.PI / 2;
  thinkingRing.position.set(0, 1.6, 0);
  thinkingRing.visible = false;
  group.add(thinkingRing);

  return group;
}
