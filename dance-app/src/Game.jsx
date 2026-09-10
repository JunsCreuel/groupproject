import { useEffect, useRef, useState } from 'react';
import { TrackScheduler, getAudioCtx } from './audioEngine.js';
import { generateChart, getSongDuration } from './chart.js';

// 물리 화살표 키보드 배치(←↓↑→)와 같은 순서로 레인을 둔다 — 화면 왼쪽부터
// LEFT, DOWN, UP, RIGHT 순. code/키 값과 표시 문자, CSS 클래스를 한 곳에서 관리.
const LANES = [
  { code: 'ArrowLeft', glyph: '←', cls: 'lane-left' },
  { code: 'ArrowDown', glyph: '↓', cls: 'lane-down' },
  { code: 'ArrowUp', glyph: '↑', cls: 'lane-up' },
  { code: 'ArrowRight', glyph: '→', cls: 'lane-right' },
];

const NOTE_TRAVEL_MS = 1500; // 노트가 화면 위에서 판정선까지 내려오는 데 걸리는 시간
const PERFECT_WINDOW = 0.07; // 초
const GOOD_WINDOW = 0.16;
const MISS_GRACE = 0.2; // 판정선을 이만큼 지나도록 못 누르면 자동 MISS

export default function Game({ track, paused, onFinish }) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [popup, setPopup] = useState(null); // { tier, key } — 판정 텍스트 잠깐 표시
  const [laneFlash, setLaneFlash] = useState([false, false, false, false]);

  const chartRef = useRef([]);
  const startTimeRef = useRef(0);
  const schedulerRef = useRef(null);
  const rafRef = useRef(null);
  const statsRef = useRef({ perfect: 0, good: 0, miss: 0, score: 0, combo: 0, maxCombo: 0 });
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // AudioContext.currentTime이 이 게임의 유일한 시계라서(노트 위치, 자동
  // MISS 판정, 종료 시점 전부 여기서 파생됨), 컨텍스트를 suspend()만 해도
  // 소리와 노트 이동이 정확히 같은 순간에 함께 멈춘다 — 별도로 "멈춘 시간
  // 만큼 보정"하는 로직이 필요 없다.
  useEffect(() => {
    const ctx = getAudioCtx();
    if (paused) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  }, [paused]);

  useEffect(() => {
    const ctx = getAudioCtx();
    const scheduler = new TrackScheduler(track);
    const startTime = scheduler.start();
    startTimeRef.current = startTime;
    schedulerRef.current = scheduler;
    chartRef.current = generateChart(track, startTime);
    const duration = getSongDuration(track);

    const popNote = (note, tier) => {
      note.judged = true;
      note.tier = tier;
      if (note.el) {
        note.el.classList.add(`note-${tier}`);
        note.el.classList.add('note-gone');
      }
      const s = statsRef.current;
      if (tier === 'perfect') { s.perfect += 1; s.score += 300; s.combo += 1; }
      else if (tier === 'good') { s.good += 1; s.score += 100; s.combo += 1; }
      else { s.miss += 1; s.combo = 0; }
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      setScore(s.score);
      setCombo(s.combo);
      setPopup({ tier, key: `${note.id}-${performance.now()}`, lane: note.lane });
    };

    const handleKeyDown = (e) => {
      const laneIndex = LANES.findIndex((l) => l.code === e.code);
      if (laneIndex === -1) return;
      e.preventDefault();
      if (pausedRef.current) return;

      setLaneFlash((prev) => {
        const next = [...prev];
        next[laneIndex] = true;
        return next;
      });
      setTimeout(() => {
        setLaneFlash((prev) => {
          const next = [...prev];
          next[laneIndex] = false;
          return next;
        });
      }, 100);

      const now = ctx.currentTime;
      let best = null;
      let bestDelta = Infinity;
      for (const note of chartRef.current) {
        if (note.judged || note.lane !== laneIndex) continue;
        const delta = Math.abs(now - note.time);
        if (delta < bestDelta) {
          bestDelta = delta;
          best = note;
        }
      }
      if (best && bestDelta <= GOOD_WINDOW) {
        popNote(best, bestDelta <= PERFECT_WINDOW ? 'perfect' : 'good');
      }
      // 근처에 노트가 없는 "헛침"은 콤보를 끊지 않고 그냥 무시한다 — 캐주얼한
      // 스트레스 해소용이라 지나치게 가혹한 판정을 피했다.
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      const now = ctx.currentTime;

      for (const note of chartRef.current) {
        if (!note.judged && now - note.time > MISS_GRACE) {
          popNote(note, 'miss');
        }
        if (note.el && !note.el.dataset.gone) {
          const msUntil = (note.time - now) * 1000;
          const progress = 1 - msUntil / NOTE_TRAVEL_MS; // 0(등장) ~ 1(판정선)
          const topPct = progress * 100;
          note.el.style.top = `${topPct}%`;
          if (note.judged) {
            note.el.dataset.gone = '1';
          }
        }
      }

      if (now > startTimeRef.current + duration + MISS_GRACE + 0.5 && !finishedRef.current) {
        finishedRef.current = true;
        scheduler.stop();
        const s = statsRef.current;
        const totalNotes = chartRef.current.length;
        onFinish({
          score: s.score,
          maxCombo: s.maxCombo,
          perfect: s.perfect,
          good: s.good,
          miss: s.miss,
          totalNotes,
        });
        return;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(rafRef.current);
      scheduler.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  return (
    <div className="game-stage">
      <div className="hud-top">
        <div className="hud-score">SCORE <span>{String(score).padStart(6, '0')}</span></div>
        <div className={`hud-combo${combo > 0 ? ' is-active' : ''}`}>
          {combo > 0 && <><span className="combo-num">{combo}</span> COMBO</>}
        </div>
      </div>

      <div className="lanes">
        {LANES.map((lane, i) => (
          <div key={lane.code} className={`lane ${lane.cls}`}>
            <div className="lane-track" />
            <div className={`receptor${laneFlash[i] ? ' is-flash' : ''}`}>{lane.glyph}</div>
            {chartRef.current.filter((n) => n.lane === i).map((note) => (
              <div
                key={note.id}
                ref={(el) => { note.el = el; }}
                className="note"
                style={{ top: '-10%' }}
              >
                {lane.glyph}
              </div>
            ))}
            {popup && popup.lane === i && (
              <div key={popup.key} className={`judge-popup judge-${popup.tier}`}>
                {popup.tier === 'perfect' ? 'PERFECT' : popup.tier === 'good' ? 'GOOD' : 'MISS'}
              </div>
            )}
          </div>
        ))}
      </div>

      {paused && (
        <div className="pause-overlay">
          <p>PAUSED</p>
          <span>ESC를 다시 눌러 계속하기</span>
        </div>
      )}
    </div>
  );
}
