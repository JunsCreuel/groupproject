// =====================================================================
// script.js
// 메인 화면(CSL - Cyber Stress Lab) 오브제 인터랙션 스크립트.
//
// 담당 오브제: SCREAM(입), SQUISH(핑크 블롭), CRACK(유리구슬),
// THROW(쓰레기통), SHOOT(총), SMASH(망치), CLICK(ESC 키),
// STRETCH(슬라임), DANCE(춤추는 실루엣), SCRIBBLE(낙서)
// =====================================================================
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') e.preventDefault(); // repeat 여부와 무관하게 매번 막아야 함
});

// 화면 크기 대응 — .stage(1600x1000 고정 캔버스, style.css 참고)를
// 실제 창 크기에 맞춰 비율 유지한 채 축소/확대 + 배치해서, 모니터 크기와
// 무관하게 스크롤 없이 전체 화면이 항상 다 보이도록 하는 로직.
//
// .stage는 position:fixed라 flexbox 정렬에 영향받지 않는다 — 대신 여기서
// translate()로 위치를, scale()로 크기를 직접 계산해서 넣는다(순서 중요:
// transform-origin이 top left이므로 "scale로 축소 → translate로 이동"
// 순서가 되도록 translate(...) scale(...)로 적어야 한다).
//
// shell.js가 왼쪽에 고정폭 사이드 레일(.global-rail)을 붙이면 body에
// padding-left가 생기는데, 그만큼을 사용 가능 폭에서 미리 빼줘야
// 레일 뒤에 가려지거나 반대쪽이 화면 밖으로 잘려나가지 않는다.
const STAGE_WIDTH = 1600;
const STAGE_HEIGHT = 1000;
const stage = document.getElementById('stage');

