const CHANNELS = {
  "live-stress": {
    title: "# live-stress",
    sub: "실시간으로 들어오는 익명 스트레스 신호.",
    online: 428,
    messages: [
      ["SUBJECT_4172","i can't remember the last time i felt okay",47],
      ["SUBJECT_1209","same here",12],
      ["SUBJECT_3341","work tomorrow again...",31],
      ["SUBJECT_7816","does anyone else just feel empty?",64],
      ["SUBJECT_0923","you're not alone.",53],
      ["SUBJECT_5530","let it out here.",28]
    ]
  },
  "late-night": {
    title: "# late-night",
    sub: "잠들지 못한 사람들의 채널.",
    online: 129,
    messages: [
      ["SUBJECT_0118","2am and my brain decided to replay everything",88],
      ["SUBJECT_8801","anyone else awake?",76],
      ["SUBJECT_2224","yeah. unfortunately.",42],
      ["SUBJECT_6400","tomorrow is already stressing me out",57]
    ]
  },
  "overthinking": {
    title: "# overthinking",
    sub: "생각이 멈추지 않을 때.",
    online: 146,
    messages: [
      ["SUBJECT_9190","i have invented six problems that do not exist yet",105],
      ["SUBJECT_1182","same",48],
      ["SUBJECT_4204","can someone turn my brain off",87]
    ]
  },
  work: {
    title: "# work-rage",
    sub: "Deadlines. Meetings. Pretending to be fine.",
    online: 183,
    messages: [
      ["SUBJECT_2031","my boss seriously thinks we're robots",124],
      ["SUBJECT_7712","i worked 12 hours again. what is the point?",99],
      ["SUBJECT_6621","team project... doing everything alone",131],
      ["SUBJECT_1189","i'm so tired of pretending to be fine",86]
    ]
  },
  school: {
    title: "# school-burnout",
    sub: "과제, 시험, 비교, 압박.",
    online: 98,
    messages: [
      ["SUBJECT_2109","everyone looks ahead of me",77],
      ["SUBJECT_5541","finals week is not real life",62],
      ["SUBJECT_9904","i opened the assignment and immediately closed it",91]
    ]
  },
  love: {
    title: "# love-damage",
    sub: "사랑도 스트레스가 될 때.",
    online: 112,
    messages: [
      ["SUBJECT_1132","i keep checking a message that is not coming",101],
      ["SUBJECT_8290","i miss who i was before them",117],
      ["SUBJECT_0201","why is moving on so boring",54]
    ]
  },
  people: {
    title: "# people",
    sub: "사람 때문에 지칠 때.",
    online: 91,
    messages: [
      ["SUBJECT_5550","everyone wants something from me",96],
      ["SUBJECT_7120","i just want one day with no social obligations",83],
      ["SUBJECT_3101","small talk is violence today",62]
    ]
  }
};

const MEMBERS = [
  ["SUBJECT_0821","in #live-stress"],
  ["SUBJECT_4410","typing..."],
  ["SUBJECT_7732","in SMASH ROOM"],
  ["SUBJECT_0912","idle"],
  ["SUBJECT_6621","in #work-rage"],
  ["SUBJECT_1209","online"],
  ["SUBJECT_5530","in #late-night"],
  ["SUBJECT_2031","online"]
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
          <button data-same> SAME ${same}</button>
          <button>REPLY</button>
          <button>SHARE</button>
          <button>JOIN LAB</button>
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
  btn.textContent = `SAME ${n}`;
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
