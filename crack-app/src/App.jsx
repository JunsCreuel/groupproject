import { useState, useRef, useEffect, useMemo } from 'react';
import { HITS_TO_BREAK, HOLD_INTERVAL_MS, RESET_DELAY_MS, BALL_RADIUS } from './constants.js';
import { makeCrackPoints, makeBranchPoints, makeRingPoints } from './crackLines.js';
import { playCrunch, playShatter, playSquish } from './crunch.js';
import { getVolume, setVolume, onVolumeChange } from './volume.js';
import './index.css';

// CRACK LAB — 왁뿌볼(유리구슬 안에 말랑한 찰흙이 든 스트레스 토이)을 계속
// 눌러서 깨는 미니 랩. 정밀한 조준/점수 게임이 아니라 그냥 손맛으로 계속
// 눌러 터뜨리는 게 목적이라, 화면 어디든 필요 없고 공 하나만 화면 중앙에
// 고정해두고 그 자체를 클릭/꾹 누르기 대상으로 삼는다.
export default function App() {
  const [hits, setHits] = useState(0);
  const [broken, setBroken] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [entering, setEntering] = useState(true);
  const [volume, setVolumeState] = useState(getVolume());

  const hitsRef = useRef(0);
  const brokenRef = useRef(false);
  const holdIntervalRef = useRef(null);
  const resetTimeoutRef = useRef(null);
  const shakeTimeoutRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => onVolumeChange(setVolumeState), []);
  const handleVolumeChange = (v) => setVolume(v);

  // 공을 한 번 "으드득" 누르는 동작 — 타격 수를 늘리고, 그 진행도에 맞는
  // 크런치 소리를 내고, 살짝 흔들리는 펀치 애니메이션을 재생한다. 임계값에
  // 도달하면 완전히 깨지는 연출로 넘어간다.
  const crunchOnce = () => {
    if (brokenRef.current) return;

    hitsRef.current += 1;
    setHits(hitsRef.current);
    playCrunch(hitsRef.current / HITS_TO_BREAK);

    setShaking(false);
    clearTimeout(shakeTimeoutRef.current);
    // 리플로우 강제 — 연속 타격 시 흔들림 애니메이션이 계속 처음부터 재생되게
    requestAnimationFrame(() => setShaking(true));
    shakeTimeoutRef.current = setTimeout(() => setShaking(false), 160);

    if (hitsRef.current >= HITS_TO_BREAK) {
      brokenRef.current = true;
      setBroken(true);
      playShatter();
      setTimeout(playSquish, 220);
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      resetTimeoutRef.current = setTimeout(() => {
        hitsRef.current = 0;
        brokenRef.current = false;
        setHits(0);
        setBroken(false);
      }, RESET_DELAY_MS);
    }
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0 || brokenRef.current) return;
    crunchOnce();
    clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(crunchOnce, HOLD_INTERVAL_MS);
  };

  useEffect(() => {
    // 공 밖으로 드래그해서 손을 떼도 확실히 멈추도록 window에서 pointerup을 받는다
    const stopHolding = () => {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    };
    window.addEventListener('pointerup', stopHolding);
    return () => {
      window.removeEventListener('pointerup', stopHolding);
      clearInterval(holdIntervalRef.current);
      clearTimeout(resetTimeoutRef.current);
      clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  const crackLines = useMemo(
    () => Array.from({ length: hits }, (_, i) => ({
      main: makeCrackPoints(i, BALL_RADIUS),
      branch: i % 2 === 1 ? makeBranchPoints(i, BALL_RADIUS) : null,
      ring: makeRingPoints(i, BALL_RADIUS),
    })),
    [hits],
  );

  const progressLabel = broken ? '와장창!' : `금간 정도 ${hits} / ${HITS_TO_BREAK}`;

  return (
    <>
      <div className="crack-backdrop" />
      <div className="crt-overlay" />

      <div className="lab-header">
        <a className="brand-logo" href="../index.html">
          <img src="images/CSL-logo.png" alt="CSL — Cyber Stress Lab" />
        </a>
        <h1 className="lab-title">CRACK LAB<span className="star-accent">*</span></h1>
        <p className="lab-subtitle">SQUEEZE IT. HEAR IT BREAK.</p>
      </div>

      <p className="marker-note note-break">BREAK IT.<br />LET IT OUT.</p>

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

      <div className="crack-stage">
        <p className="progress-label">{progressLabel}</p>

        <div
          className={`ball-wrap${shaking ? ' is-shaking' : ''}`}
          onPointerDown={handlePointerDown}
        >
          <div className={`ball-intact${broken ? ' is-broken-away' : ''}`}>
            <div className="ball-core" />
            <svg className="crack-svg" viewBox={`${-BALL_RADIUS} ${-BALL_RADIUS} ${BALL_RADIUS * 2} ${BALL_RADIUS * 2}`}>
              <defs>
                <clipPath id="ball-clip">
                  <circle cx="0" cy="0" r={BALL_RADIUS} />
                </clipPath>
              </defs>
              <g clipPath="url(#ball-clip)">
                {crackLines.map((line, i) => (
                  <g key={i}>
                    {line.ring && <polyline points={line.ring} className="crack-line crack-ring" />}
                    <polyline points={line.main} className="crack-line" />
                    {line.branch && <polyline points={line.branch} className="crack-line crack-branch" />}
                  </g>
                ))}
              </g>
            </svg>
          </div>

          <div className={`ball-broken${broken ? ' is-visible' : ''}`}>
            <div className="ooze-blob blob-1" />
            <div className="ooze-blob blob-2" />
            <div className="ooze-blob blob-3" />
            <div className="ooze-blob blob-4" />
            <div className="ooze-blob blob-5" />
            <img src="images/wax_ball.png" alt="" className="shatter-img" />
          </div>
        </div>

        <p className="hint">클릭하거나 꾹 눌러서 계속 부숴보세요</p>
      </div>

      <a className="back-link" href="../index.html">
        <img src="images/sticker-back.png" alt="뒤로가기" />
      </a>

      <div className={`enter-flash${entering ? '' : ' is-faded'}`} />
    </>
  );
}
