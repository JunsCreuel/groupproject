import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getVolume } from './volume.js';

const RANGE_DEPTH = -12; // 표적이 놓인 z 위치
const LOOK_LIMIT = 0.5; // 마우스로 둘러볼 수 있는 최대 각도(라디안)

// 텍스처는 이미지 파일 없이 canvas로 즉석에서 그려서 만든다
// (총구 화염 스프라이트용 방사형 핑크 그라디언트)
function makeFlashTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(255,140,210,0.9)');
  grad.addColorStop(0.6, 'rgba(255,45,150,0.5)');
  grad.addColorStop(1, 'rgba(255,45,150,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// 표적용 과녁 텍스처 (동심원)
function makeTargetTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const rings = [
    [size / 2, '#ffffff'],
    [size * 0.38, '#ff3d94'],
    [size * 0.27, '#ffffff'],
    [size * 0.16, '#ff3d94'],
    [size * 0.06, '#ffffff'],
  ];
  rings.forEach(([r, color]) => {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  return new THREE.CanvasTexture(canvas);
}

// 벽에 붙는 손글씨 그래피티 텍스처 — 참고 이미지의
// "STRESS TESTING BETTER DAYS AHEAD." 벽 낙서 느낌
function makeGraffitiTexture(lines) {
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.font = "italic 700 44px 'Segoe Print', 'Comic Sans MS', sans-serif";
  ctx.fillStyle = '#ff3d94';
  ctx.textAlign = 'left';
  lines.forEach((line, i) => ctx.fillText(line, 10, 60 + i * 56));
  return new THREE.CanvasTexture(canvas);
}

// 유리 배양관 안에 실루엣만 있는 생물체 — 참고 이미지의 튜브 배경 오브제를
// 실제 모델 없이 primitive로 근사
function SpecimenTank({ position }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 2.6, 20, 1, true]} />
        <meshPhysicalMaterial
          color="#8fe3d0"
          transparent
          opacity={0.25}
          roughness={0.05}
          transmission={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -1.3, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 20]} />
        <meshStandardMaterial color="#444" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* 안에 떠 있는 형체 — 몸통 + 머리만 대충 캡슐/구로 표현 */}
      <mesh position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.16, 0.7, 4, 8]} />
        <meshStandardMaterial color="#4a5a4f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#5a6a5f" roughness={0.8} />
      </mesh>
      <pointLight color="#8fe3d0" intensity={1.2} distance={3} position={[0, 0, 0.3]} />
    </group>
  );
}

