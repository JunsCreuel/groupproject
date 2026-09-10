import { useState, useEffect, useRef, useMemo } from 'react';
import Experience from './Experience.jsx';
import { MAX_AMMO, TOTAL_AMMO, RELOAD_MS, KILL_HITS } from './constants.js';
import { getVolume, setVolume, onVolumeChange } from './volume.js';
import './index.css';

const BGM_BASE_VOLUME = 0.35; // 배경음악은 효과음보다 작게 — 여기에 전체 음량 슬라이더 값을 곱해서 씀

// 메인 사이트에서 SHOOT 태그를 클릭하면 핑크/화이트 플래시가 화면을 덮으면서
// 이 페이지로 넘어온다. 여기서는 그 플래시로 덮인 채로 시작해서 서서히
// 걷어내, 페이지가 끊기지 않고 이어지는 것처럼 보이게 한다.
export default function App() {
  const [hits, setHits] = useState(0); // 외계인에게 누적으로 맞힌 횟수 — KILL_HITS에 도달하면 처치
  const [ammo, setAmmo] = useState(MAX_AMMO); // 현재 탄창
  const [reserveAmmo, setReserveAmmo] = useState(TOTAL_AMMO - MAX_AMMO); // 재장전으로 채워 넣을 수 있는 예비 탄약
  const [reloading, setReloading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [entering, setEntering] = useState(true);
  const [volume, setVolumeState] = useState(getVolume()); // 메인 사이트와 공유되는 전체 음량(0~1)
  const [nameInput, setNameInput] = useState(''); // 이름 입력창에 실시간으로 타이핑 중인 값
  const [targetName, setTargetName] = useState(''); // 확정된 표적 이름 — 확정 전엔 빈 문자열
  const [nameSubmitted, setNameSubmitted] = useState(false); // 이름을 정하기 전엔 사격 불가
  const reloadSound = useMemo(() => new Audio('sounds/reloadsound.mp3'), []);
  const bgm = useMemo(() => {
    const a = new Audio('sounds/bgm.mp3');
    a.loop = true;
    a.volume = BGM_BASE_VOLUME * getVolume();
    return a;
  }, []);
  const reloadingRef = useRef(reloading);
  const ammoRef = useRef(ammo);
  const reserveRef = useRef(reserveAmmo);
  reloadingRef.current = reloading;
  ammoRef.current = ammo;
  reserveRef.current = reserveAmmo;

  // 승패 판정 — 100대를 채우면 승리, 그 전에 탄약(탄창+예비)이 완전히
  // 떨어지면 패배. 둘 다 state 없이 매 렌더마다 현재 값으로 계산한다.
  const won = hits >= KILL_HITS;
  const lost = !won && ammo <= 0 && reserveAmmo <= 0;
  const gameOver = won || lost;

  // 총 뷰모델(gun-fps.png)은 3D가 아니라 HTML 이미지라, Three.js 프레임 루프 대신
  // 클래스 토글 + CSS 애니메이션으로 반동/총구 플래시를 재생한다 (메인 사이트
  // script.js의 pulse() 헬퍼와 같은 방식).
  const backdropRef = useRef(null); // 카메라 회전과 방향을 맞추기 위해 같이 살짝 팬(pan)되는 배경 사진
  const gunSwayRef = useRef(null); // 마우스를 살짝 따라가는 흔들림
  const gunRef = useRef(null); // 발사 반동 애니메이션
  const muzzleFlashRef = useRef(null);
  const triggerFire = () => {
    const gunEl = gunRef.current;
    const flashEl = muzzleFlashRef.current;
    if (gunEl) {
      gunEl.classList.remove('is-firing');
      void gunEl.offsetWidth; // 리플로우 강제 — 연속 발사 시 애니메이션 재시작
      gunEl.classList.add('is-firing');
    }
    if (flashEl) {
      flashEl.classList.remove('is-flashing');
      void flashEl.offsetWidth;
      flashEl.classList.add('is-flashing');
    }
  };

  // 스트레스 해소가 목적이니 오늘 스트레스 준 사람 이름을 표적에 붙여준다 —
  // 빈 채로 시작해도 괜찮도록 기본 이름을 하나 준비해둔다.
  const submitName = () => {
    const trimmed = nameInput.trim();
    setTargetName(trimmed || '스트레스 유발자');
    setNameSubmitted(true);
  };

  // 조준점(Recticle)은 화면 중앙에 고정 — 마우스를 움직이면 대신 시점 자체가
  // 그 방향으로 돌아가는 느낌을 배경/총/표적을 같이 팬(pan)시켜서 낸다.
  // 표적(alien-pan, Experience.jsx)도 배경과 같은 방향으로 같이 움직여야
  // 한다 — 조준점은 항상 화면 정중앙인데 표적이 전혀 안 움직이면 어디를
  // 봐도 표적이 계속 조준점 위에 있어서 무조건 맞아버린다. 배경보다 훨씬
  // 큰 폭으로 움직여야, 실제로 다른 곳을 조준하면 표적이 조준점 밑에서
  // 빠져나가서 진짜 "빗나가는" 게 가능해진다. 총은 그 위에서 살짝 더
  // 흔들리는 정도만 더한다.
  useEffect(() => {
    const handleMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1 ~ 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      const backdropEl = backdropRef.current;
      if (backdropEl) {
        // CSS의 scale(1.15) 여백 안에서 반대 방향으로 이동시켜, 시점이
        // 돌아가서 보여주는 방향과 배경이 같은 쪽으로 움직이게 만든다.
        backdropEl.style.transform = `scale(1.15) translate(${-nx * 16}px, ${-ny * 12}px)`;
      }
      const gunEl = gunSwayRef.current;
      if (gunEl) {
        gunEl.style.transform = `translate(${nx * 16}px, ${ny * 12}px) rotate(${nx * 2.5}deg)`;
      }
      // 표적도 배경과 같은 부호(방향)로 — 배경보다 훨씬 큰 폭으로 팬
      const alienPanEl = document.querySelector('.alien-pan');
      if (alienPanEl) {
        alienPanEl.style.transform = `translate(${-nx * 340}px, ${-ny * 220}px)`;
      }
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  // 음량 슬라이더를 움직이면 재생 중인 배경음악에 바로 반영한다
  useEffect(() => {
    bgm.volume = BGM_BASE_VOLUME * volume;
  }, [volume, bgm]);

  // 이 페이지 안에서 슬라이더로 바꾼 음량을 다른 곳(메인 사이트 등)과도 동기화
  useEffect(() => onVolumeChange(setVolumeState), []);

  const handleVolumeChange = (v) => {
    setVolume(v); // localStorage에 저장 + 구독자(자기 자신 포함)에게 알림
  };

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 20);
    return () => clearTimeout(t);
  }, []);

  // 배경음악 — 자동재생 정책 때문에 첫 사용자 입력(클릭/키입력)에 맞춰 재생 시작.
  // 일시정지 중엔 같이 멈췄다가 재개된다. (좀비 개별 등장음은 Experience.jsx의
  // Target 컴포넌트에서 표적이 새로 나타날 때마다 따로 재생함)
  useEffect(() => {
    const start = () => bgm.play().catch(() => {});
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [bgm]);

  useEffect(() => {
    if (paused) bgm.pause();
    else bgm.play().catch(() => {});
  }, [paused, bgm]);

  // ESC로 일시정지 토글 — e.code 기준(한글 입력 상태와 무관하게 항상 동작)
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.code === 'Escape') setPaused((p) => !p);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // R키와 RELOAD 버튼이 공유하는 재장전 로직. ref로 최신 ammo/reloading/예비
  // 탄약을 참조해서, Experience에 매번 새 함수를 내려보내지 않고도 최신
  // 상태로 판정한다. 예비 탄약(reserve)에서 탄창(MAX_AMMO)만큼 채워 넣되,
  // 예비 탄약이 그보다 적으면 남은 만큼만 채운다 — 총 탄약은 TOTAL_AMMO(120)를
  // 넘지 않는다.
  const reload = () => {
    if (reloadingRef.current || ammoRef.current >= MAX_AMMO || reserveRef.current <= 0) return;
    setReloading(true);
    reloadSound.currentTime = 0;
    reloadSound.volume = getVolume();
    reloadSound.play().catch(() => {});
    setTimeout(() => {
      const need = MAX_AMMO - ammoRef.current;
      const take = Math.min(need, reserveRef.current);
      setAmmo(ammoRef.current + take);
      setReserveAmmo(reserveRef.current - take);
      setReloading(false);
    }, RELOAD_MS);
  };

  return (
    <>
      {/* 팀원이 만든 실사 배경 — 표적/총/조준점 모두 이제 3D가 아니라 이 위에
          얹는 평범한 이미지라 Canvas가 필요 없다 */}
      <div className="lab-backdrop" ref={backdropRef} style={{ backgroundImage: "url('images/lab-bg.png')" }} />

      {/* 화면 전체 크기의 발사 감지 레이어 — Experience.jsx가 여기에 직접
          pointerdown을 걸어서 발사를 시작한다. HUD 버튼들은 z-index가 더
          높아서 이 레이어보다 먼저 클릭을 받아가므로 겹치지 않는다. */}
      <div className="fire-zone" />

      <Experience
        onHit={() => setHits((h) => Math.min(h + 1, KILL_HITS))}
        onFire={triggerFire}
        ammo={ammo}
        setAmmo={setAmmo}
        reloading={reloading}
        onReload={reload}
        paused={paused}
        disabled={gameOver || !nameSubmitted}
        targetName={nameSubmitted ? targetName : ''}
      />

      {/* 총 뷰모델 — 실사 합성 이미지(gun-fps.png)를 화면 우하단에 고정.
          바깥(gun-viewmodel)은 마우스를 따라가는 흔들림(sway)을, 안쪽
          (gun-recoil)은 발사 반동을 맡는다 — 같은 엘리먼트에서 둘 다
          transform을 쓰면 서로 덮어써서 따로 나눴다. 조준/시점 회전은 이제
          카메라가 아니라 이 총만 하고, 배경은 고정된 사진이라 안 움직인다. */}
      <div className="gun-viewmodel" ref={gunSwayRef}>
        <div className="gun-recoil" ref={gunRef}>
          <img src="images/gun-fps.png" alt="" className="gun-sprite" />
          <div className="muzzle-flash" ref={muzzleFlashRef} />
        </div>
      </div>

      <img src="images/Recticle.png" alt="" className="crosshair" />
      <div className="crt-overlay" />

      {/* 상단 좌측 — 브랜드 로고 + 타이틀. 로고는 메인 사이트에서 어떤
          오브제로 넘어와도 항상 좌측 상단에 있어야 해서, 다른 서브 화면이
          생겨도 이 자리에 그대로 두면 된다 */}
      <div className="lab-header">
        <a className="brand-logo" href="../index.html">
          <img src="images/CSL-logo.png" alt="CSL — Cyber Stress Lab" />
        </a>
        <h1 className="lab-title">SHOOT LAB<span className="star-accent">*</span></h1>
        <p className="lab-subtitle">SAME STRESS, DIFFERENT OUTCOME.</p>
      </div>

      {/* 상단 중앙 — 외계인 체력바. 100대 맞으면 처치(승리) */}
      <div className="hp-panel">
        <div className="hp-label">
          <span>ALIEN HP</span>
          <span>{Math.max(KILL_HITS - hits, 0)} / {KILL_HITS}</span>
        </div>
        <div className="hp-track">
          <div className="hp-fill" style={{ width: `${Math.max(0, 100 - (hits / KILL_HITS) * 100)}%` }} />
        </div>
      </div>

      <p className="marker-note note-clear">CLEAR THE LAB. LET IT OUT.</p>

      {/* 상단 우측 — 일시정지 버튼 + 음량 슬라이더 (메인 사이트와 값 공유) */}
      <button className="pause-btn" onClick={() => setPaused((p) => !p)}>
        ESC ⏸ PAUSE
      </button>

      <div className="volume-control">
        <span className="volume-icon">{volume === 0 ? '🔇' : '🔊'}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(volume * 100)}
          onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
          className="volume-slider"
          aria-label="음량 조절"
        />
      </div>

      {/* 하단 좌측 — 탄약 수치/재장전 버튼. 팀원이 만든 AMMO 아트는 숫자가
          고정된 그림이라 실시간으로 줄어들고 늘어나는 실제 탄약과 안 맞아서
          뺐다 — 실제 탄약 상태만 이 카드로 보여준다. */}
      <div className="ammo-panel">
        <div className="ammo-controls">
          <div className="ammo-dots">
            {Array.from({ length: MAX_AMMO }, (_, i) => (
              <span key={i} className={`ammo-dot${i < ammo ? ' is-loaded' : ''}`} />
            ))}
          </div>
          <div className="ammo-row">
            <span className="ammo-text">AMMO {ammo} / {reserveAmmo}</span>
            <button
              className="reload-btn"
              onClick={reload}
              disabled={reloading || ammo >= MAX_AMMO || reserveAmmo <= 0}
            >
              {reloading ? '재장전 중…' : 'RELOAD (R)'}
            </button>
          </div>
          {ammo === 0 && reserveAmmo > 0 && !reloading && (
            <p className="empty-hint">탄창이 비었어요 — R로 재장전!</p>
          )}
          {ammo === 0 && reserveAmmo <= 0 && !won && (
            <p className="empty-hint">탄약이 모두 떨어졌어요…</p>
          )}
        </div>
      </div>

      {/* 하단 우측 — 장식용 미니맵 */}
      <div className="minimap">
        <div className="minimap-grid" />
        <div className="minimap-blip minimap-blip-1" />
        <div className="minimap-blip minimap-blip-2" />
        <div className="minimap-player" />
        <p className="minimap-zone">ZONE B-3<br />CYBER STRESS LAB</p>
      </div>

      <a className="back-link" href="../index.html">
        <img src="images/sticker-back.png" alt="뒤로가기" />
      </a>
      <p className="hint">마우스로 조준 · 누르고 있으면 연사 · R로 재장전 · ESC로 일시정지</p>

      {/* 팀원이 만든 장식용 스티커들 — 화면 가장자리 빈 공간에 로커에 붙은
          스티커처럼 흩어 놓는다. 게임 로직과는 무관한 순수 장식 요소. */}
      <img src="images/sticker-target-stress.png" alt="" className="hud-sticker sticker-target-stress" />
      <img src="images/sticker-caution.png" alt="" className="hud-sticker sticker-caution" />
      <img src="images/sticker-biohazard.png" alt="" className="hud-sticker sticker-biohazard" />
      <img src="images/sticker-warning.png" alt="" className="hud-sticker sticker-warning" />
      <img src="images/sticker-lab-03.png" alt="" className="hud-sticker sticker-lab-03" />

      {won && (
        <div className="result-overlay result-win">
          <h2>STRESS RELEASED<span className="star-accent">*</span></h2>
          <p>외계인을 쓰러뜨렸어요. 오늘의 스트레스, 여기 두고 가세요.</p>
          <a className="result-btn" href="../index.html">메인화면으로 돌아가기</a>
        </div>
      )}

      {lost && (
        <div className="result-overlay result-lose">
          <h2>스트레스 해소 실패</h2>
          <p>탄약을 다 썼는데 외계인이 아직 쓰러지지 않았어요.</p>
          <a className="result-btn" href="../index.html">메인화면으로 돌아가기</a>
        </div>
      )}

      {paused && !gameOver && (
        <div className="pause-overlay">
          <p>PAUSED</p>
          <span>ESC를 다시 눌러 계속하기</span>
        </div>
      )}

      {/* 입장 시 목표물 이름을 정하는 프롬프트 — 확정 전까지는 사격이
          비활성화된다(disabled 프롭). 오늘 스트레스 준 사람, 별명, 친구 등
          뭐든 적을 수 있고 비워두면 기본 이름으로 시작한다. */}
      {!nameSubmitted && (
        <div className="name-prompt-overlay">
          <div className="name-prompt-card">
            <h2>목표물의 이름을 정하세요<span className="star-accent">*</span></h2>
            <p>오늘 스트레스 준 사람을 떠올려보세요 — 김부장, ○○대리님, 친구… 뭐든 좋아요.</p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.code === 'Enter') submitName(); }}
              placeholder="예: 김부장"
              maxLength={14}
              autoFocus
            />
            <button className="result-btn" onClick={submitName}>사격 시작</button>
          </div>
        </div>
      )}

      <div className={`enter-flash${entering ? '' : ' is-faded'}`} />
    </>
  );
}
