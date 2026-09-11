// =====================================================================
// script.js — CSL 랜딩페이지
// 0 진입 게이트, 03 Lab 카드, 04 LIVE TRANSMISSIONS(게시+댓글+공감 랭킹),
// 05 GLOBAL STRESS MAP, 06 YOUR LAB RECORD, ABOUT 모달을 담당한다.
// 04/05/06은 지금은 전부 localStorage 기반 목업이고, "저장소 접근"
// (loadPosts/savePosts 등)과 "화면 로직"을 분리해뒀다 — 나중에 백엔드가
// 붙으면 이 저장소 함수들만 fetch 기반으로 바꿔치기하면 나머지 로직
// (정렬, 카테고리 매칭, 렌더링)은 그대로 재사용할 수 있다.
// =====================================================================

const LABS = [
  { id: 'crack', name: 'CRACK LAB', tagline: '무언가를 깨뜨리고 싶을 때', color: 'var(--coral)', href: 'crack/index.html' },
  { id: 'shoot', name: 'SHOOT RANGE', tagline: '타깃에 집중하며 긴장을 풀고 싶을 때', color: 'var(--lime)', href: 'shoot/index.html' },
  { id: 'dance', name: 'DANCE ROOM', tagline: '몸을 움직이며 박자에 풀고 싶을 때', color: 'var(--purple)', href: 'dance/index.html' },
  { id: 'click', name: 'CLICK ROOM', tagline: '반복적인 작은 행동이 필요할 때', color: 'var(--mint)', href: 'click/index.html' },
];

// ---------------------------------------------------------------
// 0. 진입 게이트 — ENTER THE LAB을 눌러야 사이트가 열린다
// 랩에서 뒤로가기하면 항상 이 랜딩페이지(루트)로 돌아오게 되므로,
// 이미 Subject가 있는 재방문자에게는 매번 게이트 연출을 반복하지 않고
// 바로 통과시킨다. 처음 접속하는 사람에게만 연출을 보여준다.
// ---------------------------------------------------------------
const isReturningSubject = !!localStorage.getItem('csl-subject');

if (!isReturningSubject) {
  document.body.classList.add('is-locked');
}

function getSubject() {
  const raw = localStorage.getItem('csl-subject');
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  const subject = {
    id: String(Math.floor(1000 + Math.random() * 9000)),
    level: Math.floor(40 + Math.random() * 55),
    createdAt: Date.now(),
  };
  localStorage.setItem('csl-subject', JSON.stringify(subject));
  return subject;
}

const gate = document.getElementById('gate');
const gateSubjectEl = document.getElementById('gateSubject');

if (isReturningSubject) {
  gate.classList.add('is-hidden', 'is-instant');
} else {
  document.getElementById('enterBtn').addEventListener('click', () => {
    // 다른 Lab들과 같은 csl-volume 설정을 공유해서, 여기서도 사용자가
    // 맞춰둔 음량 그대로 재생한다. 자동재생 정책 때문에 페이지 로드 시가
    // 아니라 반드시 이 클릭(사용자 제스처) 안에서 재생을 걸어야 한다.
    const enterVolume = Number(localStorage.getItem('csl-volume') ?? '50') / 100;
    const enterSound = new Audio('assets/audio/enter.mp3');
    enterSound.volume = enterVolume;
    enterSound.play().catch(() => {});

    const subject = getSubject();
    gateSubjectEl.textContent = `SUBJECT #${subject.id} — CURRENT STRESS LEVEL: ${subject.level}%`;
    gateSubjectEl.classList.add('is-visible');
    setTimeout(() => {
      gate.classList.add('is-hidden');
      document.body.classList.remove('is-locked');
    }, 900);
  });
}

// ---------------------------------------------------------------
// 03. EXPLORE THE LAB — Lab 카드 렌더 + 방문 기록
// ---------------------------------------------------------------
function getVisitedLabs() {
  try { return JSON.parse(localStorage.getItem('csl-labs-visited') || '[]'); } catch { return []; }
}

function markLabVisited(labId) {
  const visited = new Set(getVisitedLabs());
  visited.add(labId);
  localStorage.setItem('csl-labs-visited', JSON.stringify([...visited]));
}

