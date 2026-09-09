// =====================================================================
// script.js
//
// 이 파일은 메인 화면(CSL - Cyber Stress Lab)에 있는 오브제들의
// 인터랙션을 담당한다. 오브제 하나당 함수(또는 이벤트 리스너) 하나씩
// 매칭시켜 놨기 때문에, 나중에 실제 오브제 PNG로 교체하더라도
// (예: 이모지 placeholder → slime.png) 이 로직은 그대로 재사용하면 된다.
//
// 담당 오브제 목록: SCREAM(입), SQUISH(핑크 블롭), CRACK(유리구슬),
// THROW(종이뭉치→쓰레기통), SHOOT(총), SMASH(망치+모니터),
// CLICK(ESC 키), STRETCH(슬라임), DANCE(춤추는 실루엣), SCRIBBLE(낙서)
// =====================================================================

// 특정 클래스를 잠깐 붙였다가(duration 후) 자동으로 떼는 헬퍼.
// 클릭 애니메이션은 대부분 "짧게 재생되고 원상 복귀"되는 패턴이라
// 오브제마다 반복해서 쓰기 위해 공통 함수로 뺐다.
function pulse(el, className, duration) {
  el.classList.remove(className);
  void el.offsetWidth; // 리플로우를 강제로 발생시켜서 같은 애니메이션을 다시 재생할 수 있게 함
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}

// ---------------------------------------------------------------
// 배경음악 재생/정지 (상단 네비게이션의 "SOUND" 버튼)
// ---------------------------------------------------------------
const bgMusic = document.getElementById('bgMusic');
const soundToggle = document.getElementById('soundToggle');
const soundState = document.getElementById('soundState');
let musicOn = false;

function setMusic(on) {
  musicOn = on;
  if (musicOn) {
    bgMusic.play().catch(() => {}); // 브라우저 자동재생 정책으로 실패할 수 있어 catch 처리
    soundState.textContent = '🔊 ON';
  } else {
    bgMusic.pause();
    soundState.textContent = '🔇 OFF';
  }
}

soundToggle.addEventListener('click', () => setMusic(!musicOn));

// ---------------------------------------------------------------
// 하이프(HYPED) 모드 — 최종 목표 기능
// 사용자가 스페이스바를 누르면:
//   1) 배경음악이 재생되고
//   2) 화면에 떠 있는 모든 오브제(슬라임/망치/입/왁뿌볼/댄서 등)가
//      "음악이 커지는 것"에 반응하듯 동시에 더 격렬하게 움직인다.
// 실제 애니메이션 강도 자체는 style.css의 `body.hyped ...` 규칙들이
// 담당하고, 여기서는 스페이스바 입력을 감지해서 .hyped 클래스와
// 음악 재생 여부만 토글해준다.
// ---------------------------------------------------------------
let hyped = false;

function setHyped(on) {
  hyped = on;
  document.body.classList.toggle('hyped', hyped);
  setMusic(hyped); // 하이프 모드가 켜지면 음악도 같이 재생
}

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return;
  e.preventDefault(); // 스페이스바의 기본 동작(페이지 스크롤)을 막음
  setHyped(!hyped);
});

// ---------------------------------------------------------------
// SCREAM — 입 오브제, 클릭하면 짧게 비명 지르듯 벌어짐
// ---------------------------------------------------------------
const mouth = document.getElementById('obj-scream');
document.querySelector('.tag-scream').addEventListener('click', () => {
  pulse(mouth, 'is-screaming', 700);
});

// ---------------------------------------------------------------
// SQUISH — 핑크 블롭, 클릭하면 눌렸다 튀어나오는 스쿼시 모션
// ---------------------------------------------------------------
const blob = document.getElementById('obj-squish');
document.querySelector('.tag-squish').addEventListener('click', () => {
  pulse(blob, 'is-squished', 350);
});

// ---------------------------------------------------------------
// CRACK — 유리구슬, 클릭할 때마다 금이 가고(crack-1 → crack-2 →
// crack-3) 임계값(crackMax)에 도달하면 산산조각나는 연출 후 리셋
// ---------------------------------------------------------------
const glassball = document.getElementById('obj-crack');
const crackMax = 3;

document.querySelector('.tag-crack').addEventListener('click', () => {
  const hits = Number(glassball.dataset.hits) + 1;
  glassball.dataset.hits = hits;

  glassball.classList.remove('crack-1', 'crack-2', 'crack-3');

  if (hits >= crackMax) {
    glassball.classList.add('crack-shatter');
    setTimeout(() => {
      glassball.classList.remove('crack-shatter');
      glassball.dataset.hits = 0;
      glassball.style.opacity = 1;
    }, 500);
  } else {
    glassball.classList.add(`crack-${hits}`);
  }
});

// ---------------------------------------------------------------
// THROW — 종이뭉치(오버씽킹)를 쓰레기통으로 던져버리는 연출
// ---------------------------------------------------------------
const throwCell = document.querySelector('.cell-throw');
document.querySelector('.tag-throw').addEventListener('click', () => {
  if (throwCell.classList.contains('is-thrown')) return; // 던지는 중 중복 클릭 방지
  throwCell.classList.add('is-thrown');
  setTimeout(() => throwCell.classList.remove('is-thrown'), 500);
});

// ---------------------------------------------------------------
// SHOOT — 총 오브제, 클릭하면 반동(recoil) 애니메이션
// ---------------------------------------------------------------
const gun = document.getElementById('obj-gun');
document.querySelector('.tag-shoot').addEventListener('click', () => {
  pulse(gun, 'is-firing', 150);
});

// ---------------------------------------------------------------
// SMASH — 망치가 모니터를 내려치는 연출. 모니터는 한 번 깨지면
// (is-cracked) 계속 깨진 상태를 유지한다.
// ---------------------------------------------------------------
const hammer = document.getElementById('obj-hammer');
const monitor = document.getElementById('obj-monitor');
document.querySelector('.tag-smash').addEventListener('click', () => {
  pulse(hammer, 'is-smashing', 300);
  monitor.classList.add('is-cracked');
});

// ---------------------------------------------------------------
// CLICK — ESC 키 오브제, 클릭하면 실제 키보드처럼 눌리는 모션
// ---------------------------------------------------------------
const escKey = document.getElementById('obj-esc');
document.querySelector('.tag-click').addEventListener('click', () => {
  pulse(escKey, 'is-pressed', 150);
});

// ---------------------------------------------------------------
// STRETCH — 슬라임 오브제, 클릭하면 옆으로 늘어났다 돌아옴
// ---------------------------------------------------------------
const slime = document.getElementById('obj-slime');
document.querySelector('.tag-stretch').addEventListener('click', () => {
  pulse(slime, 'is-stretching', 400);
});

// ---------------------------------------------------------------
// DANCE — 춤추는 실루엣은 평소에 계속 반복 재생 중인데,
// 태그를 클릭하면 재생/일시정지를 토글할 수 있게 함
// ---------------------------------------------------------------
const dancer = document.getElementById('obj-dancer');
document.querySelector('.tag-dance').addEventListener('click', () => {
  dancer.classList.toggle('is-paused');
});

// ---------------------------------------------------------------
// SCRIBBLE — 연필 오브제, 클릭하면 낙서하듯 흔들림
// ---------------------------------------------------------------
const scribble = document.getElementById('obj-scribble');
document.querySelector('.tag-scribble').addEventListener('click', () => {
  pulse(scribble, 'is-drawing', 400);
});
