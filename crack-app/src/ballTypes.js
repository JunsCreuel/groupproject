// 왁뿌볼 종류 — 지금은 팀에서 만든 아트가 이 핑크 유리볼 하나뿐이지만,
// 나중에 여러 종류가 추가될 걸 감안해서 처음부터 배열로 관리한다.
// 새 종류를 추가할 땐 이 배열에 항목만 더 넣으면 된다(App.jsx 수정 불필요).
export const BALL_TYPES = [
  {
    id: 'pink-glass',
    name: '핑크 유리볼',
    image: 'images/wax_ball.png',
  },
];

export function pickRandomBallType() {
  return BALL_TYPES[Math.floor(Math.random() * BALL_TYPES.length)];
}
