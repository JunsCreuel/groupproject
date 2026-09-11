(() => {
  const script = document.currentScript;
  const base = new URL('.', script.src);

  // shell.css를 shell.js가 있는 루트 기준으로 불러오기
  if (!document.querySelector('link[data-csl-shell]')) {
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = new URL('shell.css', base).href;
    style.dataset.cslShell = 'true';
    document.head.appendChild(style);
  }

  const currentPath = location.pathname;

  let active = 'home';

  if (currentPath.includes('network.html')) active = 'network';
  else if (currentPath.includes('map.html')) active = 'map';
  else if (currentPath.includes('archive.html')) active = 'archive';
  else if (currentPath.includes('profile.html')) active = 'profile';
  else if (currentPath.includes('/labs/')) active = 'labs';

  // 중복 생성 방지
  document.querySelector('.global-rail')?.remove();

  const rail = document.createElement('aside');
  rail.className = 'global-rail';

  rail.innerHTML = `
    <a
      href="${new URL('index.html', base).href}"
      class="global-rail-logo ${active === 'home' ? 'is-active' : ''}"
      data-label="HOME"
    >
      CSL
    </a>

    <a
      href="${new URL('network.html', base).href}"
      class="global-rail-btn ${active === 'network' ? 'is-active' : ''}"
      data-label="NETWORK"
    >
      N
    </a>

    <a
      href="${new URL('map.html', base).href}"
      class="global-rail-btn ${active === 'map' ? 'is-active' : ''}"
      data-label="MAP"
    >
      M
    </a>

    <a
      href="${new URL('archive.html', base).href}"
      class="global-rail-btn ${active === 'archive' ? 'is-active' : ''}"
      data-label="ARCHIVE"
    >
      A
    </a>

    <a
      href="${new URL('profile.html', base).href}"
      class="global-rail-btn ${active === 'profile' ? 'is-active' : ''}"
      data-label="MY NODE"
    >
      P
    </a>

    <a
      href="${new URL('labs/index.html', base).href}"
      class="global-rail-btn is-labs ${active === 'labs' ? 'is-active' : ''}"
      data-label="LABS"
    >
      L
    </a>
  `;

  document.body.prepend(rail);
  document.body.classList.add('has-global-rail');
})();
