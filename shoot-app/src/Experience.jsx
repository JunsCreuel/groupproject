import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getVolume } from './volume.js';
import { FIRE_INTERVAL_MS } from './constants.js';

const RANGE_DEPTH = -12; // 외계인이 서 있는 z 위치(화면 중앙 정면 고정)
const TARGET_WIDTH = 1.3; // 표적 이미지(alien-doctor.png, 1086x1448) 가로 크기
const TARGET_HEIGHT = TARGET_WIDTH * (1448 / 1086); // 원본 이미지 비율 유지
// alien-doctor.png는 이미지 꽉 채워서 발끝이 맨 아래 픽셀에 붙어있으므로,
// 평면(mesh)은 항상 중심 기준이라 발이 바닥에 붙게 하려면 중심을
// (텍스처 높이의 절반)만큼 아래로 내려야 한다. LAB_FLOOR_Y가 그 "바닥" 높이.
const LAB_FLOOR_Y = -0.55;
const TARGET_BASE_Y = LAB_FLOOR_Y + TARGET_HEIGHT / 2;
const SWAY_AMP = 0.45; // 화면 중앙에서 좌우로 살짝 움직이는 폭
const SWAY_FREQ = 0.45; // 좌우로 왔다갔다하는 속도

// 팀원이 만들어준 실제 누끼 이미지를 Three.js 텍스처로 불러온다.
// 배경(lab-bg.png)과 총(gun-fps.png)은 3D 씬이 아니라 App.jsx에서
// CSS로 얹기 때문에, 여기서는 씬 안에 실제로 존재해야 하는 표적만 로드한다.
function loadTexture(path) {
  const texture = new THREE.TextureLoader().load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 외계인 — 화면 중앙 정면에 고정되어 좌우로만 살짝 움직인다(진짜 걷는
// 애니메이션은 프레임 이미지가 한 장뿐이라 불가능해서, 대신 "제자리에서
// 버티는 보스"처럼 다루기로 했다). 맞을 때마다 잠깐 커졌다 줄어드는
// 펀치 효과만 주고, 사라지거나 재배치되지 않는다 — 처치 판정(100대)은
// App.jsx가 누적 피격 횟수로 관리한다. 페이지에 들어오면 한 번만
// "좀비 등장음"(zombies.wav)이 재생된다.
function Target({ targetRef, hitFlashRef }) {
  const texture = useMemo(() => loadTexture('images/alien-doctor.png'), []);
  const zombieSound = useMemo(() => new Audio('sounds/zombies.wav'), []);
  const spawnedOnceRef = useRef(false);

  useFrame(({ clock }) => {
    const mesh = targetRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;

    if (!spawnedOnceRef.current) {
      spawnedOnceRef.current = true;
      zombieSound.volume = getVolume();
      zombieSound.play().catch(() => {}); // 자동재생 정책으로 실패할 수 있음
    }

    mesh.position.x = Math.sin(t * SWAY_FREQ) * SWAY_AMP;
    mesh.position.y = TARGET_BASE_Y;

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

// 씬 전체를 묶는 컴포넌트 — 마우스 조준, 클릭/홀드 발사(연사), 명중 판정을
// 담당한다. 배경(lab-bg.png)과 총(gun-fps.png) 뷰모델은 3D 오브젝트가 아니라
// 실제 사진이라 App.jsx에서 Canvas 앞뒤로 CSS 레이어로 얹는다 — 여기 Canvas는
// 외계인 하나만 투명 배경 위에 그린다. 재장전(R키/버튼 공용 로직)은 HUD와
// 상태를 공유해야 해서 App.jsx가 갖고 있고, 여기서는 onReload로 전달받아
// R키 입력만 연결한다.
export default function Experience({ onHit, onFire, ammo, setAmmo, reloading, onReload, paused, disabled }) {
  const { camera, gl, clock } = useThree();
  const hitFlashRef = useRef(-1);
  const targetRef = useRef();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  // 조준은 화면 중앙 고정이 아니라 실제 마우스 위치를 따라간다 — App.jsx의
  // 조준점(Recticle) 이미지도 같은 마우스 좌표를 따라 움직여서, 조준점이
  // 가리키는 곳과 실제 명중 판정이 항상 일치한다.
  const mouse = useRef({ x: 0, y: 0 });

  // 발사음/빈 탄창음 — 파일명 그대로 각 상황에 매칭 (재장전음은 App.jsx에서 재생)
  const shootSound = useMemo(() => new Audio('sounds/shootsound.mp3'), []);
  const emptySound = useMemo(() => new Audio('sounds/emptybullet.mp3'), []);
  const playSound = (audio) => {
    audio.currentTime = 0;
    audio.volume = getVolume();
    audio.play().catch(() => {}); // 자동재생 정책으로 실패할 수 있어 catch 처리
  };

  // ammo/reloading/paused/disabled를 ref로도 미러링해서, 아래 네이티브 DOM
  // 리스너와 연사 루프가 항상 최신 값을 읽도록 한다. (매 렌더마다 값을
  // 대입만 하는 거라 useEffect 불필요) 이걸 안 하면 리스너의 클로저가 등록
  // 시점의 props를 그대로 들고 있어서, 빠르게 연속 클릭했을 때 오래된 ammo
  // 값을 기준으로 판정해버리는 문제가 있었음(탄약이 0 밑으로 내려가거나
  // 재장전 타이밍이 꼬이는 원인).
  const ammoRef = useRef(ammo);
  const reloadingRef = useRef(reloading);
  const pausedRef = useRef(paused);
  const disabledRef = useRef(disabled);
  ammoRef.current = ammo;
  reloadingRef.current = reloading;
  pausedRef.current = paused;
  disabledRef.current = disabled;

  // 연사(자동사격) — 마우스를 누르고 있는 동안 firingRef가 true로 유지되고,
  // 아래 useFrame에서 FIRE_INTERVAL_MS 간격으로 fireShot()을 계속 호출한다.
  // 탄약이 없을 때 누르고 있으면 "빈 탄창" 소리가 매 프레임 반복 재생되지
  // 않도록 emptyPlayedRef로 방아쇠 한 번 당길 때 한 번만 재생되게 막는다.
  const firingRef = useRef(false);
  const lastFireAtRef = useRef(-Infinity);
  const emptyPlayedRef = useRef(false);
  const fireShotRef = useRef(() => {}); // useFrame 연사 루프에서 최신 fireShot을 호출하기 위한 ref

  useEffect(() => {
    const el = gl.domElement;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    // 발사는 조준점(=실제 마우스 위치) 기준으로 판정한다
    const fireShot = () => {
      if (pausedRef.current || reloadingRef.current || disabledRef.current) return;

      if (ammoRef.current <= 0) {
        if (!emptyPlayedRef.current) {
          emptyPlayedRef.current = true;
          playSound(emptySound); // 탄창이 비었을 때 빈 방아쇠 소리 — 방아쇠 한 번 당길 때 한 번만
        }
        return;
      }

      ammoRef.current -= 1; // setAmmo가 반영되기 전에도 즉시 최신값 유지 (연사 중 프레임 간 판정용)
      setAmmo(ammoRef.current);
      playSound(shootSound);
      onFire(); // App.jsx의 총 뷰모델 반동 + 총구 플래시(CSS) 트리거

      raycaster.setFromCamera(mouse.current, camera);
      if (targetRef.current) {
        const hit = raycaster.intersectObject(targetRef.current).length > 0;
        if (hit) {
          hitFlashRef.current = clock.elapsedTime;
          onHit();
        }
      }
    };

    const handleDown = () => {
      if (pausedRef.current || disabledRef.current) return;
      emptyPlayedRef.current = false; // 새로 방아쇠를 당겼으니 빈 탄창 소리 다시 허용
      firingRef.current = true;
      fireShot(); // 누르는 즉시 첫 발은 바로 나가야 연사 텀만큼 딜레이가 안 느껴짐
      lastFireAtRef.current = clock.elapsedTime;
    };

    const handleUp = () => {
      firingRef.current = false;
    };

    // R키로 재장전. e.key가 아니라 e.code를 쓰는 이유: 한글 입력 상태에서
    // R을 누르면 e.key가 'r'이 아니라 한글 자모로 들어와서 매칭이 안 됐었음.
    // e.code(KeyR)는 키보드 입력 모드와 무관하게 물리적 키 위치로 판정한다.
    const handleKey = (e) => {
      if (e.code === 'KeyR' && !pausedRef.current && !disabledRef.current) onReload();
    };

    el.addEventListener('pointermove', handleMove);
    el.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('keydown', handleKey);

    // Experience 안에서 fireShot을 useFrame에서도 재사용할 수 있게 ref에 저장
    fireShotRef.current = fireShot;

    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('keydown', handleKey);
    };
    // ammo/reloading/paused/disabled는 ref로 읽기 때문에 의도적으로 의존성
    // 배열에서 뺐다 — 넣으면 값이 바뀔 때마다 리스너를 떼었다 다시 붙이면서
    // 위에서 설명한 레이스 컨디션이 재발한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, clock, onHit, onFire, raycaster, setAmmo, onReload, shootSound, emptySound]);

  // 연사 루프 — 마우스를 누르고 있는 동안 FIRE_INTERVAL_MS마다 한 발씩
  useFrame(({ clock: c }) => {
    if (!firingRef.current || pausedRef.current || disabledRef.current) return;
    const now = c.elapsedTime;
    if (now - lastFireAtRef.current >= FIRE_INTERVAL_MS / 1000) {
      lastFireAtRef.current = now;
      fireShotRef.current();
    }
  });

  return <Target targetRef={targetRef} hitFlashRef={hitFlashRef} />;
}