// 사격장 환경 — 오염된 실험실 복도 느낌의 바닥+벽+안개+배양관+낙서
function Range() {
  const graffiti = useMemo(
    () => makeGraffitiTexture(['STRESS TESTING', 'BETTER DAYS AHEAD.']),
    [],
  );

  return (
    <>
      <fog attach="fog" args={['#15181a', 6, 22]} />
      <ambientLight intensity={0.45} color="#cfe8e0" />
      <directionalLight position={[2, 5, 3]} intensity={0.6} color="#eafff8" />
      <pointLight position={[0, 1.5, -3]} color="#ff3d94" intensity={0.6} distance={8} />

      {/* 바닥 — 젖은 콘크리트 느낌으로 약간 어둡게 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -8]}>
        <planeGeometry args={[8, 26]} />
        <meshStandardMaterial color="#33383a" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* 좌우 벽 — 오염된 흰 타일 느낌 */}
      <mesh position={[-3.2, 1, -8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[26, 5]} />
        <meshStandardMaterial color="#6b6f6a" roughness={0.9} />
      </mesh>
      <mesh position={[3.2, 1, -8]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[26, 5]} />
        <meshStandardMaterial color="#6b6f6a" roughness={0.9} />
      </mesh>

      {/* 왼쪽 벽 낙서 */}
      <mesh position={[-3.19, 1.4, -10]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4, 2]} />
        <meshBasicMaterial map={graffiti} transparent toneMapped={false} />
      </mesh>

      {/* 뒷벽 */}
      <mesh position={[0, 1, -20]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#3a3f3c" roughness={0.9} />
      </mesh>

      {/* 배경에 배양관 두 개 — 참고 이미지의 튜브 속 생물체 분위기 */}
      <SpecimenTank position={[2.6, 0.8, -15]} />
      <SpecimenTank position={[3.0, 0.8, -17.5]} />
    </>
  );
}

// 표적 — 가만히 매달려 좌우로 흔들리는 대신, 매번 등장할 때마다 "옆에서
// 걸어들어오기" 또는 "정면에서 걸어오기(접근)" 패턴 중 하나를 골라 실제로
// 걸어오는 것처럼 이동한다. 도착한 뒤엔 제자리 서성임(idle bob)으로 대기하다가
// 맞으면 잠깐 사라진 뒤 "좀비 등장음"(zombies.wav)과 함께 새 패턴으로 다시
// 걸어들어온다. 페이지에 처음 들어왔을 때도 한 번 등장음이 재생된다.
const RESPAWN_DELAY = 0.4; // 명중 후 다시 나타나기까지(초)
const WALK_DURATION = 1.6; // 등장 지점 → 대기 지점까지 걸어오는 데 걸리는 시간(초)
const STEP_FREQ = 5.5; // 걷는 동안의 상하 스텝 바운스 빈도
const STEP_AMP = 0.09; // 걷는 동안의 상하 스텝 바운스 크기
const IDLE_BOB_AMP = 0.06; // 도착 후 제자리에서 숨쉬듯 흔들리는 크기
const ENGAGE_Z = RANGE_DEPTH; // 옆에서 걸어들어올 때 멈추는 기본 깊이
const APPROACH_NEAR_Z = RANGE_DEPTH + 4.5; // 정면 접근 패턴에서 다가와 멈추는 깊이(더 가까움)

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

// 이번 등장에 쓸 시작 위치/도착 위치/모드를 무작위로 뽑는다
function pickWalkPlan() {
  const mode = ['left', 'right', 'front'][Math.floor(Math.random() * 3)];
  const engageX = (Math.random() - 0.5) * 3.6; // 대기 지점 좌우 위치

  if (mode === 'front') {
    // 정면 저 멀리서부터 플레이어 쪽으로 곧장 걸어옴
    return {
      mode,
      from: { x: engageX + (Math.random() - 0.5) * 1.2, z: RANGE_DEPTH - 6 },
      to: { x: engageX, z: APPROACH_NEAR_Z },
    };
  }

  // 화면 옆(왼쪽/오른쪽) 밖에서 안으로 걸어들어옴
  const sideX = mode === 'left' ? -5.5 : 5.5;
  return {
    mode,
    from: { x: sideX, z: ENGAGE_Z },
    to: { x: engageX, z: ENGAGE_Z },
  };
}

function Target({ targetRef, hitFlashRef }) {
  const texture = useMemo(() => makeTargetTexture(), []);
  const zombieSound = useMemo(() => new Audio('sounds/zombies.wav'), []);
  const plan = useRef(pickWalkPlan());
  const walkStartRef = useRef(0);
  const respawnAtRef = useRef(0);
  const hiddenRef = useRef(false);
  const lastHitSeenRef = useRef(-1);
  const spawnedOnceRef = useRef(false);

  const playSpawnSound = () => {
    zombieSound.currentTime = 0;
    zombieSound.volume = getVolume();
    zombieSound.play().catch(() => {}); // 자동재생 정책으로 첫 재생은 실패할 수 있음
  };

  useFrame(({ clock }) => {
    const mesh = targetRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;

    if (!spawnedOnceRef.current) {
      spawnedOnceRef.current = true;
      walkStartRef.current = t;
      playSpawnSound();
    }

    // hitFlashRef가 갱신됐다는 건 방금 명중했다는 뜻 — 잠깐 숨겼다가 재등장 예약
    if (hitFlashRef.current !== lastHitSeenRef.current) {
      lastHitSeenRef.current = hitFlashRef.current;
      hiddenRef.current = true;
      respawnAtRef.current = t + RESPAWN_DELAY;
      plan.current = pickWalkPlan(); // 다음엔 다른 방향/패턴으로 걸어들어오도록 새로 뽑음
    }

    if (hiddenRef.current) {
      if (t < respawnAtRef.current) {
        mesh.visible = false;
        return;
      }
      hiddenRef.current = false;
      walkStartRef.current = t;
      playSpawnSound();
    }

    mesh.visible = true;

    const { from, to } = plan.current;
    const walkT = Math.min((t - walkStartRef.current) / WALK_DURATION, 1);
    const eased = easeOutCubic(walkT);
    mesh.position.x = from.x + (to.x - from.x) * eased;
    mesh.position.z = from.z + (to.z - from.z) * eased;

    if (walkT < 1) {
      // 걸어오는 중 — 발걸음처럼 위아래로 바운스
      mesh.position.y = 0.3 + Math.abs(Math.sin(t * STEP_FREQ)) * STEP_AMP;
    } else {
      // 도착 — 제자리에서 살짝 숨쉬듯 대기
      mesh.position.y = 0.3 + Math.sin(t * 1.4) * IDLE_BOB_AMP;
    }

    const hitT = t - hitFlashRef.current;
    const punch = hitT >= 0 && hitT < 0.2 ? 1.3 - (hitT / 0.2) * 0.3 : 1;
    mesh.scale.set(punch, punch, 1);
  });

  return (
    <mesh ref={targetRef} position={[0, 0.3, RANGE_DEPTH]}>
      <planeGeometry args={[1.4, 1.4]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

// 총 뷰모델 — 참고 이미지(각진 핑크 캐논: 검정 리시버 + 냉각핀 달린
// 핑크 각형 배럴 + 검정 총구 링 + 검정 그립/전방 손잡이)를 primitive
// 조합으로 근사한 3D 모델. 카메라의 자식이 아니라 매 프레임 카메라
// 위치/방향을 따라가는 방식으로 붙여서, 화면 오른쪽 아래에서
// 적을 향해(카메라 forward) 겨눈 것처럼 보이게 한다.
const FIN_COUNT = 6;

function Gun({ recoil }) {
  const group = useRef();
  const localOffset = useMemo(() => new THREE.Vector3(0.55, -0.42, -1.6), []); // 그립 등 앞쪽으로 튀어나온 부분이 카메라에 너무 가까워지지 않도록 기존보다 더 멀리, 화면비에 맞춰 옆으로도 더 배치
  const back = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;
    const worldOffset = localOffset.clone().applyQuaternion(camera.quaternion);
    g.position.copy(camera.position).add(worldOffset);
    back.set(0, 0, 1).applyQuaternion(camera.quaternion); // 카메라 로컬 +Z = 플레이어 쪽(반동 방향)
    g.position.addScaledVector(back, recoil.current * 0.12);
    g.quaternion.copy(camera.quaternion);
    g.rotateX(-recoil.current * 0.35);
  });

  return (
    <group ref={group} scale={0.4}>
      {/* 총 전용 보조광 — 방 전체 조명이 어두워서 총이 실루엣으로만 보이는 걸 방지 (총에 딸려다니며 항상 비춤) */}
      <pointLight color="#ffe6f2" intensity={1.4} distance={2.5} position={[0.2, 0.5, 0.6]} />
      {/* 뒤쪽 몸체(리시버) — 어두운 톤 */}
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[0.3, 0.28, 0.35]} />
        <meshStandardMaterial color="#181818" metalness={0.4} roughness={0.4} />
      </mesh>

      {/* 상단 조준경 마운트 */}
      <mesh position={[0, 0.19, 0.12]}>
        <boxGeometry args={[0.1, 0.07, 0.22]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 메인 배럴 — 각진 핑크 통형 */}
      <mesh position={[0, 0, -0.25]}>
        <boxGeometry args={[0.26, 0.24, 0.7]} />
        <meshStandardMaterial color="#ff2d92" metalness={0.3} roughness={0.3} />
      </mesh>

      {/* 배럴 위 냉각핀(리지) */}
      {Array.from({ length: FIN_COUNT }, (_, i) => (
        <mesh key={i} position={[0, 0.14, -0.02 - i * 0.09]}>
          <boxGeometry args={[0.28, 0.03, 0.03]} />
          <meshStandardMaterial color="#111" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}

      {/* 총구 링 + 캡 — 검정 */}
      <mesh position={[0, 0, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 20]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0, -0.665]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.03, 20]} />
        <meshStandardMaterial color="#000" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* 전방 손잡이(foregrip) */}
      <mesh position={[0, -0.2, -0.15]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.18, 12]} />
        <meshStandardMaterial color="#161616" roughness={0.7} />
      </mesh>

      {/* 방아쇠울 */}
      <mesh position={[0, -0.1, 0.28]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.08, 0.014, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#111" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* 뒷손잡이(그립) — 검정 + 핑크 트림 */}
      <mesh position={[0, -0.32, 0.38]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.18, 0.38, 0.18]} />
        <meshStandardMaterial color="#161616" roughness={0.6} />
      </mesh>
      <mesh position={[0.095, -0.32, 0.38]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.02, 0.38, 0.18]} />
        <meshStandardMaterial color="#ff2d92" />
      </mesh>
    </group>
  );
}

