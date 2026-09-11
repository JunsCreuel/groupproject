import { useEffect, useState } from 'react';
import Game from './Game.jsx';
import { DIFFICULTIES } from './song.js';
import { preloadSong } from './audioEngine.js';
import { getVolume, setVolume, onVolumeChange } from './volume.js';
import './index.css';

// DANCE LAB — 리듬게임. 노래는 하나(dance.mp3)뿐이라 카드로 고르는 건 "곡"이
// 아니라 "난이도"다 — 난이도마다 노트가 내려오는 속도와 촘촘함이 다르다.
// 화면 아래 4개 레인(←↓↑→)으로 노트가 떨어지고, 박자에 맞춰 화살표 키를
// 누르는 미니게임. 정밀 타격감보다는 "몸으로 박자를 타는" 스트레스 해소가
// 목적이라 판정을 너그럽게 뒀다.
export default function App() {
  const [phase, setPhase] = useState('select'); // 'select' | 'ready' | 'playing' | 'results'
  const [difficulty, setDifficulty] = useState(null);
  const [results, setResults] = useState(null);
  const [paused, setPaused] = useState(false);
  const [entering, setEntering] = useState(true);
  const [volume, setVolumeState] = useState(getVolume());

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 20);
    return () => clearTimeout(t);
  }, []);

  // 난이도 카드가 보이는 동안 미리 dance.mp3 디코드를 시작해둔다 — "시작"을
  // 누르는 순간엔 이미 끝나있어서 로딩 지연 없이 바로 재생된다.
  useEffect(() => { preloadSong(); }, []);

  useEffect(() => onVolumeChange(setVolumeState), []);
  const handleVolumeChange = (v) => setVolume(v);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.code === 'Escape' && phase === 'playing') setPaused((p) => !p);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [phase]);

  // 카드를 고르자마자 바로 시작하면 마음의 준비도 안 됐는데 첫 박자가
  // 바로 코앞에서 떨어져서 당황스러웠다 — 난이도만 고르고, 실제로 노트가
  // 떨어지기 시작하는 건 "시작" 버튼을 눌러야 벌어지게 분리했다.
  const selectDifficulty = (d) => {
    setDifficulty(d);
    setResults(null);
    setPhase('ready');
  };

  const beginPlay = () => {
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
          <p className="marker-note note-pick">PICK YOUR LEVEL<br />AND MOVE!</p>
          <div className="track-cards">
            {DIFFICULTIES.map((d) => (
              <button key={d.id} className="track-card" style={{ '--accent': d.color }} onClick={() => selectDifficulty(d)}>
                <span className="track-name">{d.name}</span>
                <span className="track-subtitle">{d.subtitle}</span>
                <span className="track-play">PLAY ▶</span>
              </button>
            ))}
          </div>
          <p className="hint">화살표 키(←↓↑→)로 박자를 맞춰보세요 · ESC로 일시정지</p>
        </div>
      )}

      {phase === 'ready' && difficulty && (
        <div className="select-stage">
          <img src="images/dancing_woman.png" alt="" className="dancer-select-img" />
          <p className="marker-note note-pick">{difficulty.name}</p>
          <p className="hint">화살표 키(←↓↑→)로 박자를 맞춰보세요 · ESC로 일시정지</p>
          <button className="start-btn" style={{ '--accent': difficulty.color }} onClick={beginPlay}>
            시작 →
          </button>
          <button className="hint-link" onClick={() => setPhase('select')}>난이도 다시 고르기</button>
        </div>
      )}

      {phase === 'playing' && difficulty && (
        <Game difficulty={difficulty} paused={paused} onFinish={handleFinish} />
      )}

      {phase === 'results' && results && (
        <div className="result-overlay">
          <h2>STRESS RELEASED<span className="star-accent">*</span></h2>
          <p className="result-track">{difficulty?.name}</p>
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
            <button className="result-btn" onClick={() => setPhase('select')}>다른 난이도 하기</button>
            <a className="result-btn result-btn-outline" href="../index.html">메인화면으로 돌아가기</a>
          </div>
        </div>
      )}

      <div className={`enter-flash${entering ? '' : ' is-faded'}`} />
    </>
  );
}
