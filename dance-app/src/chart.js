import { SONG } from './song.js';

const LANE_COUNT = 4;
const OUTRO_BUFFER_SEC = 1.5; // 곡 끝 페이드아웃 구간엔 노트를 두지 않는다

// 예전엔 트랙마다 4칸짜리 chartLanes 배열을 마디마다 그대로 반복 재생해서,
// 몇 마디만 지나면 항상 같은 화살표 순서가 되풀이됐다("계속 같은 반복성의
// 화살표만 내려온다") — 이제는 매 스텝마다 레인을 무작위로 뽑되, 같은
// 레인이 두 번 연속 나올 확률을 낮춰서 매번 다른 패턴이 나오면서도 너무
// 들쭉날쭉하진 않게 만든다. 난이도가 올라갈수록(stepInterval이 작을수록)
// 노트 간격이 촘촘해지고, doubleChance만큼 두 레인이 동시에 나오는 구간도
// 섞인다.
export function generateChart(startTime, difficulty) {
  const stepDuration = 60 / SONG.bpm / 4; // 16분음표 길이(초)
  const totalSteps = Math.floor((SONG.duration - SONG.beatOffset) / stepDuration);
  const notes = [];
  let lastLane = -1;
  let repeatStreak = 0;

  const pickLane = (exclude = -1) => {
    let lane;
    do {
      lane = Math.floor(Math.random() * LANE_COUNT);
    } while (lane === exclude);
    return lane;
  };

  for (let step = 0; step < totalSteps; step += difficulty.stepInterval) {
    const noteTime = SONG.beatOffset + step * stepDuration;
    if (SONG.duration - noteTime < OUTRO_BUFFER_SEC) break;

    let lane = pickLane(repeatStreak >= 1 ? lastLane : -1);
    repeatStreak = lane === lastLane ? repeatStreak + 1 : 0;
    lastLane = lane;

    notes.push({
      id: `n${step}`,
      time: startTime + noteTime,
      lane,
      judged: false,
      tier: null,
      el: null,
    });

    if (difficulty.doubleChance && Math.random() < difficulty.doubleChance) {
      const lane2 = pickLane(lane);
      notes.push({
        id: `n${step}-b`,
        time: startTime + noteTime,
        lane: lane2,
        judged: false,
        tier: null,
        el: null,
      });
    }
  }
  return notes;
}

export function getSongDuration() {
  return SONG.duration;
}
