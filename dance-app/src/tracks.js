// 저작권 문제없이 쓸 수 있도록, 실제 음원 대신 Web Audio로 직접 합성하는
// EDM풍 트랙 3곡. 드럼/베이스/리드 패턴은 모두 16분음표 1마디(16스텝) 격자를
// 공유하고, 화살표 노트(chartLanes)도 같은 격자 위의 자리에 얹혀서 나온다
// — 그래서 노트가 항상 음악의 실제 타격 지점과 정확히 맞아떨어진다.
// (스텝 격자 자체가 노트 생성의 기준이라 "따로 박자를 맞춰 채보"할 필요가 없음)
//
// chartSteps는 일부러 8분음표(스텝 2개 간격)가 아니라 4분음표(스텝 4개
// 간격, 한 마디에 4개)로 뒀다 — 처음엔 8분음표로 4레인에 동시에 쏟아지니
// 눈으로 따라가기엔 너무 빡빡했다. 정밀 조준 게임이 아니라 그냥 박자 타는
// 재미가 목적이라, 한 박에 한 번 정도가 "따라칠 만한" 밀도다.
//
// lane: 0~3, 화살표 키 배열 순서(←↓↑→, 물리 키보드 배치와 동일하게)와
// Game.jsx의 LANES 상수에서 매핑된다.

const STEPS_PER_BAR = 16;

export const TRACKS = [
  {
    id: 'neon-pulse',
    name: 'NEON PULSE',
    subtitle: 'FUTURE BASS · 128 BPM',
    bpm: 128,
    bars: 24,
    color: '#9b5de5',
    kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hat:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    bassSteps: [0, 4, 8, 12],
    bassFreq: 55, // A1
    leadSteps: [2, 6, 10, 14],
    leadNotes: [440, 523.25, 587.33, 659.25], // A4 C5 D5 E5, 스텝마다 순환
    chartSteps: [0, 4, 8, 12],
    chartLanes: [0, 1, 2, 3],
  },
  {
    id: 'voltage',
    name: 'VOLTAGE',
    subtitle: 'HARD TRAP · 140 BPM',
    bpm: 140,
    bars: 24,
    color: '#ff3d94',
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,1, 0,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    hat:   [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    bassSteps: [0, 8],
    bassFreq: 41.2, // E1
    leadSteps: [4, 12],
    leadNotes: [329.63, 392.0, 440.0, 587.33], // E4 G4 A4 D5
    chartSteps: [0, 4, 8, 12],
    chartLanes: [3, 1, 0, 2],
  },
  {
    id: 'sunburst',
    name: 'SUNBURST',
    subtitle: 'PROGRESSIVE HOUSE · 124 BPM',
    bpm: 124,
    bars: 24,
    color: '#cdfa4d',
    kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hat:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
    bassSteps: [0, 4, 8, 12],
    bassFreq: 65.41, // C2
    leadSteps: [0, 2, 4, 6, 8, 10, 12, 14],
    leadNotes: [523.25, 659.25, 783.99, 1046.5], // C5 E5 G5 C6
    chartSteps: [0, 4, 8, 12],
    chartLanes: [0, 2, 3, 1],
  },
];

export function getTrack(id) {
  return TRACKS.find((t) => t.id === id) ?? TRACKS[0];
}

export { STEPS_PER_BAR };
