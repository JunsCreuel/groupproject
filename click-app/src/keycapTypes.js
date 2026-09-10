// 키캡 종류 — 지금은 팀에서 만든 ESC 키캡 하나뿐이지만, 나중에 여러 키캡
// 종류가 추가될 걸 감안해서 처음부터 배열로 관리한다(CRACK LAB의
// ballTypes.js와 같은 패턴). 새 키캡을 추가할 땐 이 배열에 항목만 더 넣으면
// App.jsx 수정 없이 바로 반영된다.
export const KEYCAP_TYPES = [
  {
    id: 'esc',
    name: 'ESC 키캡',
    image: 'images/esc_key.png',
  },
];

export function pickRandomKeycapType() {
  return KEYCAP_TYPES[Math.floor(Math.random() * KEYCAP_TYPES.length)];
}
