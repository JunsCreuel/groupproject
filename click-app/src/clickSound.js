// 기계식 키보드 "딸깍" 타건음 — 아직 실제 녹음 파일이 없어서 Web Audio로
// 합성한다(CRACK LAB의 crunch.js와 같은 접근). 스위치가 전환되는 순간의
// 날카로운 고음 노이즈(클릭)와, 키가 바닥에 닿는 짧은 저음 타격(바텀아웃)
// 두 겹을 합쳐서 "딸깍" 소리를 흉내낸다. 나중에 진짜 키보드 녹음 파일이
// 생기면 이 함수 내부만 Audio() 재생으로 바꿔치기하면 된다.
import { getVolume } from './volume.js';

let ctx;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function playKeyClick() {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const vol = (0.32 + Math.random() * 0.06) * getVolume();

  // 스위치 전환음 — 아주 짧고 날카로운 고역 노이즈
  const size = Math.max(1, Math.floor(audioCtx.sampleRate * 0.02));
  const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / size) ** 0.5;
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2400 + Math.random() * 400;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
  src.connect(filter).connect(g).connect(audioCtx.destination);
  src.start(now);
  src.stop(now + 0.03);

  // 바텀아웃 — 키가 바닥에 닿는 짧고 단단한 "톡" 타격음
  const osc = audioCtx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1100 + Math.random() * 250, now);
  osc.frequency.exponentialRampToValueAtTime(380, now + 0.022);
  const g2 = audioCtx.createGain();
  g2.gain.setValueAtTime(vol * 0.55, now);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
  osc.connect(g2).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}
