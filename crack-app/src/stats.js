// 지금까지 깬 왁뿌볼 총 개수 — 세션이 끝나도(새로고침해도) 유지되도록
// localStorage에 누적한다. roundsCleared(App.jsx의 세션 카운트)와 달리
// 이건 브라우저에 영구 저장되는 "지금까지 총" 기록이다.
const KEY = 'csl-crack-total-broken';

export function getTotalBroken() {
  return Number(localStorage.getItem(KEY) ?? '0');
}

export function incrementTotalBroken() {
  const next = getTotalBroken() + 1;
  localStorage.setItem(KEY, String(next));
  return next;
}