// 발사 순간 총구에서 터지는 핑크 플래시
function MuzzleFlash({ flashRef }) {
  const mesh = useRef();
  const texture = useMemo(() => makeFlashTexture(), []);
  const localOffset = useMemo(() => new THREE.Vector3(0.55, -0.42, -1.87), []); // 택티컬 캐논 총열 끝(검정 총구 캡) 위치에 맞춤 — Gun의 새 localOffset/scale 기준으로 재계산

  useFrame(({ camera, clock }) => {
    const m = mesh.current;
    if (!m) return;
    const duration = 0.12;
    const elapsed = clock.elapsedTime - flashRef.current;
    if (elapsed >= 0 && elapsed < duration) {
      const t = 1 - elapsed / duration;
      m.visible = true;
      m.material.opacity = t;
      const scale = 0.4 * (0.6 + t);
      m.scale.set(scale, scale, scale);
      m.position.copy(camera.position).add(localOffset.clone().applyQuaternion(camera.quaternion));
      m.quaternion.copy(camera.quaternion);
    } else {
      m.visible = false;
    }
  });

  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// 씬 전체를 묶는 컴포넌트 — 마우스 조준, 클릭 발사, 명중 판정을 담당.
// 재장전(R키/버튼 공용 로직)은 HUD와 상태를 공유해야 해서 App.jsx가 갖고
// 있고, 여기서는 onReload로 전달받아 R키 입력만 연결한다.
export default function Experience({ onHit, ammo, setAmmo, reloading, onReload, paused }) {
  const { camera, gl } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const recoil = useRef(0);
  const flashRef = useRef(-1);
  const hitFlashRef = useRef(-1);
  const targetRef = useRef();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // 발사음/빈 탄창음 — 파일명 그대로 각 상황에 매칭 (재장전음은 App.jsx에서 재생)
  const shootSound = useMemo(() => new Audio('sounds/shootsound.mp3'), []);
  const emptySound = useMemo(() => new Audio('sounds/emptybullet.mp3'), []);
  const playSound = (audio) => {
    audio.currentTime = 0;
    audio.volume = getVolume();
    audio.play().catch(() => {}); // 자동재생 정책으로 실패할 수 있어 catch 처리
  };

  // ammo/reloading/paused를 ref로도 미러링해서, 아래 네이티브 DOM 리스너가
  // 항상 최신 값을 읽도록 한다. (매 렌더마다 값을 대입만 하는 거라 useEffect 불필요)
  // 이걸 안 하면 리스너의 클로저가 등록 시점의 props를 그대로 들고 있어서,
  // 빠르게 연속 클릭했을 때 오래된 ammo 값을 기준으로 판정해버리는 문제가 있었음
  // (탄약이 0 밑으로 내려가거나 재장전 타이밍이 꼬이는 원인).
  const ammoRef = useRef(ammo);
  const reloadingRef = useRef(reloading);
  const pausedRef = useRef(paused);
  ammoRef.current = ammo;
  reloadingRef.current = reloading;
  pausedRef.current = paused;

  useEffect(() => {
    const el = gl.domElement;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    // 발사는 화면 정중앙(조준점) 기준으로 판정한다 — 실제 클릭 좌표가 아님
    const handleDown = () => {
      if (pausedRef.current || reloadingRef.current) return;

      if (ammoRef.current <= 0) {
        playSound(emptySound); // 탄창이 비었을 때 빈 방아쇠 소리
        return;
      }

      ammoRef.current -= 1; // setAmmo가 반영되기 전에도 즉시 최신값 유지 (연속 클릭 대비)
      setAmmo(ammoRef.current);
      playSound(shootSound);
      recoil.current = 1;
      const now = camera.userData._elapsed ?? 0;
      flashRef.current = now;

      raycaster.setFromCamera({ x: 0, y: 0 }, camera);
      if (targetRef.current) {
        const hit = raycaster.intersectObject(targetRef.current).length > 0;
        if (hit) {
          hitFlashRef.current = now;
          onHit();
        }
      }
    };

    // R키로 재장전. e.key가 아니라 e.code를 쓰는 이유: 한글 입력 상태에서
    // R을 누르면 e.key가 'r'이 아니라 한글 자모로 들어와서 매칭이 안 됐었음.
    // e.code(KeyR)는 키보드 입력 모드와 무관하게 물리적 키 위치로 판정한다.
    const handleKey = (e) => {
      if (e.code === 'KeyR' && !pausedRef.current) onReload();
    };

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerdown', handleDown);
    window.addEventListener('keydown', handleKey);
    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('keydown', handleKey);
    };
    // ammo/reloading/paused는 ref로 읽기 때문에 의도적으로 의존성 배열에서 뺐다 —
    // 넣으면 값이 바뀔 때마다 리스너를 떼었다 다시 붙이면서 위에서 설명한
    // 레이스 컨디션이 재발한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, onHit, raycaster, setAmmo, onReload, shootSound, emptySound]);

  useFrame(({ clock }) => {
    camera.userData._elapsed = clock.elapsedTime;
    if (paused) return; // 일시정지 중엔 시점 회전/반동 감쇠를 멈춰서 그대로 얼어붙게

    const targetY = -mouse.current.x * LOOK_LIMIT;
    const targetX = mouse.current.y * LOOK_LIMIT;
    camera.rotation.y += (targetY - camera.rotation.y) * 0.08;
    camera.rotation.x += (targetX - camera.rotation.x) * 0.08;

    recoil.current += (0 - recoil.current) * 0.2;
  });

  return (
    <>
      <Range />
      <Target targetRef={targetRef} hitFlashRef={hitFlashRef} />
      <Gun recoil={recoil} />
      <MuzzleFlash flashRef={flashRef} />
    </>
  );
}