function fitStageToScreen() {
  const rail = document.querySelector('.global-rail');
  const railWidth = rail ? rail.getBoundingClientRect().width : 0;
  const availWidth = window.innerWidth - railWidth;
  const availHeight = window.innerHeight;

  const scale = Math.min(availWidth / STAGE_WIDTH, availHeight / STAGE_HEIGHT);
  const offsetX = railWidth + (availWidth - STAGE_WIDTH * scale) / 2;
  const offsetY = (availHeight - STAGE_HEIGHT * scale) / 2;

  stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

window.addEventListener('resize', fitStageToScreen);
fitStageToScreen();

// shell.js는 defer라 이 스크립트보다 늦게 실행되고, 게다가 .global-rail의
// 실제 스타일(shell.css)은 shell.js가 동적으로 삽입한 <link>를 통해
// "비동기로" 불러온다 — 그래서 레일이 DOM에 존재하더라도 그 시점엔
// 아직 스타일이 적용 안 돼 width:auto(화면 전체 폭)로 잘못 측정될 수
// 있다. "언제 다시 계산할지"를 시점으로 추측하는 대신, 레일의 실제
// 렌더 크기가 바뀔 때마다(스타일시트가 늦게 적용되는 순간 포함) 그 자체를
// 관찰해서 다시 계산하면 이런 타이밍 문제에서 완전히 자유로워진다.
function observeRail() {
  const rail = document.querySelector('.global-rail');
  if (!rail) {
    requestAnimationFrame(observeRail); // 레일이 아직 없으면 다음 프레임에 재시도
    return;
  }
  new ResizeObserver(fitStageToScreen).observe(rail);
}
observeRail();

// 오브제 클릭 애니메이션 공통 트리거 — 아래 SCREAM/SQUISH/CRACK 등
// 모든 태그 클릭 핸들러가 재사용하는 헬퍼
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
const volumeSlider = document.getElementById('volumeSlider');
let musicOn = false;

// 전체 음량 — 슬라이더로 조절, localStorage에 저장해서 새로고침해도 유지된다.
// SHOOT LAB(shoot-app)도 같은 origin이라 같은 키를 읽어서 음량을 공유한다.
let masterVolume = Number(localStorage.getItem('csl-volume') ?? '50') / 100;
volumeSlider.value = Math.round(masterVolume * 100);

function setMusic(on) {
  musicOn = on;
  if (musicOn) {
    bgMusic.volume = locked ? masterVolume : bgMusic.volume; // 충전 중이면 rampLoop가 매 프레임 갱신하므로 그대로 둠
    bgMusic.play().catch(() => {}); // 브라우저 자동재생 정책으로 실패할 수 있어 catch 처리
    soundState.textContent = '🔊 ON';
  } else {
    bgMusic.pause();
    soundState.textContent = '🔇 OFF';
  }
}

soundToggle.addEventListener('click', () => setMusic(!musicOn));

volumeSlider.addEventListener('input', () => {
  masterVolume = Number(volumeSlider.value) / 100;
  localStorage.setItem('csl-volume', String(volumeSlider.value));
  // 충전 중(hyped && !locked)이면 rampLoop가 다음 프레임에 알아서 반영하므로 여기선 건드리지 않음
  if (musicOn && (!hyped || locked)) {
    bgMusic.volume = masterVolume;
  }
});

// ---------------------------------------------------------------
// 하이프(HYPED) 모드 — 메인 화면 헤드라인 아래 "SPACE 를 꾹 눌러
// 시작하기" 게이지(#hypeGauge)를 구동하는 상태 머신.
// 음악 볼륨 / --hype-speed(오브제 속도 배수) / 게이지 너비를 같은
// 진행률(t)로 동기화해서, 충전 중엔 셋이 같이 커지다가 완충되면
// 그 상태로 고정(locked)되도록 만든 것.
//
// HOLD_RAMP_MS: 완충까지 걸리는 시간, MAX_SPEED: 완충 시 오브제 속도 배수
// ---------------------------------------------------------------
const HOLD_RAMP_MS = 2500;
const MAX_SPEED = 2;

const hypeGauge = document.getElementById('hypeGauge');
const hypeHint = document.getElementById('hypeHint');
const gaugeFill = document.getElementById('gaugeFill');

let hyped = false; // 지금 게이지가 차오르는 중이거나(또는 이미 고정된) 상태
let locked = false; // 게이지를 다 채워서 하이프 상태가 영구 고정됐는지
let holdStartTime = null;
let rampFrameId = null;

function setHypeSpeed(multiplier) {
  document.body.style.setProperty('--hype-speed', multiplier);
}

function setGauge(t) {
  gaugeFill.style.width = `${t * 100}%`;
}

function rampLoop(now) {
  if (!hyped) return;

  // 진행률 0~1, 선형. rAF 타임스탬프가 아주 드물게 holdStartTime보다
  // 앞설 수 있어(프레임 타이밍 오차) 음수가 나오지 않도록 clamp 처리.
  const t = Math.max(0, Math.min((now - holdStartTime) / HOLD_RAMP_MS, 1));
  setHypeSpeed(1 + t * (MAX_SPEED - 1));
  bgMusic.volume = t * masterVolume;
  setGauge(t);

  if (t >= 1) {
    lockHype();
    return; // 다 찼으면 더 이상 매 프레임 갱신할 필요 없음
  }

  rampFrameId = requestAnimationFrame(rampLoop);
}

function lockHype() {
  locked = true;
  bgMusic.volume = masterVolume;
  setHypeSpeed(MAX_SPEED);
  setGauge(1);
  hypeHint.textContent = 'STRESS RELEASED';
  hypeGauge.classList.add('is-charged'); // 게이지 UI는 서서히 사라짐
}

function startCharging() {
  if (locked || hyped) return; // 이미 고정됐거나 이미 채우는 중이면 무시
  hyped = true;
  document.body.classList.add('hyped');
  holdStartTime = performance.now();
  bgMusic.volume = 0; // 처음엔 조용하게 시작해서 점점 커지도록
  setHypeSpeed(1);
  setGauge(0);
  setMusic(true);
  rampFrameId = requestAnimationFrame(rampLoop);
}

function releaseCharging() {
  if (locked || !hyped) return; // 이미 고정됐으면 손을 떼도 유지
  hyped = false;
  cancelAnimationFrame(rampFrameId);
  document.body.classList.remove('hyped');
  setHypeSpeed(1);
  setGauge(0);
  setMusic(false);
}

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat) return; // e.repeat: 꾹 누르고 있을 때 반복 발생하는 keydown은 무시 (스크롤 방지 자체는 파일 위쪽 리스너가 이미 처리함)
  startCharging();
});

