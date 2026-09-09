import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import { MAX_AMMO, RELOAD_MS, TOTAL_TARGETS, POINTS_PER_HIT } from './constants.js';
import { getVolume, setVolume, onVolumeChange } from './volume.js';
import './index.css';

const BGM_BASE_VOLUME = 0.35; // 배경음악은 효과음보다 작게 — 여기에 전체 음량 슬라이더 값을 곱해서 씀

// 메인 사이트에서 SHOOT 태그를 클릭하면 핑크/화이트 플래시가 화면을 덮으면서
// 이 페이지로 넘어온다. 여기서는 그 플래시로 덮인 채로 시작해서 서서히
// 걷어내, 페이지가 끊기지 않고 이어지는 것처럼 보이게 한다.
export default function App() {
  const [hits, setHits] = useState(0);
  const [ammo, setAmmo] = useState(MAX_AMMO);
  const [reloading, setReloading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [entering, setEntering] = useState(true);
  const [volume, setVolumeState] = useState(getVolume()); // 메인 사이트와 공유되는 전체 음량(0~1)
  const reloadSound = useMemo(() => new Audio('sounds/reloadsound.mp3'), []);
  const bgm = useMemo(() => {
    const a = new Audio('sounds/bgm.mp3');
    a.loop = true;
    a.volume = BGM_BASE_VOLUME * getVolume();
    return a;
  }, []);
  const reloadingRef = useRef(reloading);
  const ammoRef = useRef(ammo);
  reloadingRef.current = reloading;
  ammoRef.current = ammo;

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

  // R키와 RELOAD 버튼이 공유하는 재장전 로직. ref로 최신 ammo/reloading을
  // 참조해서, Experience에 매번 새 함수를 내려보내지 않고도 최신 상태로 판정한다.
  const reload = () => {
    if (reloadingRef.current || ammoRef.current >= MAX_AMMO) return;
    setReloading(true);
    reloadSound.currentTime = 0;
    reloadSound.volume = getVolume();
    reloadSound.play().catch(() => {});
    setTimeout(() => {
      setAmmo(MAX_AMMO);
      setReloading(false);
    }, RELOAD_MS);
  };

  const score = hits * POINTS_PER_HIT;
  const targetsCleared = Math.min(hits, TOTAL_TARGETS);
  const cleared = targetsCleared >= TOTAL_TARGETS;

  return (
    <>
      <Canvas className="range-canvas" camera={{ fov: 60, position: [0, 0, 0] }}>
        <Experience
          onHit={() => setHits((h) => h + 1)}
          ammo={ammo}
          setAmmo={setAmmo}
          reloading={reloading}
          onReload={reload}
          paused={paused}
        />
      </Canvas>

      <div className="crosshair" />
      <div className="crt-overlay" />

      {/* 상단 좌측 — 타이틀 + 점수/목표 패널 (참고 이미지 스타일) */}
      <div className="lab-header">
        <h1 className="lab-title">SHOOT LAB<span className="star-accent">*</span></h1>
        <p className="lab-subtitle">SAME STRESS, DIFFERENT OUTCOME.</p>

        <div className="stat-panel">
          <div className="stat-block">
            <span className="stat-label">SCORE</span>
            <span className="stat-value">{String(score).padStart(4, '0')}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-block">
            <span className="stat-label">TARGETS</span>
            <span className="stat-value">{targetsCleared} / {TOTAL_TARGETS}</span>
          </div>
          <div className="stat-progress">
            <div className="stat-progress-fill" style={{ width: `${(targetsCleared / TOTAL_TARGETS) * 100}%` }} />
          </div>
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

      {/* 하단 좌측 — 탄약 패널 + 재장전 버튼 */}
      <div className="ammo-panel">
        <div className="ammo-dots">
          {Array.from({ length: MAX_AMMO }, (_, i) => (
            <span key={i} className={`ammo-dot${i < ammo ? ' is-loaded' : ''}`} />
          ))}
        </div>
        <div className="ammo-row">
          <span className="ammo-text">AMMO {ammo} / ∞</span>
          <button className="reload-btn" onClick={reload} disabled={reloading || ammo >= MAX_AMMO}>
            {reloading ? '재장전 중…' : 'RELOAD (R)'}
          </button>
        </div>
        {ammo === 0 && !reloading && <p className="empty-hint">탄창이 비었어요 — R로 재장전!</p>}
      </div>

      {/* 하단 우측 — 장식용 미니맵 */}
      <div className="minimap">
        <div className="minimap-grid" />
        <div className="minimap-blip minimap-blip-1" />
        <div className="minimap-blip minimap-blip-2" />
        <div className="minimap-player" />
        <p className="minimap-zone">ZONE B-3<br />CYBER STRESS LAB</p>
      </div>

      <a className="back-link" href="../index.html">← BACK</a>
      <p className="hint">마우스로 조준 · 클릭해서 발사 · R로 재장전 · ESC로 일시정지</p>

      {cleared && (
        <div className="cleared-banner">LAB CLEARED — STRESS RELEASED*</div>
      )}

      {paused && (
        <div className="pause-overlay">
          <p>PAUSED</p>
          <span>ESC를 다시 눌러 계속하기</span>
        </div>
      )}

      <div className={`enter-flash${entering ? '' : ' is-faded'}`} />
    </>
  );
}
