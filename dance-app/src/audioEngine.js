// 3곡 모두 실제 음원 파일이 아니라 Web Audio로 그 자리에서 합성한다 —
// 저작권 걱정이 없고, 무엇보다 스텝 격자(=노트 채보 기준)와 소리가 같은
// 시계(AudioContext.currentTime)에서 나오기 때문에 화살표 노트와 박자가
// 어긋날 일이 구조적으로 없다.
import { getVolume } from './volume.js';
import { STEPS_PER_BAR } from './tracks.js';

let ctx;
export function getAudioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function noiseBuffer(audioCtx, duration) {
  const size = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, size, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playKick(time) {
  const audioCtx = getAudioCtx();
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);
  const g = audioCtx.createGain();
  const peak = 0.9 * getVolume();
  g.gain.setValueAtTime(peak, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + 0.2);
}

function playSnare(time) {
  const audioCtx = getAudioCtx();
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer(audioCtx, 0.15);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 0.8;
  const g = audioCtx.createGain();
  const peak = 0.45 * getVolume();
  g.gain.setValueAtTime(peak, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
  src.connect(filter).connect(g).connect(audioCtx.destination);
  src.start(time);
  src.stop(time + 0.16);

  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, time);
  const g2 = audioCtx.createGain();
  g2.gain.setValueAtTime(peak * 0.6, time);
  g2.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
  osc.connect(g2).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + 0.09);
}

function playHat(time, gain = 1) {
  const audioCtx = getAudioCtx();
  const src = audioCtx.createBufferSource();
  src.buffer = noiseBuffer(audioCtx, 0.05);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;
  const g = audioCtx.createGain();
  const peak = 0.22 * getVolume() * gain;
  g.gain.setValueAtTime(peak, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
  src.connect(filter).connect(g).connect(audioCtx.destination);
  src.start(time);
  src.stop(time + 0.05);
}

function playBass(time, freq, duration) {
  const audioCtx = getAudioCtx();
  const osc = audioCtx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, time);
  filter.frequency.exponentialRampToValueAtTime(220, time + duration);
  filter.Q.value = 1.2;
  const g = audioCtx.createGain();
  const peak = 0.32 * getVolume();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(peak, time + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(filter).connect(g).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

function playLead(time, freq, duration) {
  const audioCtx = getAudioCtx();
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);
  const g = audioCtx.createGain();
  const peak = 0.16 * getVolume();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(peak, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.15;

// 표준 Web Audio "lookahead scheduler" 패턴 — setInterval로 자주 깨어나되,
// 실제 재생 시각은 AudioContext.currentTime 기준으로 살짝 미리 예약해둔다.
// (setInterval의 타이밍 자체는 부정확해도, 예약된 오디오 이벤트는
// AudioContext의 정밀한 시계로 재생되기 때문에 박자가 흔들리지 않는다.)
export class TrackScheduler {
  constructor(track) {
    this.track = track;
    this.ctx = getAudioCtx();
    this.stepDuration = 60 / track.bpm / 4; // 16분음표 길이(초)
    this.totalSteps = track.bars * STEPS_PER_BAR;
    this.currentStep = 0;
    this.nextStepTime = 0;
    this.timerId = null;
    this.startTime = 0;
    this.playing = false;
  }

  // 실제로 소리가 나기 시작할 AudioContext 시각을 반환 — Game 컴포넌트가
  // 이 시각을 기준으로 노트 채보(chart.js)를 만들어야 화살표와 소리가 맞는다.
  start(leadInSec = 1.2) {
    this.currentStep = 0;
    this.startTime = this.ctx.currentTime + leadInSec;
    this.nextStepTime = this.startTime;
    this.playing = true;
    this._tick();
    this.timerId = setInterval(() => this._tick(), LOOKAHEAD_MS);
    return this.startTime;
  }

  stop() {
    this.playing = false;
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
  }

  _tick() {
    while (this.playing && this.nextStepTime < this.ctx.currentTime + SCHEDULE_AHEAD_S && this.currentStep < this.totalSteps) {
      this._scheduleStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += this.stepDuration;
      this.currentStep += 1;
    }
    if (this.currentStep >= this.totalSteps && this.playing) {
      this.stop();
    }
  }

  _scheduleStep(step, time) {
    const i = step % STEPS_PER_BAR;
    const t = this.track;
    if (t.kick[i]) playKick(time);
    if (t.snare[i]) playSnare(time);
    if (t.hat[i]) playHat(time, 0.85);
    const bassIdx = t.bassSteps.indexOf(i);
    if (bassIdx !== -1) playBass(time, t.bassFreq, this.stepDuration * 4 * 0.9);
    const leadIdx = t.leadSteps.indexOf(i);
    if (leadIdx !== -1) {
      const note = t.leadNotes[leadIdx % t.leadNotes.length];
      playLead(time, note, this.stepDuration * 2 * 0.9);
    }
  }
}
