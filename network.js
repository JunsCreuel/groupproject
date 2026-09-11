document.addEventListener(
  "DOMContentLoaded",
  () => {

    const $ =
      (selector) =>
        document.querySelector(selector);


    function escapeHTML(
      value = ""
    ) {

      return String(value)
        .replaceAll(
          "&",
          "&amp;"
        )
        .replaceAll(
          "<",
          "&lt;"
        )
        .replaceAll(
          ">",
          "&gt;"
        )
        .replaceAll(
          '"',
          "&quot;"
        )
        .replaceAll(
          "'",
          "&#039;"
        );

    }


    /* =====================================================
       SUBJECT
    ====================================================== */

    let subject =
      localStorage.getItem(
        "csl-subject"
      );


    if (!subject) {

      subject =
        String(
          Math.floor(
            Math.random()
            * 9000
          )
          + 1000
        );


      localStorage.setItem(
        "csl-subject",
        subject
      );

    }


    const networkSubject =
      $("#networkSubject");


    if (networkSubject) {

      networkSubject.textContent =
        subject;

    }


    /* =====================================================
       ROOMS
    ====================================================== */

    const rooms = {

      public: {

        title:
          "PUBLIC",

        description:
          "아무 얘기나 던지는 공개 채널",

        placeholder:
          "지금 무슨 생각 하고 있어?",

        messages: [

          {
            user:
              "SUBJECT_0284",

            text:
              "팀플 진짜 다 나만 하는 것 같음",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_8821",

            text:
              "오늘 사람 만나는 거 너무 피곤했음",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_1102",

            text:
              "i need everyone to leave me alone for like 24 hours",

            location:
              "LONDON"
          },

          {
            user:
              "SUBJECT_6638",

            text:
              "진짜 그냥 아무 이유 없이 짜증나는 날 있음",

            location:
              "BUSAN"
          }

        ]

      },


      work: {

        title:
          "WORK",

        description:
          "회사 / 팀플 / 업무 때문에 빡친 사람들",

        placeholder:
          "오늘 회사에서 참은 말 써봐.",

        messages: [

          {
            user:
              "SUBJECT_1190",

            text:
              "퇴근했는데 왜 아직도 회사 생각남",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_2218",

            text:
              "팀장이 5시에 내일까지 해달라고 함ㅋㅋ",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_5521",

            text:
              "회의 한 시간 했는데 결정된 게 하나도 없음",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_0192",

            text:
              "why is every email suddenly urgent",

            location:
              "NEW YORK"
          }

        ]

      },


      school: {

        title:
          "SCHOOL",

        description:
          "과제 / 시험 / 팀플 / 학교",

        placeholder:
          "학교 때문에 뭐가 제일 짜증나?",

        messages: [

          {
            user:
              "SUBJECT_3018",

            text:
              "팀플인데 연락 안 보는 사람 진짜 뭐임",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_7110",

            text:
              "시험기간인데 아무것도 머리에 안 들어옴",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_4112",

            text:
              "교수님 과제 설명이 과제보다 어려움",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_1038",

            text:
              "I genuinely forgot this assignment existed",

            location:
              "TORONTO"
          }

        ]

      },


      people: {

        title:
          "PEOPLE",

        description:
          "친구 / 인간관계 / 그냥 사람 때문에",

        placeholder:
          "오늘 누가 제일 짜증나게 했어?",

        messages: [

          {
            user:
              "SUBJECT_9184",

            text:
              "왜 맨날 내가 먼저 연락해야 되냐",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_3910",

            text:
              "말 돌려서 하는 사람 너무 싫음",

            location:
              "BUSAN"
          },

          {
            user:
              "SUBJECT_1127",

            text:
              "나만 눈치 보는 느낌 진짜 피곤해",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_7620",

            text:
              "people really need to learn boundaries",

            location:
              "SYDNEY"
          }

        ]

      },


      relationship: {

        title:
          "RELATIONSHIP",

        description:
          "썸 / 연애 / 이별 / 애매한 관계",

        placeholder:
          "그 사람한테 진짜 하고 싶은 말.",

        messages: [

          {
            user:
              "SUBJECT_2840",

            text:
              "답장은 안 하면서 스토리는 왜 봄?",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_8121",

            text:
              "좋아하면 좋아한다고 말을 하든가",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_6192",

            text:
              "나만 관계를 유지하려고 하는 느낌",

            location:
              "SEOUL"
          },

          {
            user:
              "SUBJECT_4300",

            text:
              "mixed signals are exhausting",

            location:
              "LOS ANGELES"
          }

        ]

      }

    };


    /* =====================================================
       ROOM
    ====================================================== */

    const params =
      new URLSearchParams(
        window.location.search
      );


    let currentRoom =
      params.get("room")
      || "public";


    if (!rooms[currentRoom]) {

      currentRoom =
        "public";

    }


    document.body.dataset.room =
      currentRoom;


    const room =
      rooms[currentRoom];


    document
      .querySelectorAll(
        ".channel-link"
      )
      .forEach(
        (link) => {

          link.classList.toggle(
            "is-active",
            link.dataset.room
            === currentRoom
          );

        }
      );


    const channelTitle =
      $("#channelTitle");

    const channelDescription =
      $("#channelDescription");

    const networkInput =
      $("#networkInput");


    if (channelTitle) {

      channelTitle.textContent =
        room.title;

    }


    if (channelDescription) {

      channelDescription.textContent =
        room.description;

    }


    if (networkInput) {

      networkInput.placeholder =
        room.placeholder;

    }


    /* =====================================================
       MESSAGE CREATOR
    ====================================================== */

    function createMessage({
      user,
      text,
      location,
      mine = false,
      system = false
    }) {

      const article =
        document.createElement(
          "article"
        );


      article.className =
        "network-message";


      if (mine) {

        article.classList.add(
          "is-mine"
        );

      }


      if (system) {

        article.classList.add(
          "system-warning"
        );

      }


      const sameCount =
        Math.floor(
          Math.random()
          * 190
        )
        + 1;


      const now =
        new Date()
          .toLocaleTimeString(
            "en-GB",
            {
              hour:
                "2-digit",

              minute:
                "2-digit"
            }
          );


      article.innerHTML = `

        <div class="message-avatar">
          ${
            system
              ? "SYS"
              : escapeHTML(
                  user.slice(-2)
                )
          }
        </div>


        <div class="message-content">

          <div class="message-meta">

            <strong>
              ${escapeHTML(user)}
            </strong>

            <span>
              ${escapeHTML(location)}
            </span>

            <time>
              ${now}
            </time>

          </div>


          <p>
            ${escapeHTML(text)}
          </p>


          ${
            system
              ? ""
              : `

            <div class="message-actions">

              <button
                type="button"
                class="same-action"
                data-count="${sameCount}"
              >
                나도 ${sameCount}
              </button>

              <button
                type="button"
                class="reply-action"
              >
                같이 욕하기
              </button>

              <a
                href="labs/index.html"
              >
                LAB으로 풀기 →
              </a>

            </div>

          `
          }

        </div>

      `;


      return article;

    }


    /* =====================================================
       INITIAL STREAM
    ====================================================== */

    const stream =
      $("#messageStream");


    if (stream) {

      stream.innerHTML =
        "";


      stream.appendChild(
        createMessage({

          user:
            "STATE_MONITOR",

          text:
            "EMOTIONAL DEVIATION DETECTED // SUBJECT TRACE INITIATED",

          location:
            "SYSTEM",

          system:
            true

        })
      );


      room.messages.forEach(
        (message) => {

          stream.appendChild(
            createMessage(
              message
            )
          );

        }
      );


      requestAnimationFrame(
        () => {

          stream.scrollTop =
            stream.scrollHeight;

        }
      );

    }


    /* =====================================================
       MESSAGE ACTIONS
    ====================================================== */

    stream?.addEventListener(
      "click",
      (event) => {

        const sameButton =
          event.target.closest(
            ".same-action"
          );


        if (sameButton) {

          let count =
            Number(
              sameButton.dataset.count
              || 0
            );


          count += 1;


          sameButton.dataset.count =
            String(count);


          sameButton.textContent =
            `나도 ${count}`;


          return;

        }


        const replyButton =
          event.target.closest(
            ".reply-action"
          );


        if (
          replyButton
          && networkInput
        ) {

          networkInput.focus();

          networkInput.placeholder =
            "같이 욕해줘...";

        }

      }
    );


    /* =====================================================
       INPUT COUNTER
    ====================================================== */

    const charCount =
      $("#networkCharCount");


    networkInput?.addEventListener(
      "input",
      () => {

        if (charCount) {

          charCount.textContent =
            `${networkInput.value.length} / 180`;

        }

      }
    );


    /* =====================================================
       CONTROL LOG
    ====================================================== */

    const controlLog =
      $("#controlLog");


    function addControlLog(
      text,
      type = "normal"
    ) {

      if (!controlLog) {
        return;
      }


      const time =
        new Date()
          .toLocaleTimeString(
            "en-GB",
            {
              hour12:
                false
            }
          );


      const line =
        document.createElement(
          "p"
        );


      if (
        type ===
        "warning"
      ) {

        line.className =
          "warning-line";

      }


      if (
        type ===
        "hack"
      ) {

        line.className =
          "hack-line";

      }


      line.innerHTML = `

        <span>
          ${time}
        </span>

        ${escapeHTML(text)}

      `;


      controlLog.appendChild(
        line
      );


      while (
        controlLog.children.length
        > 7
      ) {

        controlLog
          .firstElementChild
          ?.remove();

      }

    }


    /* =====================================================
       SEND
    ====================================================== */

    const networkSend =
      $("#networkSend");


    function submitMessage() {

      if (
        !networkInput
        || !stream
      ) {
        return;
      }


      const value =
        networkInput.value.trim();


      if (!value) {

        networkInput.focus();

        return;

      }


      stream.appendChild(
        createMessage({

          user:
            `SUBJECT_${subject}`,

          text:
            value,

          location:
            "YOU",

          mine:
            true

        })
      );


      networkInput.value =
        "";


      if (charCount) {

        charCount.textContent =
          "0 / 180";

      }


      requestAnimationFrame(
        () => {

          stream.scrollTo({
            top:
              stream.scrollHeight,

            behavior:
              "smooth"
          });

        }
      );


      addControlLog(
        "EMOTIONAL SIGNAL DETECTED",
        "warning"
      );


      setTimeout(
        () => {

          addControlLog(
            "TRACE ATTEMPT BLOCKED // CSL",
            "hack"
          );

        },
        700
      );

    }


    networkSend?.addEventListener(
      "click",
      submitMessage
    );


    networkInput?.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key ===
            "Enter"
          && !event.shiftKey
        ) {

          event.preventDefault();

          submitMessage();

        }

      }
    );


    /* =====================================================
       SUBJECT LIST
    ====================================================== */

    const subjectList =
      $("#subjectList");


    const subjects = [

      "SUBJECT_0284",
      "SUBJECT_1190",
      "SUBJECT_7721",
      "SUBJECT_2218",
      "SUBJECT_9184",
      "SUBJECT_6192",
      "SUBJECT_3910",
      "SUBJECT_5521",
      "SUBJECT_1038",
      "SUBJECT_7124"

    ];


    if (subjectList) {

      subjectList.innerHTML =
        "";


      subjects.forEach(
        (name) => {

          const row =
            document.createElement(
              "div"
            );


          row.className =
            "subject-row";


          row.innerHTML = `

            <span
              class="online-dot"
            ></span>

            <span>
              ${name}
            </span>

          `;


          subjectList.appendChild(
            row
          );

        }
      );

    }


    /* =====================================================
       CLOCKS
    ====================================================== */

    const networkClock =
      $("#networkClock");

    const controlClock =
      $("#controlClock");


    function updateClocks() {

      const now =
        new Date()
          .toLocaleTimeString(
            "en-GB",
            {
              hour12:
                false
            }
          );


      if (networkClock) {

        networkClock.textContent =
          now;

      }


      if (controlClock) {

        controlClock.textContent =
          now;

      }

    }


    updateClocks();


    setInterval(
      updateClocks,
      1000
    );


    /* =====================================================
       ACTIVE COUNT
    ====================================================== */

    const activeCount =
      $("#roomActiveCount");


    const baseCounts = {

      public: 842,

      work: 314,

      school: 219,

      people: 401,

      relationship: 288

    };


    let count =
      baseCounts[currentRoom];


    if (activeCount) {

      activeCount.textContent =
        count;

    }


    setInterval(
      () => {

        count +=
          Math.floor(
            Math.random()
            * 7
          )
          - 3;


        count =
          Math.max(
            1,
            count
          );


        if (activeCount) {

          activeCount.textContent =
            count;

        }

      },
      5000
    );


    /* =====================================================
       FAKE LIVE CHAT
    ====================================================== */

    const fakeMessages = {

      public: [
        "오늘 왜 이렇게 기 빨리지",
        "집에 가서 아무것도 안 하고 싶다",
        "진짜 조용한 데 가고 싶음",
        "사람들이 오늘 유독 시끄럽게 느껴짐"
      ],

      work: [
        "이걸 왜 지금 말해주는데",
        "회의 또 잡혔음",
        "내 업무 아닌데 왜 내가 하지",
        "퇴근 직전에 연락 오는 거 금지해야 됨"
      ],

      school: [
        "과제 하나 끝내면 두 개 생김",
        "시험 범위 실화냐",
        "팀원 또 잠수탐",
        "학교 그냥 하루만 닫았으면"
      ],

      people: [
        "사람 만나는 것도 체력임",
        "왜 꼭 선 넘는 사람이 있냐",
        "나만 계속 맞춰주는 기분",
        "오늘은 아무도 말 안 걸었으면"
      ],

      relationship: [
        "연락할 거면 하고 말 거면 말지",
        "또 내가 먼저 연락함",
        "애매하게 구는 게 제일 싫음",
        "좋아하는 건지 심심한 건지 모르겠음"
      ]

    };


    function addFakeMessage() {

      if (!stream) {
        return;
      }


      const distanceFromBottom =
        stream.scrollHeight
        - stream.scrollTop
        - stream.clientHeight;


      const candidates =
        fakeMessages[currentRoom];


      const text =
        candidates[
          Math.floor(
            Math.random()
            * candidates.length
          )
        ];


      const fakeId =
        Math.floor(
          Math.random()
          * 9000
        )
        + 1000;


      const cities = [
        "SEOUL",
        "TOKYO",
        "LONDON",
        "BERLIN",
        "SINGAPORE"
      ];


      const city =
        cities[
          Math.floor(
            Math.random()
            * cities.length
          )
        ];


      stream.appendChild(
        createMessage({

          user:
            `SUBJECT_${fakeId}`,

          text,

          location:
            city

        })
      );


      /*
        최신 채팅 부근에 있을 때만
        자동으로 아래로 이동.
      */

      if (
        distanceFromBottom
        < 160
      ) {

        requestAnimationFrame(
          () => {

            stream.scrollTo({

              top:
                stream.scrollHeight,

              behavior:
                "smooth"

            });

          }
        );

      }


      while (
        stream.children.length
        > 35
      ) {

        stream
          .firstElementChild
          ?.remove();

      }

    }


    setInterval(
      addFakeMessage,
      8000
    );


    /* =====================================================
       CONTROL SYSTEM LOGS
    ====================================================== */

    const governmentLogs = [

      "FACIAL MICRO-EXPRESSION DETECTED",

      "SUBJECT HEART RATE +08",

      "PUBLIC COMPLIANCE VERIFIED",

      "VOICE STRESS PATTERN FOUND",

      "SUBJECT TRACE INITIATED",

      "EMOTIONAL INDEX UPDATED",

      "BEHAVIOR PATTERN ANALYSIS",

      "CIVIC STABILITY SCAN COMPLETE"

    ];


    setInterval(
      () => {

        const log =
          governmentLogs[
            Math.floor(
              Math.random()
              * governmentLogs.length
            )
          ];


        addControlLog(
          log
        );


        if (
          Math.random()
          > .68
        ) {

          setTimeout(
            () => {

              addControlLog(
                "TRACE BLOCKED // CSL OVERRIDE",
                "hack"
              );

            },
            500
          );

        }

      },
      3600
    );


    /* =====================================================
       CCTV DATA
    ====================================================== */

    const stressIndexes = [
      "62%",
      "67%",
      "71%",
      "74%",
      "79%",
      "83%"
    ];


    setInterval(
      () => {

        const leftData =
          document.querySelector(
            ".camera-data-left"
          );


        if (!leftData) {
          return;
        }


        const stress =
          stressIndexes[
            Math.floor(
              Math.random()
              * stressIndexes.length
            )
          ];


        const heartRate =
          Math.floor(
            Math.random()
            * 18
          )
          + 82;


        leftData.innerHTML = `

          EXPRESSION: NEUTRAL<br>

          HEART RATE:
          ${heartRate}<br>

          STRESS INDEX:
          ${stress}

        `;

      },
      4500
    );


    /* =====================================================
       INITIAL SYSTEM ACTIVITY
    ====================================================== */

    setTimeout(
      () => {

        addControlLog(
          "UNAUTHORIZED CHANNEL INTERCEPTED",
          "warning"
        );

      },
      700
    );


    setTimeout(
      () => {

        addControlLog(
          "IDENTITY TRACE BLOCKED // CSL",
          "hack"
        );

      },
      1500
    );


    console.log(
      `[CSL NETWORK] ${currentRoom.toUpperCase()} initialized`
    );

  }
);