// 예전엔 3곡을 Web Audio로 합성했지만, 이제는 실제 음원(dance.mp3)을 재생한다.
// 그래도 여전히 화살표 노트는 AudioContext.currentTime을 기준으로 위치가
// 계산되므로(chart.js), 이 파일은 dance.mp3를 "그냥 재생"하는 게 아니라
// AudioBufferSourceNode로 디코드해 정확히 예약된 시각(startTime)에
// source.start(startTime)로 재생을 건다 — 그래야 소리와 노트가 같은 시계를
// 공유해서 어긋나지 않는다.
import { getVolume, onVolumeChange } from './volume.js';
import { SONG } from './song.js';

let ctx;
export function getAudioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

let bufferPromise = null;
// App이 마운트되자마자 미리 호출해두면, 사용자가 난이도 고르고 "시작"을
// 누르는 시점엔 이미 디코드가 끝나있어서 체감 로딩 지연이 없다.
export function preloadSong() {
  if (!bufferPromise) {
    bufferPromise = fetch(SONG.file)
      .then((res) => res.arrayBuffer())
      .then((data) => getAudioCtx().decodeAudioData(data));
  }
  return bufferPromise;
}

const LEAD_IN_SEC = 1.2;

export class SongPlayer {
  constructor() {
    this.source = null;
    this.gain = null;
    this.unsub = null;
  }

  // 실제로 소리가 나기 시작할 AudioContext 시각을 반환 — Game 컴포넌트가
  // 이 시각을 기준으로 노트 채보(chart.js)를 만들어야 화살표와 소리가 맞는다.
  async start() {
    const audioCtx = getAudioCtx();
    const buffer = await preloadSong();

    const gain = audioCtx.createGain();
    gain.gain.value = getVolume();
    this.unsub = onVolumeChange((v) => { gain.gain.value = v; });
    gain.connect(audioCtx.destination);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);

    const startTime = audioCtx.currentTime + LEAD_IN_SEC;
    source.start(startTime);

    this.source = source;
    this.gain = gain;
    return startTime;
  }

  stop() {
    try { this.source?.stop(); } catch { /* 이미 멈췄으면 무시 */ }
    this.unsub?.();
  }
}
