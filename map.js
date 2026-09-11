const SIGNALS = [

  /* EAST ASIA */

  {
    city:"SEOUL",
    zone:"DISTRICT 04",
    x:82, y:42,
    color:"#ff3d94",
    category:"WORK",
    subject:"SUBJECT_7318",
    lang:"KO",
    text:"퇴근했는데 아직도 회사 생각남.",
    count:388
  },

  {
    city:"BUSAN",
    zone:"COAST 02",
    x:83, y:45,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_4021",
    lang:"KO",
    text:"오늘은 그냥 아무한테도 연락하고 싶지 않다.",
    count:174
  },

  {
    city:"TOKYO",
    zone:"SECTOR 11",
    x:88, y:47,
    color:"#a989ff",
    category:"MYSELF",
    subject:"SUBJECT_1082",
    lang:"JP",
    text:"家に帰ったら、もう何もしたくない。",
    count:261
  },

  {
    city:"OSAKA",
    zone:"SECTOR 08",
    x:86, y:49,
    color:"#ef544e",
    category:"WORK",
    subject:"SUBJECT_5209",
    lang:"JP",
    text:"頑張ってるのに、全然足りない気がする。",
    count:193
  },

  {
    city:"TAIPEI",
    zone:"NODE 06",
    x:81, y:51,
    color:"#62d9e8",
    category:"MYSELF",
    subject:"SUBJECT_3407",
    lang:"ZH-TW",
    text:"我真的累了，不想再假裝沒事。",
    count:168
  },

  {
    city:"HONG KONG",
    zone:"GRID 07",
    x:79, y:55,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_7821",
    lang:"ZH-HK",
    text:"我真係好攰，唔想再扮冇事。",
    count:201
  },

  {
    city:"SHANGHAI",
    zone:"BLOCK 12",
    x:78, y:46,
    color:"#c9f64b",
    category:"WORK",
    subject:"SUBJECT_6932",
    lang:"ZH-CN",
    text:"每天都在赶，好像永远都追不上。",
    count:245
  },

  {
    city:"BEIJING",
    zone:"BLOCK 03",
    x:77, y:39,
    color:"#a989ff",
    category:"MYSELF",
    subject:"SUBJECT_1180",
    lang:"ZH-CN",
    text:"我只是想安静一会儿。",
    count:187
  },


  /* SOUTHEAST ASIA */

  {
    city:"SINGAPORE",
    zone:"GRID 03",
    x:76, y:63,
    color:"#ef544e",
    category:"SCHOOL",
    subject:"SUBJECT_2047",
    lang:"EN",
    text:"everyone seems ahead of me. i'm exhausted trying to catch up.",
    count:222
  },

  {
    city:"BANGKOK",
    zone:"DISTRICT 09",
    x:72, y:59,
    color:"#ff3d94",
    category:"WORK",
    subject:"SUBJECT_7714",
    lang:"TH",
    text:"เหนื่อยกับการทำเหมือนว่าทุกอย่างโอเค",
    count:178
  },

  {
    city:"MANILA",
    zone:"SECTOR 05",
    x:84, y:58,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_9003",
    lang:"TL",
    text:"Pagod na akong magpanggap na okay lang ako.",
    count:154
  },

  {
    city:"JAKARTA",
    zone:"GRID 12",
    x:75, y:69,
    color:"#a989ff",
    category:"MYSELF",
    subject:"SUBJECT_6032",
    lang:"ID",
    text:"Aku capek pura-pura baik-baik saja.",
    count:169
  },


  /* SOUTH ASIA / MIDDLE EAST */

  {
    city:"MUMBAI",
    zone:"ZONE 08",
    x:65, y:58,
    color:"#c9f64b",
    category:"WORK",
    subject:"SUBJECT_2204",
    lang:"HI",
    text:"हर दिन बस भागते रहना थका देता है।",
    count:234
  },

  {
    city:"DELHI",
    zone:"ZONE 04",
    x:66, y:51,
    color:"#ef544e",
    category:"SCHOOL",
    subject:"SUBJECT_4980",
    lang:"HI",
    text:"सब आगे बढ़ रहे हैं और मैं वहीं का वहीं हूँ।",
    count:214
  },

  {
    city:"DUBAI",
    zone:"SECTOR 02",
    x:61, y:52,
    color:"#c9f64b",
    category:"MONEY",
    subject:"SUBJECT_8203",
    lang:"AR",
    text:"أعمل طوال اليوم وما زلت أشعر أنني متأخر.",
    count:209
  },

  {
    city:"ISTANBUL",
    zone:"BLOCK 04",
    x:55, y:43,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_3150",
    lang:"TR",
    text:"Her şey yolundaymış gibi davranmaktan yoruldum.",
    count:183
  },


  /* EUROPE */

  {
    city:"BERLIN",
    zone:"UNIT 09",
    x:51, y:28,
    color:"#62d9e8",
    category:"LOVE",
    subject:"SUBJECT_9921",
    lang:"DE",
    text:"Ich tue so, als wäre alles okay. Ist es aber nicht.",
    count:173
  },

  {
    city:"PARIS",
    zone:"BLOCK 05",
    x:49, y:35,
    color:"#62d9e8",
    category:"LOVE",
    subject:"SUBJECT_3144",
    lang:"FR",
    text:"Je fais semblant de m'en foutre, mais c'est épuisant.",
    count:151
  },

  {
    city:"LONDON",
    zone:"BLOCK 07",
    x:47, y:32,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_5504",
    lang:"EN",
    text:"everyone wants something from me.",
    count:198
  },

  {
    city:"MADRID",
    zone:"SECTOR 06",
    x:45, y:43,
    color:"#ef544e",
    category:"WORK",
    subject:"SUBJECT_6104",
    lang:"ES",
    text:"Estoy cansado de fingir que todo va bien.",
    count:144
  },

  {
    city:"ROME",
    zone:"DISTRICT 03",
    x:52, y:43,
    color:"#ff3d94",
    category:"MYSELF",
    subject:"SUBJECT_7780",
    lang:"IT",
    text:"Sono stanco di far finta che vada tutto bene.",
    count:139
  },

  {
    city:"STOCKHOLM",
    zone:"NODE 02",
    x:52, y:20,
    color:"#a989ff",
    category:"MYSELF",
    subject:"SUBJECT_8910",
    lang:"SV",
    text:"Jag är trött på att låtsas att allt är okej.",
    count:103
  },

  {
    city:"WARSAW",
    zone:"UNIT 11",
    x:54, y:31,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_2237",
    lang:"PL",
    text:"Mam dość udawania, że wszystko jest w porządku.",
    count:132
  },

  {
    city:"ATHENS",
    zone:"UNIT 06",
    x:55, y:46,
    color:"#ff3d94",
    category:"WORK",
    subject:"SUBJECT_4612",
    lang:"EL",
    text:"Κουράστηκα να προσποιούμαι ότι όλα είναι καλά.",
    count:121
  },


  /* NORTH AMERICA */

  {
    city:"NEW YORK",
    zone:"ZONE 02",
    x:24, y:39,
    color:"#c9f64b",
    category:"MONEY",
    subject:"SUBJECT_4120",
    lang:"EN",
    text:"i work all day and still feel behind.",
    count:274
  },

  {
    city:"LOS ANGELES",
    zone:"ZONE 08",
    x:12, y:45,
    color:"#a989ff",
    category:"MYSELF",
    subject:"SUBJECT_7701",
    lang:"EN",
    text:"everyone looks like they're doing better than me.",
    count:236
  },

  {
    city:"TORONTO",
    zone:"BLOCK 03",
    x:22, y:34,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_6031",
    lang:"EN",
    text:"i just want one day where nobody needs anything from me.",
    count:169
  },

  {
    city:"MONTREAL",
    zone:"BLOCK 09",
    x:25, y:34,
    color:"#62d9e8",
    category:"LOVE",
    subject:"SUBJECT_7091",
    lang:"FR",
    text:"J'ai besoin de silence. Juste pour un moment.",
    count:141
  },

  {
    city:"MEXICO CITY",
    zone:"GRID 05",
    x:17, y:54,
    color:"#ef544e",
    category:"WORK",
    subject:"SUBJECT_9201",
    lang:"ES",
    text:"Estoy agotado de intentar estar bien todo el tiempo.",
    count:208
  },


  /* SOUTH AMERICA */

  {
    city:"SAO PAULO",
    zone:"SECTOR 10",
    x:32, y:70,
    color:"#ff3d94",
    category:"WORK",
    subject:"SUBJECT_4480",
    lang:"PT",
    text:"Estou cansado de fingir que está tudo bem.",
    count:231
  },

  {
    city:"BUENOS AIRES",
    zone:"ZONE 07",
    x:31, y:80,
    color:"#62d9e8",
    category:"LOVE",
    subject:"SUBJECT_5144",
    lang:"ES",
    text:"Digo que ya lo superé, pero no es verdad.",
    count:164
  },


  /* AFRICA */

  {
    city:"CAIRO",
    zone:"DISTRICT 02",
    x:56, y:51,
    color:"#c9f64b",
    category:"MONEY",
    subject:"SUBJECT_6017",
    lang:"AR",
    text:"أشعر أن الجميع يتقدم وأنا عالق في مكاني.",
    count:189
  },

  {
    city:"NAIROBI",
    zone:"GRID 04",
    x:57, y:66,
    color:"#a989ff",
    category:"MYSELF",
    subject:"SUBJECT_3304",
    lang:"SW",
    text:"Nimechoka kujifanya niko sawa.",
    count:127
  },

  {
    city:"CAPE TOWN",
    zone:"SECTOR 06",
    x:53, y:82,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_8802",
    lang:"EN",
    text:"i've been social all week. i need everyone to disappear.",
    count:114
  },


  /* OCEANIA */

  {
    city:"SYDNEY",
    zone:"SECTOR 03",
    x:88, y:75,
    color:"#ff8c42",
    category:"PEOPLE",
    subject:"SUBJECT_6803",
    lang:"EN",
    text:"i smiled through the whole meeting.",
    count:119
  },

  {
    city:"MELBOURNE",
    zone:"SECTOR 07",
    x:85, y:80,
    color:"#ff3d94",
    category:"WORK",
    subject:"SUBJECT_8817",
    lang:"EN",
    text:"i opened my inbox and immediately wanted to go back to bed.",
    count:136
  }

];