const labGrid = document.getElementById('labGrid');
LABS.forEach((lab) => {
  const a = document.createElement('a');
  a.className = 'lab-card';
  a.href = lab.href;
  a.style.setProperty('--accent', lab.color);
  a.innerHTML = `
    <span class="lab-card-name">${lab.name}</span>
    <span class="lab-card-tagline">${lab.tagline}</span>
    <span class="lab-card-go">ENTER →</span>
  `;
  a.addEventListener('click', () => markLabVisited(lab.id));
  labGrid.appendChild(a);
});

// ---------------------------------------------------------------
// 04. LIVE TRANSMISSIONS — 게시 / 댓글 / 공감 랭킹 / 비슷한 고민 매칭
// ---------------------------------------------------------------
const POSTS_KEY = 'csl-landing-posts';

function loadPosts() {
  const raw = localStorage.getItem(POSTS_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { /* fall through */ }
  }
  // 최초 방문 — 시드 데이터를 복제하고, 작성 순서가 유지되도록
  // 과거 시점의 타임스탬프를 부여한다(최신순 정렬의 기준값)
  const now = Date.now();
  const seeded = SEED_POSTS.map((p, i) => ({
    ...p,
    ts: now - (SEED_POSTS.length - i) * 9 * 60 * 1000,
    comments: p.comments.map((c) => ({ ...c })),
  }));
  savePosts(seeded);
  return seeded;
}

function savePosts(posts) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

let posts = loadPosts();
let activeCategory = null; // 선택한 카테고리 = 다음 글의 태그 + 피드 필터

const categoryPicker = document.getElementById('categoryPicker');
CATEGORIES.forEach((cat) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'category-chip';
  btn.style.setProperty('--c', cat.color);
  btn.textContent = cat.label;
  btn.dataset.cat = cat.id;
  btn.addEventListener('click', () => {
    activeCategory = activeCategory === cat.id ? null : cat.id;
    renderCategoryChips();
    renderFeed();
  });
  categoryPicker.appendChild(btn);
});

function renderCategoryChips() {
  categoryPicker.querySelectorAll('.category-chip').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.cat === activeCategory);
  });
}

function categoryInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

function timeAgo(ts) {
  const min = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (min < 60) return `${min}분 전`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  return `${Math.round(hr / 24)}일 전`;
}

const feedEl = document.getElementById('feed');

