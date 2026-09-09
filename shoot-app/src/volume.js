// 사운드 음량 조절 — 메인 사이트(script.js)와 같은 localStorage 키(csl-volume)를
// 공유해서, 메인 화면에서 맞춘 음량이 SHOOT LAB에 들어와도 그대로 유지되게 한다.
const KEY = 'csl-volume';
const listeners = new Set();
let volume = Number(localStorage.getItem(KEY) ?? '50') / 100;

export function getVolume() {
  return volume;
}

export function setVolume(v) {
  volume = Math.min(1, Math.max(0, v));
  localStorage.setItem(KEY, String(Math.round(volume * 100)));
  listeners.forEach((fn) => fn(volume));
}

// 배경음악처럼 계속 재생 중인 사운드가 슬라이더 변경에 실시간으로 반응하도록
// 구독하는 용도. 효과음(1회성 재생)은 재생 직전에 getVolume()만 읽으면 충분하다.
export function onVolumeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