const COUNTRY_BY_CITY = {
  "SEOUL":       { country: "KOREA",        lang: "KO" },
  "BUSAN":       { country: "KOREA",        lang: "KO" },

  "TOKYO":       { country: "JAPAN",        lang: "JP" },
  "OSAKA":       { country: "JAPAN",        lang: "JP" },

  "TAIPEI":      { country: "TAIWAN",       lang: "ZH-TW" },

  "HONG KONG":   { country: "HONG KONG",    lang: "ZH-HK" },

  "SHANGHAI":    { country: "CHINA",        lang: "ZH-CN" },
  "BEIJING":     { country: "CHINA",        lang: "ZH-CN" },

  "SINGAPORE":   { country: "SINGAPORE",    lang: "EN" },

  "BANGKOK":     { country: "THAILAND",     lang: "TH" },

  "MANILA":      { country: "PHILIPPINES",  lang: "TL" },

  "JAKARTA":     { country: "INDONESIA",    lang: "ID" },

  "MUMBAI":      { country: "INDIA",        lang: "HI" },
  "DELHI":       { country: "INDIA",        lang: "HI" },

  "DUBAI":       { country: "UAE",          lang: "AR" },

  "ISTANBUL":    { country: "TURKEY",       lang: "TR" },

  "BERLIN":      { country: "GERMANY",      lang: "DE" },

  "PARIS":       { country: "FRANCE",       lang: "FR" },

  "LONDON":      { country: "UK",           lang: "EN" },

  "MADRID":      { country: "SPAIN",        lang: "ES" },

  "ROME":        { country: "ITALY",        lang: "IT" },

  "STOCKHOLM":   { country: "SWEDEN",       lang: "SV" },

  "WARSAW":      { country: "POLAND",       lang: "PL" },

  "ATHENS":      { country: "GREECE",       lang: "EL" },

  "NEW YORK":    { country: "USA",          lang: "EN" },
  "LOS ANGELES": { country: "USA",          lang: "EN" },

  "TORONTO":     { country: "CANADA",       lang: "EN" },
  "MONTREAL":    { country: "CANADA",       lang: "FR" },

  "MEXICO CITY": { country: "MEXICO",       lang: "ES" },

  "SAO PAULO":   { country: "BRAZIL",       lang: "PT" },

  "BUENOS AIRES":{ country: "ARGENTINA",    lang: "ES" },

  "CAIRO":       { country: "EGYPT",        lang: "AR" },

  "NAIROBI":     { country: "KENYA",        lang: "SW" },

  "CAPE TOWN":   { country: "SOUTH AFRICA", lang: "EN" },

  "SYDNEY":      { country: "AUSTRALIA",    lang: "EN" },
  "MELBOURNE":   { country: "AUSTRALIA",    lang: "EN" }
};

