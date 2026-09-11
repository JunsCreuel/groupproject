const CHANNELS = {
  "live-stress": {
    title: "# 실시간-스트레스",
    sub: "실시간으로 들어오는 익명 스트레스 신호.",
    online: 428,
    messages: [
      ["SUBJECT_4172","마지막으로 괜찮았던 때가 언제인지 기억나지 않아.",47],
      ["SUBJECT_1209","나도 그래.",12],
      ["SUBJECT_3341","내일 또 출근이라니...",31],
      ["SUBJECT_7816","그냥 텅 빈 기분 드는 사람 있어?",64],
      ["SUBJECT_0923","너 혼자 아니야.",53],
      ["SUBJECT_5530","여기서는 그냥 다 털어놔.",28]
    ]
  },
  "late-night": {
    title: "# 심야-접속",
    sub: "잠들지 못한 사람들의 채널.",
    online: 129,
    messages: [
      ["SUBJECT_0118","새벽 두 시인데 머릿속이 모든 일을 다시 재생한다.",88],
      ["SUBJECT_8801","아직 안 자는 사람 있어?",76],
      ["SUBJECT_2224","응. 나도 잠이 안 와.",42],
      ["SUBJECT_6400","벌써 내일 때문에 숨 막혀.",57]
    ]
  },
  "overthinking": {
    title: "# 과잉생각",
    sub: "생각이 멈추지 않을 때.",
    online: 146,
    messages: [
      ["SUBJECT_9190","아직 생기지도 않은 문제를 여섯 개나 상상했다.",105],
      ["SUBJECT_1182","나도 똑같아.",48],
      ["SUBJECT_4204","누가 내 머리 좀 꺼줬으면.",87]
    ]
  },
  work: {
    title: "# 직장-분노",
    sub: "마감. 회의. 괜찮은 척하기.",
    online: 183,
    messages: [
      ["SUBJECT_2031","상사는 우리가 진짜 로봇인 줄 아나 봐.",124],
      ["SUBJECT_7712","오늘도 12시간 일했다. 이게 무슨 의미지?",99],
      ["SUBJECT_6621","팀 프로젝트인데 또 나 혼자 다 한다.",131],
      ["SUBJECT_1189","괜찮은 척하는 것도 이제 지쳤어.",86]
    ]
  },
  school: {
    title: "# 학업-번아웃",
    sub: "과제, 시험, 비교, 압박.",
    online: 98,
    messages: [
      ["SUBJECT_2109","다들 나보다 앞서 있는 것 같아.",77],
      ["SUBJECT_5541","시험 기간은 사람 사는 게 아니다.",62],
      ["SUBJECT_9904","과제 파일 열자마자 다시 닫았다.",91]
    ]
  },
  love: {
    title: "# 연애-후유증",
    sub: "사랑도 스트레스가 될 때.",
    online: 112,
    messages: [
      ["SUBJECT_1132","오지도 않을 메시지를 계속 확인하게 돼.",101],
      ["SUBJECT_8290","그 사람을 만나기 전의 내가 그리워.",117],
      ["SUBJECT_0201","잊는 과정은 왜 이렇게 지루하지.",54]
    ]
  },
  people: {
    title: "# 인간관계",
    sub: "사람 때문에 지칠 때.",
    online: 91,
    messages: [
      ["SUBJECT_5550","모두가 나한테 뭔가를 원해.",96],
      ["SUBJECT_7120","사람 만날 의무가 없는 하루만 있었으면.",83],
      ["SUBJECT_3101","오늘은 가벼운 대화조차 너무 버겁다.",62]
    ]
  }
};

const MEMBERS = [
  ["SUBJECT_0821","#실시간-스트레스 접속 중"],
  ["SUBJECT_4410","입력 중..."],
  ["SUBJECT_7732","부수기 LAB 참여 중"],
  ["SUBJECT_0912","대기 중"],
  ["SUBJECT_6621","#직장-분노 접속 중"],
  ["SUBJECT_1209","온라인"],
  ["SUBJECT_5530","#심야-접속 접속 중"],
  ["SUBJECT_2031","온라인"]
];

const titleEl = document.getElementById("networkChannelTitle");
const subEl = document.getElementById("networkChannelSub");
const onlineEl = document.getElementById("networkOnline");
const stream = document.getElementById("networkMessages");
const composer = document.getElementById("networkComposer");
const input = document.getElementById("networkInput");
const memberList = document.getElementById("memberList");
let activeChannel = "live-stress";

function renderMembers() {
  memberList.innerHTML = MEMBERS.map(([name,status]) => `
    <div class="member">
      <span class="avatar-placeholder"></span>
      <div><strong>${name}</strong><small>${status}</small></div>
      <span class="online-dot"></span>
    </div>
  `).join("");
}

function renderChannel() {
  const channel = CHANNELS[activeChannel];
  titleEl.textContent = channel.title;
  subEl.textContent = channel.sub;
  onlineEl.textContent = channel.online;

  stream.innerHTML = channel.messages.map(([subject,text,same], i) => `
    <article class="net-message">
      <span class="avatar-placeholder"></span>
      <div>
        <div class="net-message-head">
          <strong>${subject}</strong>
          <time>${String(22 + Math.floor(i/4)).padStart(2,"0")}:${String(14 + i*2).padStart(2,"0")}</time>
        </div>
        <p>${text}</p>
        <div class="net-actions">
          <button data-same> 나도 그래 ${same}</button>
          <button>답글</button>
          <button>공유</button>
          <button>LAB 입장</button>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".channel[data-channel]").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.channel === activeChannel);
  });
}

document.querySelectorAll(".channel[data-channel]").forEach((el) => {
  el.addEventListener("click", () => {
    activeChannel = el.dataset.channel;
    renderChannel();
  });
});

stream.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-same]");
  if (!btn) return;
  const match = btn.textContent.match(/(\d+)/);
  const n = match ? Number(match[1]) + 1 : 1;
  btn.textContent = `나도 그래 ${n}`;
});

composer.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  CHANNELS[activeChannel].messages.push(["SUBJECT_0284", value, 0]);
  input.value = "";
  renderChannel();
  stream.scrollTop = stream.scrollHeight;
});

renderMembers();
renderChannel();