function renderFeed() {
  const visible = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts;
  const sorted = [...visible].sort((a, b) => b.ts - a.ts);

  feedEl.innerHTML = '';
  sorted.forEach((post) => {
    const cat = categoryInfo(post.category);
    const card = document.createElement('article');
    card.className = 'feed-post';

    const sortedComments = [...post.comments].sort((a, b) => b.likes - a.likes);

    card.innerHTML = `
      <div class="post-top">
        <span class="post-subject">${post.subject}</span>
        <span class="post-category" style="background:${cat.color}">${cat.label}</span>
        <span class="post-subject">· ${timeAgo(post.ts)}</span>
      </div>
      <p class="post-text">${escapeHtml(post.text)}</p>
      ${post.lab ? `<p class="post-lab">→ ENTERED <strong>${post.lab}</strong></p>` : ''}
      <div class="comments">
        ${sortedComments.map((c) => `
          <div class="comment" data-comment-id="${c.id}">
            <span class="comment-text">${escapeHtml(c.text)}</span>
            <button class="comment-like" data-post="${post.id}" data-comment="${c.id}">❤ <span>${c.likes}</span></button>
          </div>
        `).join('')}
      </div>
      <div class="comment-add">
        <input type="text" maxlength="60" placeholder="댓글로 공감을 남겨보세요..." data-post-input="${post.id}">
        <button data-post-comment="${post.id}">달기</button>
      </div>
    `;
    feedEl.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

feedEl.addEventListener('click', (e) => {
  const likeBtn = e.target.closest('.comment-like');
  if (likeBtn) {
    const postId = likeBtn.dataset.post;
    const commentId = likeBtn.dataset.comment;
    const post = posts.find((p) => p.id === postId);
    const comment = post && post.comments.find((c) => c.id === commentId);
    if (comment) {
      comment.likes += 1;
      savePosts(posts);
      renderFeed();
    }
    return;
  }

  const commentBtn = e.target.closest('[data-post-comment]');
  if (commentBtn) {
    const postId = commentBtn.dataset.postComment;
    const input = feedEl.querySelector(`[data-post-input="${postId}"]`);
    const text = input.value.trim();
    if (!text) return;
    const post = posts.find((p) => p.id === postId);
    post.comments.push({ id: `c-${Date.now()}`, text, likes: 0 });
    savePosts(posts);
    renderFeed();
  }
});

const similarNoteEl = document.createElement('div');
similarNoteEl.className = 'similar-note';
similarNoteEl.hidden = true;
feedEl.before(similarNoteEl);

function showSimilar(category, excludeId) {
  const matches = posts.filter((p) => p.category === category && p.id !== excludeId).slice(0, 3);
  if (matches.length === 0) { similarNoteEl.hidden = true; return; }
  const cat = categoryInfo(category);
  similarNoteEl.hidden = false;
  similarNoteEl.innerHTML = `<strong>당신과 같은 걸(${cat.label}) 느끼는 사람들</strong><br>` +
    matches.map((m) => `· ${escapeHtml(m.text)}`).join('<br>');
}

document.getElementById('postSubmit').addEventListener('click', submitPost);
document.getElementById('postInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitPost();
});

function submitPost() {
  const input = document.getElementById('postInput');
  const text = input.value.trim();
  if (!text) return;
  const subject = getSubject();
  const category = activeCategory || 'other';
  const newPost = {
    id: `local-${Date.now()}`,
    subject: `SUBJECT ${subject.id}`,
    category,
    text,
    lab: '',
    comments: [],
    ts: Date.now(),
  };
  posts.unshift(newPost);
  savePosts(posts);
  input.value = '';
  renderFeed();
  showSimilar(category, newPost.id);
  renderStressMap();
}

// ---------------------------------------------------------------
// 05. GLOBAL STRESS MAP — 기본 목업 비율 + 실제 게시물 비율을 섞는다
// ---------------------------------------------------------------
const stressMapEl = document.getElementById('stressMap');

function computeStressShare() {
  const counts = {};
  CATEGORIES.forEach((c) => { counts[c.id] = 0; });
  posts.forEach((p) => { if (counts[p.category] !== undefined) counts[p.category] += 1; });
  const total = posts.length || 1;

  const blended = {};
  CATEGORIES.forEach((c) => {
    const base = BASE_STRESS_SHARE[c.id] || 0;
    const live = (counts[c.id] / total) * 100;
    blended[c.id] = base * 0.7 + live * 0.3; // 실사용 신호를 30%만 반영 — 초반엔 목업이 주도하되 점점 실데이터로 기움
  });
  const sum = Object.values(blended).reduce((a, b) => a + b, 0) || 1;
  const normalized = CATEGORIES.map((c) => ({ ...c, pct: Math.round((blended[c.id] / sum) * 100) }));
  return normalized.sort((a, b) => b.pct - a.pct);
}

function renderStressMap() {
  const shares = computeStressShare();
  stressMapEl.innerHTML = shares.map((c) => `
    <div class="map-row">
      <span class="map-label">${c.label}</span>
      <div class="map-track"><div class="map-fill" style="width:${c.pct}%; background:${c.color}"></div></div>
      <span class="map-pct">${c.pct}%</span>
    </div>
  `).join('');
}

// ---------------------------------------------------------------
// 06. YOUR LAB RECORD
// ---------------------------------------------------------------
function getLabUsageSignal(labId) {
  if (labId === 'crack') return Number(localStorage.getItem('csl-crack-total-broken') || '0');
  if (labId === 'click') return Number(localStorage.getItem('csl-click-total') || '0');
  return getVisitedLabs().includes(labId) ? 1 : 0;
}

function renderRecord() {
  const subject = getSubject();
  const visited = getVisitedLabs();
  const crackTotal = Number(localStorage.getItem('csl-crack-total-broken') || '0');
  const clickTotal = Number(localStorage.getItem('csl-click-total') || '0');

  document.getElementById('recordSubject').textContent = `SUBJECT #${subject.id}`;

  document.getElementById('recordVisited').textContent = String(visited.length);
  const released = Math.min(100, visited.length * 15 + crackTotal * 3 + clickTotal);
  document.getElementById('recordReleased').textContent = `${released}%`;

  let mostLab = null;
  let mostScore = 0;
  LABS.forEach((lab) => {
    const score = getLabUsageSignal(lab.id);
    if (score > mostScore) { mostScore = score; mostLab = lab; }
  });
  document.getElementById('recordMost').textContent = mostLab ? mostLab.name : '—';

  const stampsEl = document.getElementById('recordStamps');
  stampsEl.innerHTML = LABS.map((lab) => `
    <span class="stamp ${visited.includes(lab.id) ? 'is-earned' : ''}">${lab.name} ${visited.includes(lab.id) ? '✓' : ''}</span>
  `).join('');
}

// ---------------------------------------------------------------
// ABOUT 모달
// ---------------------------------------------------------------
// 07. TELL NO ONE BUT US — Gemini API(무료 티어)를 백엔드 없이 브라우저에서
// 직접 호출한다. 키는 config.js(배포 시 GitHub Actions가 저장소 secret으로
// 생성 — 소스에는 절대 커밋되지 않음)의 window.CSL_GEMINI_KEY에서 읽는다.
// 로컬에서 config.js 없이 열면 키가 없으니 안내 메시지만 보여주고 실제
// 호출은 하지 않는다. 대화 내용은 어디에도 저장하지 않고 그 자리에서만
// 보여준다.
// ---------------------------------------------------------------
const GEMINI_MODEL = 'gemini-2.0-flash';
const CONFESS_SYSTEM_PROMPT = `너는 친한 친구처럼 반말로 편하게 반응해주는 챗봇이야.
사용자가 남한테 말하기 애매하거나 웃긴 고민/사건을 털어놓으면, 위트있고
MZ스러운 드립으로 짧게 반응해줘. "전문 상담사처럼" 진지한 조언을 길게
늘어놓지 말고, 공감 반 드립 반으로 3문장 이내, 이모지 없이 답해.`;

const confessInput = document.getElementById('confessInput');
const confessSubmit = document.getElementById('confessSubmit');
const confessResponse = document.getElementById('confessResponse');

async function askGemini(text) {
  const key = window.CSL_GEMINI_KEY;
  if (!key || key === 'YOUR_GEMINI_API_KEY_HERE') {
    return { ok: false, message: '지금은 이 기능을 쓸 수 없어 — 배포된 사이트에서만 동작해.' };
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: CONFESS_SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text }] }],
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini API ${res.status}`);
    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return { ok: true, message: reply || '음... 할 말을 잃었어.' };
  } catch {
    return { ok: false, message: '지금은 반응을 받아올 수 없어 — 잠시 후 다시 시도해봐.' };
  }
}

if (confessSubmit) {
  confessSubmit.addEventListener('click', async () => {
    const text = confessInput.value.trim();
    if (!text) return;

    confessSubmit.disabled = true;
    confessSubmit.textContent = '듣는 중...';
    confessResponse.hidden = false;
    confessResponse.textContent = '음...';

    const result = await askGemini(text);
    confessResponse.textContent = result.message;
    confessResponse.classList.toggle('is-error', !result.ok);

    confessSubmit.disabled = false;
    confessSubmit.textContent = '반응 듣기 →';
  });
}

// ---------------------------------------------------------------
const aboutModal = document.getElementById('aboutModal');
document.getElementById('aboutLink').addEventListener('click', (e) => {
  e.preventDefault();
  aboutModal.classList.add('is-open');
});
document.getElementById('aboutClose').addEventListener('click', () => aboutModal.classList.remove('is-open'));
aboutModal.addEventListener('click', (e) => {
  if (e.target === aboutModal) aboutModal.classList.remove('is-open');
});
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && aboutModal.classList.contains('is-open')) aboutModal.classList.remove('is-open');
});

// ---------------------------------------------------------------
// 초기 렌더
// ---------------------------------------------------------------
renderFeed();
renderStressMap();
renderRecord();