SIGNALS.forEach((signal) => {
  const meta = COUNTRY_BY_CITY[signal.city];

  if (meta) {
    signal.country = meta.country;

    // 기존 lang이 있으면 유지
    if (!signal.lang) {
      signal.lang = meta.lang;
    }
  }
});


const worldMap = document.getElementById("worldMap");
const logList = document.getElementById("signalLogList");
const intercept = document.getElementById("interceptLine");
const mapClock = document.getElementById("mapClock");
const ranking = document.getElementById("nodeRanking");
let cursor = 0;
let history = [];

const CATEGORY_LABELS = {
  WORK: "일",
  PEOPLE: "사람",
  LOVE: "연애",
  MONEY: "돈",
  MYSELF: "나 자신",
  OTHER: "기타"
};

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

function clock() {
  return new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(new Date());
}

function drawClock() {
  mapClock.textContent = clock();
}
drawClock();
setInterval(drawClock,1000);

SIGNALS.forEach((s) => {
  const node = document.createElement("button");
  node.className = "map-node";
  node.dataset.city = s.city;
  node.style.left = `${s.x}%`;
  node.style.top = `${s.y}%`;
  node.style.setProperty("--node", s.color);
  node.innerHTML = `<span class="map-node-ring"></span><span class="map-node-core"></span><span class="map-node-label">${s.city}</span>`;
  node.addEventListener("click", () => {
    const country = s.country || COUNTRY_BY_CITY[s.city]?.country;
    const countryLogs = history.filter((x) => x.country === country);

    renderLogs(countryLogs);

    document
      .querySelectorAll(".map-node")
      .forEach((n) => n.classList.remove("is-selected-country"));

    document
      .querySelectorAll(".map-node")
      .forEach((n) => {
        const city = n.dataset.city;
        const nodeCountry = COUNTRY_BY_CITY[city]?.country;

        if (nodeCountry === country) {
          n.classList.add("is-selected-country");
        }
      });

    intercept.innerHTML = `
      ${country}에서 온 이야기
      // ${s.lang}
      // ${countryLogs.length}개
      <button id="clearCountryFilter">모든 이야기 보기 ×</button>
    `;

    document
      .getElementById("clearCountryFilter")
      ?.addEventListener("click", (event) => {
        event.stopPropagation();

        renderLogs();

        document
          .querySelectorAll(".map-node")
          .forEach((n) => n.classList.remove("is-selected-country"));

        intercept.textContent = "지금 세계 곳곳에서 올라오는 이야기";
      });
  });
  worldMap.appendChild(node);
});