window.addEventListener('keyup', (e) => {
  if (e.code !== 'Space') return;
  releaseCharging();
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
// CRACK — 유리구슬, 클릭하면 살짝 금가는 미리보기 펄스 후 코랄레드 물감
// 전환과 함께 왁뿌볼 미니앱(crack/index.html, React)으로 이동
// ---------------------------------------------------------------
const glassball = document.getElementById('obj-crack');
const crackTag = document.querySelector('.tag-crack');

crackTag.addEventListener('click', () => {
  pulse(glassball, 'crack-1', 250);
  playSplashTransition(crackTag, 'crack', () => {
    window.location.href = '../crack/index.html';
  });
});

// ---------------------------------------------------------------
// THROW — 쓰레기통 오브제, 클릭하면 뭔가 던져 넣은 듯 통이 흔들림
// ---------------------------------------------------------------
const trash = document.getElementById('obj-trash');
document.querySelector('.tag-throw').addEventListener('click', () => {
  pulse(trash, 'is-thrown', 400);
});

// ---------------------------------------------------------------
// 오브제별 화면 전환 연출 — 클릭한 태그의 배경색 + "<태그이름>-splash.png"
// 물감 이미지를 화면 중앙에 확 터뜨린 뒤, 다음 화면으로 이동한다.
// (지금은 SHOOT만 실제로 이동하는 화면이 있어서 쓰이지만, 다른 오브제도
// 각자 splash 이미지가 assets/images/에 이미 올라와 있어서 나중에 해당
// 오브제에 서브 화면이 생기면 이 함수를 그대로 재사용하면 된다.)
const pageTransition = document.getElementById('pageTransition');
const pageTransitionSplash = document.getElementById('pageTransitionSplash');

function playSplashTransition(tagEl, splashName, onDone) {
  pageTransition.style.background = getComputedStyle(tagEl).backgroundColor;
  pageTransitionSplash.src = `../assets/images/${splashName}-splash.png`;
  pageTransition.classList.add('is-active');
  setTimeout(() => {
    pageTransition.classList.remove('is-active');
    onDone();
  }, 420); // .page-transition-splash의 transform transition 시간과 맞춤
}

// ---------------------------------------------------------------
// SHOOT — 총 오브제, 클릭하면 반동(recoil) 애니메이션 후 SHOOT 태그 색(라임)
// 물감 전환과 함께 사격장 미니앱(shoot/index.html, React+Three.js)으로 이동
// ---------------------------------------------------------------
const gun = document.getElementById('obj-gun');
const shootTag = document.querySelector('.tag-shoot');

shootTag.addEventListener('click', () => {
  pulse(gun, 'is-firing', 150);
  playSplashTransition(shootTag, 'shoot', () => {
    window.location.href = '../shoot/index.html';
  });
});

// ---------------------------------------------------------------
// SMASH — 망치 오브제, 클릭하면 내려치는 연출
// ---------------------------------------------------------------
const hammer = document.getElementById('obj-hammer');
document.querySelector('.tag-smash').addEventListener('click', () => {
  pulse(hammer, 'is-smashing', 300);
});

// ---------------------------------------------------------------
// CLICK — ESC 키 오브제, 클릭하면 살짝 눌리는 미리보기 펄스 후 민트색
// 물감 전환과 함께 키캡 미니앱(click/index.html, React)으로 이동
// ---------------------------------------------------------------
const escKey = document.getElementById('obj-esc');
const clickTag = document.querySelector('.tag-click');
clickTag.addEventListener('click', () => {
  pulse(escKey, 'is-pressed', 150);
  playSplashTransition(clickTag, 'click', () => {
    window.location.href = '../click/index.html';
  });
});

// ---------------------------------------------------------------
// STRETCH — 슬라임 오브제, 클릭하면 옆으로 늘어났다 돌아옴
// ---------------------------------------------------------------
const slime = document.getElementById('obj-slime');
document.querySelector('.tag-stretch').addEventListener('click', () => {
  pulse(slime, 'is-stretching', 400);
});

// ---------------------------------------------------------------
// DANCE — 춤추는 실루엣. 평소엔 가만히 있다가(정적인 이미지),
// 태그를 클릭하면 잠깐 춤추는 모션을 재생한다. 하이프 모드에서는
// style.css의 body.hyped 규칙이 자동으로 계속 움직이게 만든다.
// ---------------------------------------------------------------
const dancer = document.getElementById('obj-dancer');
const danceTag = document.querySelector('.tag-dance');
danceTag.addEventListener('click', () => {
  pulse(dancer, 'is-dancing', 400);
  playSplashTransition(danceTag, 'dance', () => {
    window.location.href = '../dance/index.html';
  });
});

// ---------------------------------------------------------------
// SCRIBBLE — 연필 오브제, 클릭하면 낙서하듯 흔들림
// ---------------------------------------------------------------
const scribble = document.getElementById('obj-scribble');
document.querySelector('.tag-scribble').addEventListener('click', () => {
  pulse(scribble, 'is-drawing', 400);
});

// ---------------------------------------------------------------
// PICK A LAB 버튼 — 다음 섹션/서브페이지로 이동시킬 스크롤 트리거
// ---------------------------------------------------------------
document.getElementById('pickLabBtn').addEventListener('click', () => {
  window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
});

// ---------------------------------------------------------------
// ABOUT 모달 — 상단 네비게이션의 ABOUT 클릭 시 기획 배경 패널을 띄움
// ---------------------------------------------------------------
const aboutModal = document.getElementById('aboutModal');
const aboutLink = document.getElementById('aboutLink');
const aboutClose = document.getElementById('aboutClose');

function openAbout() {
  aboutModal.classList.add('is-open');
}

function closeAbout() {
  aboutModal.classList.remove('is-open');
}

aboutLink.addEventListener('click', (e) => {
  e.preventDefault();
  openAbout();
});

aboutClose.addEventListener('click', closeAbout);

// 패널 바깥(어두운 배경) 클릭하면 닫힘
aboutModal.addEventListener('click', (e) => {
  if (e.target === aboutModal) closeAbout();
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && aboutModal.classList.contains('is-open')) closeAbout();
});
