import { useState, useRef, useEffect } from 'react';
import { HOLD_INTERVAL_MS } from './constants.js';
import { playKeyClick } from './clickSound.js';
import { getVolume, setVolume, onVolumeChange } from './volume.js';
import { pickRandomKeycapType } from './keycapTypes.js';
import { getDailyCount, getTotalCount, incrementClickCount } from './stats.js';
import './index.css';

// CLICK LAB — 키캡(지금은 ESC)을 마우스로 누르거나 실제 ESC 키를 눌러서
// "딸깍" 타건음과 눌리는 모션을 반복하는 미니 랩. 다른 랩들처럼 정밀한
// 목표 없이 그냥 계속 눌러대는 게 전부라, 화면 중앙에 키캡 하나만 고정해두고
// 누른 횟수(오늘 / 지금까지 총)만 세어서 보여준다.
export default function App() {
  const [pressed, setPressed] = useState(false);
  const [daily, setDaily] = useState(() => getDailyCount());
  const [total, setTotal] = useState(() => getTotalCount());
  const [entering, setEntering] = useState(true);
  const [volume, setVolumeState] = useState(getVolume());
  const [keycap] = useState(() => pickRandomKeycapType());

  const holdIntervalRef = useRef(null);
  const pressTimeoutRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => onVolumeChange(setVolumeState), []);
  const handleVolumeChange = (v) => setVolume(v);

  const pressOnce = () => {
    playKeyClick();
    const { daily: d, total: t } = incrementClickCount();
    setDaily(d);
    setTotal(t);

    setPressed(false);
    clearTimeout(pressTimeoutRef.current);
    requestAnimationFrame(() => setPressed(true));
    pressTimeoutRef.current = setTimeout(() => setPressed(false), 90);
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    pressOnce();
    clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(pressOnce, HOLD_INTERVAL_MS);
  };

  useEffect(() => {
    const stopHolding = () => {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    };
    // 실제 키보드의 ESC를 눌러도 같은 반응 — "탈출" 컨셉이랑도 잘 맞아서
    // 마우스 클릭과 나란히 지원한다. e.repeat까지 그대로 반영해서 꾹 누르고
    // 있으면 브라우저 키 반복 속도에 맞춰 계속 눌린다.
    const handleKeyDown = (e) => {
      if (e.code !== 'Escape') return;
      e.preventDefault();
      pressOnce();
    };
    window.addEventListener('pointerup', stopHolding);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerup', stopHolding);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(holdIntervalRef.current);
      clearTimeout(pressTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="click-backdrop" />
      <div className="crt-overlay" />

      <div className="lab-header">
        <a className="brand-logo" href="../index.html">
          <img src="images/CSL-logo.png" alt="CSL — Cyber Stress Lab" />
        </a>
        <h1 className="lab-title">CLICK LAB<span className="star-accent">*</span></h1>
        <p className="lab-subtitle">TAP TAP TAP. LET IT OUT.</p>
        <p className="total-count">지금까지 총 <strong>{total}</strong>번</p>
      </div>

      <p className="marker-note note-tap">TAP<br />TAP<br />TAP</p>

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

      <div className="click-stage">
        <p className="daily-label">오늘 키를 누른 횟수: <strong>{daily}</strong></p>

        <button
          type="button"
          className={`keycap-btn${pressed ? ' is-pressed' : ''}`}
          onPointerDown={handlePointerDown}
          aria-label={keycap.name}
        >
          <img src={keycap.image} alt={keycap.name} className="keycap-img" draggable="false" />
        </button>

        <p className="hint">클릭하거나 꾹 누르세요 · 실제 ESC 키를 눌러도 돼요</p>
      </div>

      <a className="back-link" href="../index.html">
        <img src="images/sticker-back.png" alt="뒤로가기" />
      </a>

      <div className={`enter-flash${entering ? '' : ' is-faded'}`} />
    </>
  );
}