function renderLogs(logs = history) {
  let visibleLogs = logs;

  // SHOW ALL / 기본 글로벌 피드에서 한국 로그 2개 보장
  if (logs === history) {
    const koreanLogs = [
      ...logs.filter((signal) => signal.country === "KOREA"),
      ...SIGNALS.filter((signal) => signal.country === "KOREA")
    ]
      .filter(
        (signal, index, array) =>
          array.findIndex(
            (item) =>
              item.city === signal.city &&
              item.text === signal.text
          ) === index
      )
      .slice(0, 2)
      .map((signal) => ({
        ...signal,
        time: signal.time || clock()
      }));

    const globalLogs = logs.filter(
      (signal) => signal.country !== "KOREA"
    );

    visibleLogs = [
      ...globalLogs.slice(0, 2),
      koreanLogs[0],
      ...globalLogs.slice(2, 5),
      koreanLogs[1],
      ...globalLogs.slice(5)
    ]
      .filter(Boolean)
      .slice(0, 8);
  }

  logList.innerHTML = visibleLogs.map((signal) => `
    <article class="signal-log">
      <div class="signal-log-meta">
        <span>${signal.time}</span>
        <span>
          ${signal.city} // ${signal.country} // ${signal.lang}
        </span>
        <b style="--cat:${signal.color}">
          ${categoryLabel(signal.category)}
        </b>
      </div>

      <strong>${signal.subject}</strong>
      <p>"${signal.text}"</p>
    </article>
  `).join("");
}

function pushSignal() {
  const s = SIGNALS[cursor % SIGNALS.length];
  cursor += 1;
  const log = {...s, time:clock()};
  history.unshift(log);
  history = history.slice(0,12);
  renderLogs();

  document.querySelectorAll(".map-node").forEach(n => n.classList.remove("is-flash"));
  const node = document.querySelector(`[data-city="${s.city}"]`);
  if (node) {
    node.classList.add("is-flash");
    setTimeout(() => node.classList.remove("is-flash"),900);
  }
  intercept.textContent = `${s.city}에서 방금 올라온 이야기: "${s.text}"`;
}

for (let i=0;i<6;i++) pushSignal();
setInterval(pushSignal,3200);

ranking.innerHTML = [...SIGNALS]
  .sort((a,b)=>b.count-a.count)
  .slice(0,6)
  .map((s,i)=>`
    <div class="ranking-row">
      <span class="ranking-num">${String(i+1).padStart(2,"0")}</span>
      <span class="ranking-city">${s.city}</span>
      <span class="ranking-category" style="--cat:${s.color}">${categoryLabel(s.category)}</span>
      <span class="ranking-count">${s.count}개</span>
    </div>
  `).join("");
