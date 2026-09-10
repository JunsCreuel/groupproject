// 키 누른 횟수 기록 — "오늘 누른 횟수"는 매일 자정(로컬 시간)에 리셋되고,
// "지금까지 총"은 계속 누적된다. 둘 다 localStorage에 저장해서 새로고침해도
// 유지된다.
//
// 지금은 이 숫자를 브라우저 안에서만 세지만, 나중에 서버가 붙으면 여기서
// incrementClickCount()가 반환하는 값을 그대로 서버에 전송해서 전체
// 사용자 순위(주간 1등에게 실물 키캡 증정 등)를 매기는 데 쓸 수 있다 —
// 지금 단계에서는 백엔드가 없어서 순위 기능 자체는 만들지 않았다.
const DAILY_KEY = 'csl-click-daily';
const TOTAL_KEY = 'csl-click-total';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDailyCount() {
  const raw = localStorage.getItem(DAILY_KEY);
  if (!raw) return 0;
  try {
    const { date, count } = JSON.parse(raw);
    return date === todayStr() ? count : 0;
  } catch {
    return 0;
  }
}

export function getTotalCount() {
  return Number(localStorage.getItem(TOTAL_KEY) ?? '0');
}

export function incrementClickCount() {
  const daily = getDailyCount() + 1;
  localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todayStr(), count: daily }));
  const total = getTotalCount() + 1;
  localStorage.setItem(TOTAL_KEY, String(total));
  return { daily, total };
}
