const HOME_SIGNALS = [
  ["SUBJECT_0412", "i can't do this anymore"],
  ["SUBJECT_7963", "same"],
  ["SUBJECT_1201", "today was hell"],
  ["SUBJECT_6874", "anyone else awake?"],
  ["SUBJECT_6330", "i just want to scream"],
  ["SUBJECT_0912", "you're not alone here"],
  ["SUBJECT_2281", "let it out"],
  ["SUBJECT_4471", "entered // SMASH ROOM"],
  ["SUBJECT_8022", "work again tomorrow"],
  ["SUBJECT_3319", "still here."]
];

const feed = document.getElementById("homeSignalFeed");
const clock = document.getElementById("homeClock");
let cursor = 0;
let history = [];

function now() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  }).format(new Date());
}

function drawClock() {
  if (clock) clock.textContent = now();
}
drawClock();
setInterval(drawClock, 1000);

function addSignal() {
  if (!feed) return;
  const [subject, text] = HOME_SIGNALS[cursor % HOME_SIGNALS.length];
  cursor += 1;

  history.push({ time: now().slice(0,5), subject, text });
  if (history.length > 7) history.shift();

  feed.innerHTML = history.map((item, i) => `
    <div class="home-signal ${item.text.includes("entered") ? "is-entry" : ""}">
      <span>[${item.time}]</span>
      <strong>${item.subject}</strong>
      <span>${item.text}</span>
    </div>
  `).join("");
}

for (let i = 0; i < 6; i++) addSignal();
setInterval(addSignal, 2600);
