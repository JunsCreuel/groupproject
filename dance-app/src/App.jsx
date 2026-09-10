import { useEffect, useState } from 'react';
import Game from './Game.jsx';
import { TRACKS } from './tracks.js';
import { getVolume, setVolume, onVolumeChange } from './volume.js';
import './index.css';

// DANCE LAB — 리듬게임. 곡 하나를 고르면 화면 아래 4개 레인(←↓↑→)으로 노트가
// 떨어지고, 박자에 맞춰 화살표 키를 누르는 미니게임. 정밀 타격감보다는
// "몸으로 박자를 타는" 스트레스 해소가 목적이라 판정을 너그럽게 뒀다.
export default function App() {
  const [phase, setPhase] = useState('select'); // 'select' | 'playing' | 'results'
  const [track, setTrack] = useState(null);
  const [results, setResults] = useState(null);
  const [paused, setPaused] = useState(false);
  const [entering, setEntering] = useState(true);
  const [volume, setVolumeState] = useState(getVolume());

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 20);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => onVolumeChange(setVolumeState), []);
  const handleVolumeChange = (v) => setVolume(v);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.code === 'Escape' && phase === 'playing') setPaused((p) => !p);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [phase]);

  const startTrack = (t) => {
    setTrack(t);
    setResults(null);
    setPaused(false);
    setPhase('playing');
  };

  const handleFinish = (r) => {
    setResults(r);
    setPhase('results');
  };

  const totalJudged = results ? results.perfect + results.good + results.miss : 0;
  const accuracy = totalJudged > 0
    ? Math.round(((results.perfect + results.good * 0.5) / totalJudged) * 1000) / 10
    : 0;

  return (
    <>
      <div className="dance-backdrop" />
      <div className="crt-overlay" />

      <div className="lab-header">
        <a className="brand-logo" href="../index.html">
          <img src="images/CSL-logo.png" alt="CSL — Cyber Stress Lab" />
        </a>
        <h1 className="lab-title">DANCE LAB<span className="star-accent">*</span></h1>
        <p className="lab-subtitle">MOVE IT. LET IT OUT.</p>
      </div>

      {phase === 'playing' && (
        <button className="pause-btn" onClick={() => setPaused((p) => !p)}>
          ESC ⏸ PAUSE
        </button>
      )}

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

      <a className="back-link" href="../index.html">
        <img src="images/sticker-back.png" alt="뒤로가기" />
      </a>

      {phase === 'select' && (
        <div className="select-stage">
          <img src="images/dancing_woman.png" alt="" className="dancer-select-img" />
          <p className="marker-note note-pick">PICK A TRACK<br />AND MOVE!</p>
          <div className="track-cards">
            {TRACKS.map((t) => (
              <button key={t.id} className="track-card" style={{ '--accent': t.color }} onClick={() => startTrack(t)}>
                <span className="track-name">{t.name}</span>
                <span className="track-subtitle">{t.subtitle}</span>
                <span className="track-play">PLAY ▶</span>
              </button>
            ))}
          </div>
          <p className="hint">화살표 키(←↓↑→)로 박자를 맞춰보세요 · ESC로 일시정지</p>
        </div>
      )}

      {phase === 'playing' && track && (
        <Game track={track} paused={paused} onFinish={handleFinish} />
      )}

      {phase === 'results' && results && (
        <div className="result-overlay">
          <h2>STRESS RELEASED<span className="star-accent">*</span></h2>
          <p className="result-track">{track?.name}</p>
          <div className="result-stats">
            <div className="result-stat"><span className="stat-num">{results.score}</span><span className="stat-label">SCORE</span></div>
            <div className="result-stat"><span className="stat-num">{results.maxCombo}</span><span className="stat-label">MAX COMBO</span></div>
            <div className="result-stat"><span className="stat-num">{accuracy}%</span><span className="stat-label">ACCURACY</span></div>
          </div>
          <div className="result-breakdown">
            <span className="tier-perfect">PERFECT {results.perfect}</span>
            <span className="tier-good">GOOD {results.good}</span>
            <span className="tier-miss">MISS {results.miss}</span>
          </div>
          <div className="result-actions">
            <button className="result-btn" onClick={() => setPhase('select')}>다른 곡 하기</button>
            <a className="result-btn result-btn-outline" href="../index.html">메인화면으로 돌아가기</a>
          </div>
        </div>
      )}

      <div className={`enter-flash${entering ? '' : ' is-faded'}`} />
    </>
  );
}
