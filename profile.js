const PROFILE_KEY = 'csl-profile';
const FRIENDS_KEY = 'csl-friends';

const DEFAULT_FRIENDS = [
  { code: 'SUBJECT_0821', name: 'nightowl', status: '오늘은 좀 조용히 있고 싶어.', channel: '# late-night', online: true, color: '#a989ff' },
  { code: 'SUBJECT_4410', name: '404mind', status: '할 일은 많은데 아무것도 하기 싫다.', channel: '# work-rage', online: true, color: '#62d9e8' },
  { code: 'SUBJECT_7732', name: 'tinycrash', status: 'CRACK LAB 다녀오는 중.', channel: 'CRACK LAB', online: true, color: '#ff3d94' },
  { code: 'SUBJECT_1209', name: 'slowday', status: '답장은 천천히 해도 돼.', channel: 'OFFLINE', online: false, color: '#c9f64b' }
];

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getSubjectCode() {
  const subject = readJSON('csl-subject', null);
  if (subject?.id) return `SUBJECT_${subject.id}`;
  const id = String(Math.floor(1000 + Math.random() * 9000));
  localStorage.setItem('csl-subject', JSON.stringify({ id, level: 50, createdAt: Date.now() }));
  return `SUBJECT_${id}`;
}

const defaultProfile = {
  code: getSubjectCode(),
  name: '',
  status: '',
  favoriteLab: '',
  color: '#ff3d94',
  visibility: 'friends'
};

let profile = { ...defaultProfile, ...readJSON(PROFILE_KEY, {}) };
let friends = readJSON(FRIENDS_KEY, DEFAULT_FRIENDS);

const profileForm = document.getElementById('profileForm');
const displayName = document.getElementById('displayName');
const statusMessage = document.getElementById('statusMessage');
const favoriteLab = document.getElementById('favoriteLab');
const profileVisibility = document.getElementById('profileVisibility');
const avatar = document.getElementById('profileAvatar');
const subjectEl = document.getElementById('profileSubject');
const previewStatus = document.getElementById('profilePreviewStatus');
const saveNotice = document.getElementById('saveNotice');
const friendList = document.getElementById('friendList');
const friendCount = document.getElementById('friendCount');
const friendSearch = document.getElementById('friendSearch');
const friendFilter = document.getElementById('friendFilter');
const friendFeedback = document.getElementById('friendFeedback');
const friendsEmpty = document.getElementById('friendsEmpty');
let selectedColor = profile.color;

function escapeHTML(value) {
  const el = document.createElement('div');
  el.textContent = value;
  return el.innerHTML;
}

function updateProfilePreview() {
  const name = displayName.value.trim();
  const status = statusMessage.value.trim();
  avatar.textContent = (name || profile.code.replace('SUBJECT_', '')).charAt(0).toUpperCase();
  avatar.style.setProperty('--profile-color', selectedColor);
  subjectEl.textContent = name ? `${name} // ${profile.code}` : profile.code;
  previewStatus.textContent = status || '아직 상태 메시지가 없습니다.';
  document.querySelectorAll('[data-color]').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.color === selectedColor);
  });
}

function loadProfileForm() {
  displayName.value = profile.name;
  statusMessage.value = profile.status;
  favoriteLab.value = profile.favoriteLab;
  profileVisibility.value = profile.visibility;
  selectedColor = profile.color;
  updateProfilePreview();
}

document.getElementById('colorOptions').addEventListener('click', (event) => {
  const button = event.target.closest('[data-color]');
  if (!button) return;
  selectedColor = button.dataset.color;
  updateProfilePreview();
});

displayName.addEventListener('input', updateProfilePreview);
statusMessage.addEventListener('input', updateProfilePreview);

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  profile = {
    code: profile.code,
    name: displayName.value.trim(),
    status: statusMessage.value.trim(),
    favoriteLab: favoriteLab.value,
    color: selectedColor,
    visibility: profileVisibility.value
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  saveNotice.textContent = '저장됐습니다. 이 브라우저에서만 유지됩니다.';
  updateProfilePreview();
  window.setTimeout(() => { saveNotice.textContent = ''; }, 2600);
});

function saveFriends() {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

function renderFriends() {
  const query = friendSearch.value.trim().toLowerCase();
  const filter = friendFilter.value;
  const visible = friends.filter((friend) => {
    const matchesQuery = `${friend.code} ${friend.name}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || (filter === 'online' ? friend.online : !friend.online);
    return matchesQuery && matchesFilter;
  });

  friendCount.textContent = friends.length;
  friendsEmpty.hidden = visible.length > 0;
  friendList.innerHTML = visible.map((friend) => `
    <article class="friend-card" style="--friend-color:${friend.color}">
      <div class="friend-avatar">${escapeHTML((friend.name || friend.code).charAt(0).toUpperCase())}</div>
      <div class="friend-info">
        <div class="friend-name">
          <strong>${escapeHTML(friend.name || friend.code)}</strong>
          <span class="friend-state ${friend.online ? 'is-online' : ''}">${friend.online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        ${friend.name ? `<small>${escapeHTML(friend.code)}</small>` : ''}
        <p>${escapeHTML(friend.status)}</p>
        <span class="friend-channel">${escapeHTML(friend.channel)}</span>
      </div>
      <div class="friend-actions">
        <a href="network.html">OPEN</a>
        <button type="button" data-remove="${escapeHTML(friend.code)}">REMOVE</button>
      </div>
    </article>
  `).join('');
}

document.getElementById('friendAddForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.getElementById('friendCode');
  const rawCode = input.value.trim().toUpperCase();
  const code = /^\d{4}$/.test(rawCode)
    ? `SUBJECT_${rawCode}`
    : rawCode.replace(/^SUBJECT[- ]?/, 'SUBJECT_');

  if (!/^SUBJECT_\d{4}$/.test(code)) {
    friendFeedback.textContent = 'SUBJECT_0000 형식으로 입력해 주세요.';
    return;
  }
  if (code === profile.code || friends.some((friend) => friend.code === code)) {
    friendFeedback.textContent = '이미 연결된 SUBJECT입니다.';
    return;
  }

  friends.unshift({
    code,
    name: '',
    status: '새로 연결된 SUBJECT입니다.',
    channel: 'OFFLINE',
    online: false,
    color: '#62d9e8'
  });
  saveFriends();
  input.value = '';
  friendFeedback.textContent = `${code}와 연결됐습니다.`;
  renderFriends();
});

friendList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  friends = friends.filter((friend) => friend.code !== button.dataset.remove);
  saveFriends();
  renderFriends();
});

friendSearch.addEventListener('input', renderFriends);
friendFilter.addEventListener('change', renderFriends);

loadProfileForm();
renderFriends();
