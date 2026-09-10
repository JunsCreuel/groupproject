// LIVE TRANSMISSIONS / GLOBAL STRESS MAP가 공유하는 카테고리 체계 +
// 시드 데이터. 지금은 전부 목업이고 실제 게시/댓글/공감은 이 브라우저의
// localStorage에만 쌓인다 — 백엔드가 붙으면 이 파일의 SEED_POSTS를
// API 응답으로, saveState()/loadState()를 fetch 기반으로 바꿔치기하면
// 나머지 로직(정렬, 카테고리 매칭, 렌더링)은 그대로 재사용할 수 있게
// 일부러 "저장소 접근"과 "화면 로직"을 분리해뒀다.

const CATEGORIES = [
  { id: 'work', label: 'WORK', color: '#5ec8f0' },
  { id: 'people', label: 'PEOPLE', color: '#ff8c42' },
  { id: 'love', label: 'LOVE', color: '#ff3d94' },
  { id: 'money', label: 'MONEY', color: '#cdfa4d' },
  { id: 'myself', label: 'MYSELF', color: '#b39cff' },
  { id: 'other', label: 'OTHER', color: '#45d9c0' },
];

const SEED_POSTS = [
  {
    id: 'seed-1',
    subject: 'SUBJECT 0821',
    category: 'work',
    text: '오늘 또 회의 세 개 연속이었다.',
    lab: 'THROW BAY',
    comments: [
      { id: 'c1', text: '저도 회의만 하다 하루 다 갔어요...', likes: 12 },
      { id: 'c2', text: 'THROW BAY 가서 다 던져버리세요', likes: 4 },
    ],
  },
  {
    id: 'seed-2',
    subject: 'SUBJECT 1194',
    category: 'myself',
    text: 'I am so done with today.',
    lab: 'SCREAM BOOTH',
    comments: [
      { id: 'c3', text: 'same. 오늘 같이 소리질러요', likes: 9 },
    ],
  },
  {
    id: 'seed-3',
    subject: 'SUBJECT 0728',
    category: 'love',
    text: '전남친 인스타 봄. 최악.',
    lab: 'CRACK LAB',
    comments: [
      { id: 'c4', text: '왁뿌볼 하나로는 부족했을 것 같은데 괜찮으세요', likes: 15 },
      { id: 'c5', text: '저도 어제 그랬는데 CRACK LAB에서 좀 풀렸어요', likes: 21 },
      { id: 'c6', text: '보지 마세요 제발...', likes: 3 },
    ],
  },
  {
    id: 'seed-4',
    subject: 'SUBJECT 0413',
    category: 'myself',
    text: '생각이 너무 많다.',
    lab: 'SQUISH UNIT',
    comments: [],
  },
  {
    id: 'seed-5',
    subject: 'SUBJECT 0956',
    category: 'money',
    text: '월급 들어오자마자 다 빠져나갔다.',
    lab: 'CRACK LAB',
    comments: [
      { id: 'c7', text: '저희 통장은 그냥 스쳐가는 정거장이에요', likes: 18 },
    ],
  },
  {
    id: 'seed-6',
    subject: 'SUBJECT 0339',
    category: 'people',
    text: '팀원이 또 내 일을 떠넘겼다.',
    lab: 'SMASH THE DEADLINE',
    comments: [
      { id: 'c8', text: 'CLICK LAB에서 키보드나 백번 눌렀어요 화나서', likes: 27 },
    ],
  },
];

// 05. GLOBAL STRESS MAP 기본값 — 실제 게시물이 쌓이면 계산되는 값과
// 합산해서 보여준다(완전히 정적이면 재미없어서, 목업 위에 실사용 신호를
// 살짝 얹었다)
const BASE_STRESS_SHARE = {
  work: 31,
  people: 24,
  love: 17,
  money: 13,
  myself: 9,
  other: 6,
};
