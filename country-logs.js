(() => {
  const COUNTRY = {
    KOREA:        { cities:["SEOUL","BUSAN"], langs:["KO"] },
    JAPAN:        { cities:["TOKYO","OSAKA"], langs:["JA"] },
    CHINA:        { cities:["SHANGHAI","BEIJING"], langs:["ZH"] },
    TAIWAN:       { cities:["TAIPEI"], langs:["ZH_TW"] },
    "HONG KONG":  { cities:["HONG KONG"], langs:["YUE","EN"] },
    SINGAPORE:    { cities:["SINGAPORE"], langs:["EN","ZH","MS","TA"] },
    THAILAND:     { cities:["BANGKOK"], langs:["TH"] },
    PHILIPPINES:  { cities:["MANILA"], langs:["TL","EN"] },
    INDONESIA:    { cities:["JAKARTA"], langs:["ID"] },
    INDIA:        { cities:["MUMBAI","DELHI"], langs:["HI","EN"] },
    UAE:          { cities:["DUBAI"], langs:["AR","EN"] },
    TURKEY:       { cities:["ISTANBUL"], langs:["TR"] },

    GERMANY:      { cities:["BERLIN"], langs:["DE"] },
    FRANCE:       { cities:["PARIS"], langs:["FR"] },
    UK:           { cities:["LONDON"], langs:["EN"] },
    SPAIN:        { cities:["MADRID"], langs:["ES"] },
    ITALY:        { cities:["ROME"], langs:["IT"] },
    SWEDEN:       { cities:["STOCKHOLM"], langs:["SV"] },
    POLAND:       { cities:["WARSAW"], langs:["PL"] },
    GREECE:       { cities:["ATHENS"], langs:["EL"] },

    USA:          { cities:["NEW YORK","LOS ANGELES"], langs:["EN"] },
    CANADA:       { cities:["TORONTO","MONTREAL"], langs:["EN","FR"] },
    MEXICO:       { cities:["MEXICO CITY"], langs:["ES"] },

    BRAZIL:       { cities:["SAO PAULO"], langs:["PT"] },
    ARGENTINA:    { cities:["BUENOS AIRES"], langs:["ES"] },

    EGYPT:        { cities:["CAIRO"], langs:["AR"] },
    KENYA:        { cities:["NAIROBI"], langs:["SW","EN"] },
    "SOUTH AFRICA": { cities:["CAPE TOWN"], langs:["EN","XH"] },

    AUSTRALIA:    { cities:["SYDNEY","MELBOURNE"], langs:["EN"] }
  };

  const LANG_NAME = {
    KO:"한국어",
    JA:"日本語",
    ZH:"简体中文",
    ZH_TW:"繁體中文",
    YUE:"廣東話",
    EN:"English",
    MS:"Bahasa Melayu",
    TA:"தமிழ்",
    TH:"ไทย",
    TL:"Filipino",
    ID:"Bahasa Indonesia",
    HI:"हिन्दी",
    AR:"العربية",
    TR:"Türkçe",
    DE:"Deutsch",
    FR:"Français",
    ES:"Español",
    IT:"Italiano",
    SV:"Svenska",
    PL:"Polski",
    EL:"Ελληνικά",
    PT:"Português",
    SW:"Kiswahili",
    XH:"isiXhosa"
  };

  const MSG = {
    KO:[
      "퇴근했는데 아직도 회사 생각남.",
      "오늘은 그냥 아무한테도 연락하고 싶지 않다.",
      "괜찮은 척하는 것도 이제 피곤함.",
      "해야 할 건 많은데 아무것도 하기 싫다.",
      "사람들 앞에서는 멀쩡한 척했다.",
      "잠깐이라도 아무 생각 없이 있고 싶다."
    ],

    JA:[
      "家に帰ったら、もう何もしたくない。",
      "今日は誰とも話したくない。",
      "頑張ってるのに、全然足りない気がする。",
      "大丈夫なふりをするのに疲れた。",
      "頭の中がずっと静かにならない。",
      "少しだけ休みたい。"
    ],

    ZH:[
      "每天都在赶，好像永远都追不上。",
      "我真的累了，不想再假装没事。",
      "今天不想跟任何人说话。",
      "感觉所有人都比我走得快。",
      "我只是想安静一会儿。",
      "今天什么都不想做。"
    ],

    ZH_TW:[
      "我真的累了，不想再假裝沒事。",
      "今天不想跟任何人說話。",
      "大家好像都走在我前面。",
      "我只是想安靜一下。",
      "每天都覺得自己追不上別人。",
      "今天什麼都不想做。"
    ],

    YUE:[
      "我真係好攰，唔想再扮冇事。",
      "今日真係唔想同任何人講嘢。",
      "好似個個都行得快過我。",
      "我只係想靜一陣。",
      "日日都好似追唔上。",
      "今日真係好攰。"
    ],

    EN:[
      "i work all day and still feel behind.",
      "i'm tired of pretending i'm fine.",
      "everyone wants something from me.",
      "i need some time where nobody needs anything from me.",
      "my brain will not shut up today.",
      "i smiled through the whole day and hated it."
    ],

    FR:[
      "Je suis fatigué de faire semblant que tout va bien.",
      "J'ai juste besoin d'un peu de silence.",
      "Tout le monde semble avancer sauf moi.",
      "Je ne veux parler à personne aujourd'hui.",
      "J'ai l'impression de toujours courir.",
      "J'ai besoin d'une pause."
    ],

    DE:[
      "Ich tue so, als wäre alles okay. Ist es aber nicht.",
      "Ich brauche einfach eine Pause von allem.",
      "Heute möchte ich mit niemandem reden.",
      "Alle scheinen weiter zu sein als ich.",
      "Mein Kopf hört heute einfach nicht auf.",
      "Ich bin müde vom Funktionieren."
    ],

    ES:[
      "Estoy cansado de fingir que todo va bien.",
      "Hoy no quiero hablar con nadie.",
      "Siento que todos avanzan menos yo.",
      "Solo necesito un poco de silencio.",
      "Trabajo todo el día y sigo sintiéndome atrás.",
      "Necesito una pausa."
    ],

    IT:[
      "Sono stanco di far finta che vada tutto bene.",
      "Oggi non voglio parlare con nessuno.",
      "Mi sembra che tutti siano più avanti di me.",
      "Ho bisogno solo di un po' di silenzio.",
      "Continuo a correre ma non arrivo mai.",
      "Ho bisogno di una pausa."
    ],

    PT:[
      "Estou cansado de fingir que está tudo bem.",
      "Hoje não quero falar com ninguém.",
      "Parece que todo mundo está na minha frente.",
      "Só preciso de um pouco de silêncio.",
      "Trabalho o dia todo e ainda me sinto atrasado.",
      "Só preciso de uma pausa."
    ],

    AR:[
      "أعمل طوال اليوم وما زلت أشعر أنني متأخر.",
      "تعبت من التظاهر بأن كل شيء بخير.",
      "لا أريد التحدث مع أحد اليوم.",
      "أشعر أن الجميع يتقدم وأنا عالق.",
      "أحتاج فقط إلى بعض الهدوء.",
      "أحتاج إلى استراحة."
    ],

    HI:[
      "हर दिन बस भागते रहना थका देता है।",
      "आज किसी से बात करने का मन नहीं है।",
      "सब आगे बढ़ रहे हैं और मैं वहीं हूँ।",
      "बस थोड़ी देर शांति चाहिए।",
      "मैं ठीक होने का नाटक करते-करते थक गया हूँ।",
      "मुझे बस थोड़ा आराम चाहिए।"
    ],

    TH:[
      "เหนื่อยกับการทำเหมือนว่าทุกอย่างโอเค",
      "วันนี้ไม่อยากคุยกับใครเลย",
      "รู้สึกเหมือนทุกคนไปไกลกว่าฉัน",
      "อยากอยู่เงียบๆ สักพัก",
      "เหนื่อยกับการพยายามตลอดเวลา",
      "อยากพักสักหน่อย"
    ],

    TL:[
      "Pagod na akong magpanggap na okay lang ako.",
      "Ayoko munang makipag-usap kahit kanino.",
      "Parang lahat nauuna sa akin.",
      "Gusto ko lang ng katahimikan.",
      "Pagod na akong humabol.",
      "Kailangan ko lang magpahinga."
    ],

    ID:[
      "Aku capek pura-pura baik-baik saja.",
      "Hari ini aku tidak ingin bicara dengan siapa pun.",
      "Rasanya semua orang lebih maju dariku.",
      "Aku cuma ingin diam sebentar.",
      "Aku lelah terus mengejar.",
      "Aku cuma butuh istirahat."
    ],

    TR:[
      "Her şey yolundaymış gibi davranmaktan yoruldum.",
      "Bugün kimseyle konuşmak istemiyorum.",
      "Herkes ilerliyor gibi geliyor.",
      "Sadece biraz sessizlik istiyorum.",
      "Sürekli yetişmeye çalışmaktan yoruldum.",
      "Biraz ara vermek istiyorum."
    ],

    SV:[
      "Jag är trött på att låtsas att allt är okej.",
      "Jag vill inte prata med någon idag.",
      "Alla verkar ligga före mig.",
      "Jag behöver bara lite tystnad.",
      "Jag är trött på att försöka hinna ikapp.",
      "Jag behöver en paus."
    ],

    PL:[
      "Mam dość udawania, że wszystko jest w porządku.",
      "Dzisiaj nie chcę z nikim rozmawiać.",
      "Mam wrażenie, że wszyscy są przede mną.",
      "Potrzebuję tylko chwili ciszy.",
      "Jestem zmęczony ciągłym gonieniem.",
      "Potrzebuję przerwy."
    ],

    EL:[
      "Κουράστηκα να προσποιούμαι ότι όλα είναι καλά.",
      "Σήμερα δεν θέλω να μιλήσω σε κανέναν.",
      "Νιώθω ότι όλοι είναι μπροστά μου.",
      "Θέλω απλώς λίγη ησυχία.",
      "Κουράστηκα να προσπαθώ συνέχεια.",
      "Χρειάζομαι ένα διάλειμμα."
    ],

    SW:[
      "Nimechoka kujifanya niko sawa.",
      "Leo sitaki kuzungumza na mtu yeyote.",
      "Nahisi kila mtu yuko mbele yangu.",
      "Nahitaji ukimya kidogo tu.",
      "Nimechoka kujaribu kufuatilia kila kitu.",
      "Nahitaji mapumziko kidogo."
    ],

    MS:[
      "Penat berpura-pura semuanya baik.",
      "Hari ini saya tak mahu bercakap dengan sesiapa.",
      "Rasa macam semua orang lebih jauh ke depan.",
      "Saya cuma perlukan sedikit ketenangan.",
      "Penat asyik cuba mengejar.",
      "Saya cuma perlukan rehat."
    ],

    TA:[
      "எல்லாம் சரியாக இருப்பது போல நடிப்பதில் சோர்வாக இருக்கிறேன்.",
      "இன்று யாருடனும் பேச விருப்பமில்லை.",
      "எல்லோரும் என்னைவிட முன்னேறுகிறார்கள் போல உணர்கிறேன்.",
      "சிறிது நேரம் அமைதியாக இருக்க வேண்டும்.",
      "தொடர்ந்து ஓடுவதில் சோர்வாக இருக்கிறேன்.",
      "சிறிது ஓய்வு வேண்டும்."
    ],

    XH:[
      "Ndidiniwe kukuzenza ngathi ndilungile.",
      "Namhlanje andifuni ukuthetha nabani.",
      "Kubonakala ngathi wonke umntu uphambi kwam.",
      "Ndifuna nje ukuthula kancinci.",
      "Ndidiniwe kukusoloko ndizama ukubamba.",
      "Ndifuna ukuphumla kancinci."
    ]
  };

  const CITY = {};

  Object.entries(COUNTRY).forEach(([country, config]) => {
    config.cities.forEach(city => CITY[city] = country);
  });

  let activeCountry = null;
  let writing = false;

  const logList = document.getElementById("signalLogList");
  const intercept = document.getElementById("interceptLine");

  if (!logList || !intercept) return;

  function makeId(country, i) {
    let h = 0;
    for (const c of country) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
    return `SUBJECT_${String(Math.abs(h + i * 173) % 10000).padStart(4,"0")}`;
  }

  function makeTime(i) {
    const d = new Date();
    d.setSeconds(d.getSeconds() - i * 37);

    return new Intl.DateTimeFormat("en-GB", {
      hour:"2-digit",
      minute:"2-digit",
      second:"2-digit",
      hour12:false
    }).format(d);
  }

  function logsFor(country) {
    const c = COUNTRY[country];
    const out = [];

    for (let i = 0; i < 60; i++) {
      const lang = c.langs[i % c.langs.length];
      const bank = MSG[lang] || MSG.EN;

      out.push({
        city: c.cities[i % c.cities.length],
        lang,
        text: bank[Math.floor(i / c.langs.length) % bank.length],
        subject: makeId(country, i),
        time: makeTime(i)
      });
    }

    return out;
  }

  function renderCountry(country) {
    activeCountry = country;
    writing = true;

    const logs = logsFor(country);

    logList.innerHTML = logs.map(log => `
      <article class="signal-log">
        <div class="signal-log-meta">
          <span>${log.time}</span>
          <span>${log.city} // ${country}</span>
          <span class="signal-language">${LANG_NAME[log.lang] || log.lang}</span>
        </div>

        <strong>${log.subject}</strong>
        <p>"${log.text}"</p>
      </article>
    `).join("");

    intercept.innerHTML = `
      FILTERED //
      <strong>${country}</strong>
      //
      ${COUNTRY[country].langs.map(x => LANG_NAME[x] || x).join(" / ")}
      //
      60 SIGNALS

      <button id="clearCountryLogs">SHOW ALL ×</button>
    `;

    document.querySelectorAll(".map-node").forEach(node => {
      node.classList.toggle(
        "is-selected-country",
        CITY[node.dataset.city] === country
      );
    });

    document.getElementById("clearCountryLogs")?.addEventListener("click", () => {
      activeCountry = null;

      document.querySelectorAll(".map-node")
        .forEach(n => n.classList.remove("is-selected-country"));

      if (typeof renderLogs === "function") {
        renderLogs();
      }

      intercept.textContent = "GLOBAL SIGNAL NETWORK // ALL LANGUAGES";
    });

    setTimeout(() => writing = false, 0);
  }

  document.addEventListener("click", e => {
    const node = e.target.closest(".map-node");

    if (node) {
      const country = CITY[node.dataset.city];

      if (country) {
        e.preventDefault();
        e.stopImmediatePropagation();
        renderCountry(country);
      }

      return;
    }

    const btn = e.target.closest("[data-country]");

    if (btn && COUNTRY[btn.dataset.country]) {
      e.preventDefault();
      e.stopImmediatePropagation();
      renderCountry(btn.dataset.country);
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (activeCountry && !writing) {
      renderCountry(activeCountry);
    }
  });

  observer.observe(logList, { childList:true });
})();
