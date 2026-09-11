// DANCE LAB 배경 음악 — 이제 합성음이 아니라 실제 음원 파일(dance.mp3, 44.67초)을
// 재생한다. BPM(약 125)과 첫 박자 위치(beatOffset)는 librosa 온셋 검출로
// 추정한 값 — 정밀 리듬게임이 아니라 "박자 타는 재미"가 목적이라 이 정도
// 근사치로 충분하다.
export const SONG = {
  file: 'sounds/dance.mp3',
  bpm: 125,
  beatOffset: 0.53, // 곡 시작~첫 박자까지 무음 구간(초)
  duration: 44.67,
};

// 곡은 하나뿐이라, 카드 선택은 "어떤 곡"이 아니라 "얼마나 빠르고 빽빽하게
// 내려오는가"(난이도)를 고르는 화면으로 바꿨다. stepInterval이 작을수록
// 16분음표 격자에서 더 촘촘하게 노트가 나오고, noteTravelMs가 작을수록
// 노트가 판정선까지 내려오는 속도가 빨라진다.
export const DIFFICULTIES = [
  {
    id: 'easy',
    name: 'EASY',
    subtitle: '천천히 박자 타기',
    color: '#5ec8f0',
    noteTravelMs: 2400,
    stepInterval: 4, // 4분음표 간격
    doubleChance: 0,
    perfectWindow: 0.13,
    goodWindow: 0.26,
  },
  {
    id: 'normal',
    name: 'NORMAL',
    subtitle: '적당히 몸을 풀기',
    color: '#9b5de5',
    noteTravelMs: 1800,
    stepInterval: 4,
    doubleChance: 0.1,
    perfectWindow: 0.1,
    goodWindow: 0.22,
  },
  {
    id: 'hard',
    name: 'HARD',
    subtitle: '제대로 발산하기',
    color: '#ff3d94',
    noteTravelMs: 1300,
    // 8분음표 간격(stepInterval: 2)으로 뒀더니 화살표가 너무 촘촘하게
    // 쏟아져서 사실상 못 따라칠 정도였다 — EASY/NORMAL과 같은 4분음표
    // 간격으로 개수를 줄이고, 대신 빠른 낙하 속도(noteTravelMs)와 좁은
    // 판정 윈도우, 더 잦은 동시 2레인 노트(doubleChance)로 난이도를 준다.
    stepInterval: 4,
    doubleChance: 0.15,
    perfectWindow: 0.08,
    goodWindow: 0.18,
  },
];

export function getDifficulty(id) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[0];
}
