import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getVolume } from './volume.js';

const RANGE_DEPTH = -12; // 표적이 놓인 z 위치
const LOOK_LIMIT = 0.5; // 마우스로 둘러볼 수 있는 최대 각도(라디안)
const TARGET_WIDTH = 1.3; // 표적 이미지(alien-doctor.png, 1086x1448) 가로 크기
const TARGET_HEIGHT = TARGET_WIDTH * (1448 / 1086); // 원본 이미지 비율 유지
// alien-doctor.png는 이미지 꽉 채워서 발끝이 맨 아래 픽셀에 붙어있으므로,
// 평면(mesh)은 항상 중심 기준이라 발이 바닥에 붙게 하려면 중심을
// (텍스처 높이의 절반)만큼 아래로 내려야 한다. LAB_FLOOR_Y가 그 "바닥" 높이.
const LAB_FLOOR_Y = -0.55;
const TARGET_BASE_Y = LAB_FLOOR_Y + TARGET_HEIGHT / 2;

// 팀원이 만들어준 실제 누끼 이미지를 Three.js 텍스처로 불러온다.
// 배경(lab-bg.png)과 총(gun-fps.png)은 3D 씬이 아니라 App.jsx에서
// CSS로 얹기 때문에, 여기서는 씬 안에 실제로 존재해야 하는 표적만 로드한다.
function loadTexture(path) {
  const texture = new THREE.TextureLoader().load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
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
  const texture = useMemo(() => loadTexture('images/alien-doctor.png'), []);
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
      mesh.position.y = TARGET_BASE_Y + Math.abs(Math.sin(t * STEP_FREQ)) * STEP_AMP;
    } else {
      // 도착 — 제자리에서 살짝 숨쉬듯 대기
      mesh.position.y = TARGET_BASE_Y + Math.sin(t * 1.4) * IDLE_BOB_AMP;
    }

    const hitT = t - hitFlashRef.current;
    const punch = hitT >= 0 && hitT < 0.2 ? 1.3 - (hitT / 0.2) * 0.3 : 1;
    mesh.scale.set(punch, punch, 1);
  });

  return (
    <mesh ref={targetRef} position={[0, TARGET_BASE_Y, RANGE_DEPTH]}>
      <planeGeometry args={[TARGET_WIDTH, TARGET_HEIGHT]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

// 씬 전체를 묶는 컴포넌트 — 마우스 조준, 클릭 발사, 명중 판정을 담당.
// 배경(lab-bg.png)과 총(gun-fps.png) 뷰모델은 3D 오브젝트가 아니라 실제 사진이라
// App.jsx에서 Canvas 앞뒤로 CSS 레이어로 얹는다 — 여기 Canvas는 표적 하나만
// 투명 배경 위에 그린다. 재장전(R키/버튼 공용 로직)은 HUD와 상태를 공유해야
// 해서 App.jsx가 갖고 있고, 여기서는 onReload로 전달받아 R키 입력만 연결한다.
export default function Experience({ onHit, onFire, ammo, setAmmo, reloading, onReload, paused }) {
  const { camera, gl, clock } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
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
      onFire(); // App.jsx의 총 뷰모델 반동 + 총구 플래시(CSS) 트리거

      raycaster.setFromCamera({ x: 0, y: 0 }, camera);
      if (targetRef.current) {
        const hit = raycaster.intersectObject(targetRef.current).length > 0;
        if (hit) {
          hitFlashRef.current = clock.elapsedTime;
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
  }, [camera, gl, clock, onHit, onFire, raycaster, setAmmo, onReload, shootSound, emptySound]);

  useFrame(() => {
    if (paused) return; // 일시정지 중엔 시점 회전을 멈춰서 그대로 얼어붙게

    const targetY = -mouse.current.x * LOOK_LIMIT;
    const targetX = mouse.current.y * LOOK_LIMIT;
    camera.rotation.y += (targetY - camera.rotation.y) * 0.08;
    camera.rotation.x += (targetX - camera.rotation.x) * 0.08;
  });

  return <Target targetRef={targetRef} hitFlashRef={hitFlashRef} />;
}
