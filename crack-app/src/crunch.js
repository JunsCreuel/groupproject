// 실제 "으드득" 크런치 효과음 파일이 아직 없어서, Web Audio API로 그때그때
// 노이즈를 만들어 필터링하는 방식으로 대신한다 — 짧은 화이트노이즈 버스트를
// 대역통과 필터에 통과시키면 유리/플라스틱이 갈라지는 듯한 "빠직" 소리가 난다.
// 나중에 팀원이 실제 녹음한 크런치 사운드를 올리면 이 모듈을 Audio() 재생으로
// 간단히 바꿔치기하면 된다.
import { getVolume } from './volume.js';

let ctx;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// 짧은 노이즈 버스트 하나 — filterFreq가 높을수록 "빠직"하는 얇고 날카로운
// 소리, 낮을수록 "퍽"하는 두꺼운 소리가 난다
function noiseBurst({ duration = 0.08, filterFreq = 1400, gain = 0.5, q = 0.9 }) {
  const audioCtx = getCtx();
  const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) ** 1.6; // 지수감쇠 노이즈
  }

  const src = audioCtx.createBufferSource();
  src.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = q;

  const g = audioCtx.createGain();
  const now = audioCtx.currentTime;
  const vol = gain * getVolume();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);

  src.connect(filter).connect(g).connect(audioCtx.destination);
  src.start(now);
  src.stop(now + duration + 0.02);
}

// 한 번 누를 때마다 나는 작은 크런치 — progress(0~1, 지금까지 깨진 정도)가
// 올라갈수록 톤이 조금씩 낮아지고 세져서, 점점 더 크게 금이 가는 느낌을 준다
export function playCrunch(progress = 0) {
  const base = 2000 - progress * 900; // 1100~2000Hz
  noiseBurst({ duration: 0.055, filterFreq: base + Math.random() * 300, gain: 0.32 + progress * 0.18, q: 1.1 });
  // 살짝 딜레이를 둔 두 번째 버스트를 겹쳐서 "빠지직" 하는 이중 타격감을 낸다
  setTimeout(() => {
    noiseBurst({ duration: 0.05, filterFreq: base * 0.6 + Math.random() * 200, gain: 0.22 + progress * 0.12, q: 1.4 });
  }, 18 + Math.random() * 12);
}

// 완전히 깨지는 순간 — 저음 "퍽" + 잔파편이 튀는 고음 크랙을 여러 겹 쌓는다
export function playShatter() {
  noiseBurst({ duration: 0.22, filterFreq: 260, gain: 0.6, q: 0.6 });
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      noiseBurst({ duration: 0.05 + Math.random() * 0.04, filterFreq: 1600 + Math.random() * 1800, gain: 0.28, q: 1.6 });
    }, 30 + i * 35 + Math.random() * 20);
  }
}

// 안에서 하얀 반죽이 삐져나올 때 — 낮은 톤이 스윽 미끄러지는 "찌익" 스퀴시음
export function playSquish() {
  const audioCtx = getCtx();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.35);
  const vol = 0.22 * getVolume();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(vol, now + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.42);
}
