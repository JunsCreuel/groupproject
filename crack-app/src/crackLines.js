// 타격마다 하나씩 늘어나는 금 그래픽 — 실제 크랙 텍스처 이미지가 없어서
// SVG 꺾은선을 직접 생성한다. index로 시드를 고정한 의사난수를 써서, 같은
// hits 값이면 리렌더링돼도 항상 같은 모양의 금이 그려지도록 했다(매 렌더마다
// Math.random을 새로 쓰면 이미 그어진 금의 모양이 계속 바뀌어 보임).
import { HITS_TO_BREAK } from './constants.js';

function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MAX_R = 0.9; // 공 반지름의 90%까지만 — 유리 테두리 밖으로 금이 삐져나가지 않도록

// 충격 지점(중심)에서 방사형으로 뻗는 금 하나. 완전 랜덤 각도 대신 hits 전체
// 개수만큼 고르게 나눈 각도 + 약간의 흔들림을 써서, 유리구슬 전체에 고르게
// 금이 퍼지는(한쪽에만 몰리지 않는) 거미줄 모양이 되게 한다.
function spokeAngle(index) {
  const rand = mulberry32(index * 97 + 13);
  const base = (index / HITS_TO_BREAK) * Math.PI * 2;
  return base + (rand() - 0.5) * 0.5;
}

export function makeCrackPoints(index, radius) {
  const rand = mulberry32(index * 97 + 13);
  const angle = spokeAngle(index);
  const segments = 4 + Math.floor(rand() * 2);
  const maxR = radius * MAX_R;
  const points = ['0,0'];
  let r = radius * 0.1;
  let a = angle;
  for (let i = 0; i < segments; i++) {
    r = Math.min(maxR, r + (maxR / segments) * (0.75 + rand() * 0.45));
    a += (rand() - 0.5) * 0.35; // 작은 흔들림만 — 스포크 방향에서 크게 안 벗어나게
    points.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return points.join(' ');
}

// 곁가지 잔금 — 메인 금 중간 지점에서 짧게 갈라져 나오는 잔금 하나
export function makeBranchPoints(index, radius) {
  const rand = mulberry32(index * 733 + 5);
  const mainAngle = spokeAngle(index);
  const maxR = radius * MAX_R;
  const startR = Math.min(maxR, radius * (0.3 + rand() * 0.3));
  const startX = Math.cos(mainAngle) * startR;
  const startY = Math.sin(mainAngle) * startR;
  const branchAngle = mainAngle + (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.5);
  const branchLen = radius * (0.12 + rand() * 0.14);
  const endR = Math.min(maxR, startR + branchLen);
  const endX = Math.cos(branchAngle) * endR;
  const endY = Math.sin(branchAngle) * endR;
  return `${startX.toFixed(1)},${startY.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;
}

// 이웃한 두 스포크를 이어주는 고리형 잔금 — 실제 깨진 유리처럼 방사형 금
// 사이사이를 가로지르는 짧은 연결선이 있어야 거미줄 느낌이 난다
export function makeRingPoints(index, radius) {
  if (index < 1) return null;
  const rand = mulberry32(index * 331 + 71);
  const ringR = radius * (0.42 + rand() * 0.28);
  const a1 = spokeAngle(index - 1);
  const a2 = spokeAngle(index);
  const x1 = Math.cos(a1) * ringR;
  const y1 = Math.sin(a1) * ringR;
  const midA = (a1 + a2) / 2 + (rand() - 0.5) * 0.15;
  const midR = ringR * (0.85 + rand() * 0.2);
  const mx = Math.cos(midA) * midR;
  const my = Math.sin(midA) * midR;
  const x2 = Math.cos(a2) * ringR;
  const y2 = Math.sin(a2) * ringR;
  return `${x1.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}
