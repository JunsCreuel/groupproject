// 기계식 키보드 타건음 — 팀에서 올려준 실제 녹음 파일(keyboard.mp3)을 재생한다.
// 연타/꾹 누르기로 빠르게 반복 재생될 때도 소리가 끊기지 않고 다시 시작하도록
// currentTime을 매번 되감는다(다른 랩들의 효과음 재생 패턴과 동일).
import { getVolume } from './volume.js';

const sound = new Audio('sounds/keyboard.mp3');

export function playKeyClick() {
  sound.currentTime = 0;
  sound.volume = getVolume();
  sound.play().catch(() => {}); // 자동재생 정책으로 첫 재생은 실패할 수 있음
}
