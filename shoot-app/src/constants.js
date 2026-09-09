// 사격장 전체에서 공유하는 상수 — App.jsx(HUD 표시)와 Experience.jsx(발사 로직) 둘 다 사용
export const MAX_AMMO = 25; // 탄창 용량(1회 장전당)
export const TOTAL_AMMO = 120; // 이번 판에서 쏠 수 있는 전체 탄약(처음 장전된 분량 포함)
export const RELOAD_MS = 900;
export const FIRE_INTERVAL_MS = 90; // 연사 간격 — 마우스를 누르고 있는 동안 이 간격으로 계속 발사
export const KILL_HITS = 100; // 외계인이 쓰러지는 데 필요한 피격 횟수
