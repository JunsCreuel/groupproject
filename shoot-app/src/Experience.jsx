import { useRef, useEffect, useMemo } from 'react';
import { getVolume } from './volume.js';
import { FIRE_INTERVAL_MS } from './constants.js';

// 외계인 — 3D 오브젝트가 아니라 실사 이미지(alien-doctor.png)를 화면에 그냥
// 얹은 것이다. 항상 화면 정중앙에 고정이고 마우스가 어디로 움직이든(배경/총만
// 팬 되는 시점 회전 연출) 절대 안 움직인다 — 이건 정밀 조준 게임이 아니라
// 그냥 마음껏 갈겨서 스트레스를 푸는 게 목적이라, 표적이 조준점을 피해
// 돌아다니면 오히려 방해만 된다. 등장할 때 멀리서 스윽 커지면서
// 들어오고(alien-enter), 자리 잡은 뒤엔 좌우로만 살짝 흔들린다(alien-sway)
// — 두 애니메이션을 바깥/안쪽 엘리먼트로 나눠서 서로의 transform이
// 덮어쓰지 않게 했다.
function Target({ targetRef, targetName }) {
  const zombieSound = useMemo(() => new Audio('sounds/zombi-quiet.mp3'), []);

  useEffect(() => {
    zombieSound.volume = getVolume();
    zombieSound.play().catch(() => {}); // 자동재생 정책으로 실패할 수 있음
  }, [zombieSound]);

  return (
    <div className="alien-entrance">
      <div className="alien-sway">
        {/* 사용자가 정한 이름표 — 과녁이 흔들릴 때(alien-sway) 같이 흔들리도록
            흔들림 애니메이션을 맡은 엘리먼트 안에 형제로 넣었다 */}
        {targetName && <div className="alien-name-tag">{targetName}</div>}
        <img ref={targetRef} src="images/alien-doctor.png" alt="" className="alien-img" />
      </div>
    </div>
  );
}

// 발사/재장전/명중 판정을 담당하는 컴포넌트 — 이제 Three.js Canvas가 아니라
// 그냥 일반 React 컴포넌트다. 조준점은 화면 정중앙에 고정되어 있으므로,
// 명중 판정도 "정중앙 좌표가 과녁의 실제 렌더링된 사각형 안에 있는가"를
// DOM에서 직접 확인하는 방식으로 바뀌었다(3D 레이캐스팅 대신).
export default function Experience({ onHit, onFire, ammo, setAmmo, reloading, onReload, paused, disabled, targetName }) {
  const targetRef = useRef(null);

  // 발사음 — 실제로 탄이 한 발 나갈 때마다(fireShot 안에서) 매번 재생한다.
  // 예전엔 누르고 있는 동안 30초짜리 루프 사운드를 따로 틀었는데, 그러면
  // 탄약이 5발 줄어도 소리는 그냥 계속 이어지는 하나의 소리라 실제 발사
  // 횟수와 안 맞았다. 지금은 한 발(gun-shoot-trrr.ogg)을 매 발사마다
  // currentTime을 되감아 다시 트리거해서, 소모된 탄약 수만큼 소리도
  // 정확히 그만큼 난다.
  const shotSound = useMemo(() => new Audio('sounds/gun-shoot-trrr.ogg'), []);
  const emptySound = useMemo(() => new Audio('sounds/emptybullet.mp3'), []);
  const playSound = (audio) => {
    audio.currentTime = 0;
    audio.volume = getVolume();
    audio.play().catch(() => {});
  };

  // ammo/reloading/paused/disabled를 ref로도 미러링해서, 아래 네이티브 DOM
  // 리스너와 연사 루프가 항상 최신 값을 읽도록 한다(리스너 재등록으로 인한
  // 레이스 컨디션 방지 — 자세한 이유는 이전 커밋 참고).
  const ammoRef = useRef(ammo);
  const reloadingRef = useRef(reloading);
  const pausedRef = useRef(paused);
  const disabledRef = useRef(disabled);
  ammoRef.current = ammo;
  reloadingRef.current = reloading;
  pausedRef.current = paused;
  disabledRef.current = disabled;

  const firingRef = useRef(false);
  const lastFireAtRef = useRef(0);
  const emptyPlayedRef = useRef(false);

  useEffect(() => {
    const fireShot = () => {
      if (pausedRef.current || reloadingRef.current || disabledRef.current) return;

      if (ammoRef.current <= 0) {
        if (!emptyPlayedRef.current) {
          emptyPlayedRef.current = true;
          playSound(emptySound);
        }
        return;
      }

      ammoRef.current -= 1;
      setAmmo(ammoRef.current);
      playSound(shotSound); // 탄약 한 발 소모 = 발사음 한 번
      onFire(); // App.jsx의 총 뷰모델 반동 + 총구 플래시(CSS) 트리거

      // 조준점은 항상 화면 정중앙 — 과녁의 실제 렌더링된 사각형이 그 점을
      // 덮고 있으면 명중으로 판정한다.
      const el = targetRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const hit = cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom;
        if (hit) {
          el.classList.remove('is-hit');
          void el.offsetWidth; // 리플로우 강제 — 연속 명중 시 펀치 애니메이션 재시작
          el.classList.add('is-hit');
          onHit();
        }
      }
    };

    const handleDown = () => {
      if (pausedRef.current || disabledRef.current) return;
      emptyPlayedRef.current = false;
      firingRef.current = true;
      fireShot(); // 누르는 즉시 첫 발은 바로 나가야 연사 텀만큼 딜레이가 안 느껴짐
      lastFireAtRef.current = performance.now();
    };

    const handleUp = () => {
      firingRef.current = false;
    };

    // R키로 재장전. e.key가 아니라 e.code를 쓰는 이유: 한글 입력 상태에서
    // R을 누르면 e.key가 'r'이 아니라 한글 자모로 들어와서 매칭이 안 됐었음.
    const handleKey = (e) => {
      if (e.code === 'KeyR' && !pausedRef.current && !disabledRef.current) onReload();
    };

    // .fire-zone은 HUD 버튼들보다 z-index가 낮은 화면 전체 크기 레이어라,
    // 조준/사격 시작 지점을 HUD 버튼(재장전, 일시정지 등)과 자연스럽게
    // 분리해준다 — 버튼 위 클릭은 버튼이 먼저 받아가고, 그 외 화면은 여기로.
    const fireZone = document.querySelector('.fire-zone');
    fireZone?.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('keydown', handleKey);

    let rafId;
    const loop = () => {
      if (firingRef.current && !pausedRef.current && !disabledRef.current && !reloadingRef.current) {
        if (performance.now() - lastFireAtRef.current >= FIRE_INTERVAL_MS) {
          lastFireAtRef.current = performance.now();
          fireShot();
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      fireZone?.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHit, onFire, setAmmo, onReload, shotSound, emptySound]);

  return <Target targetRef={targetRef} targetName={targetName} />;
}
