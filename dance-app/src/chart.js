import { STEPS_PER_BAR } from './tracks.js';

// 곡의 드럼/베이스/리드를 스케줄링하는 것과 완전히 같은 스텝 격자 위에서
// 화살표 노트 시각을 계산한다 — startTime은 TrackScheduler.start()가
// 반환한 실제 재생 시작 시각(AudioContext.currentTime 기준)을 그대로
// 넘겨받아야 소리와 노트가 정확히 맞는다.
export function generateChart(track, startTime) {
  const stepDuration = 60 / track.bpm / 4;
  const totalSteps = track.bars * STEPS_PER_BAR;
  const notes = [];
  for (let step = 0; step < totalSteps; step++) {
    const i = step % STEPS_PER_BAR;
    const idx = track.chartSteps.indexOf(i);
    if (idx === -1) continue;
    const lane = track.chartLanes[idx];
    notes.push({
      id: `n${step}`,
      time: startTime + step * stepDuration,
      lane,
      judged: false,
      tier: null, // 'perfect' | 'good' | 'miss'
      el: null,
    });
  }
  return notes;
}

export function getSongDuration(track) {
  return track.bars * STEPS_PER_BAR * (60 / track.bpm / 4);
}
