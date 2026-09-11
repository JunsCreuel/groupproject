// 실제 config.js는 절대 커밋하지 않는다 — GitHub Actions 배포 워크플로우
// (.github/workflows/deploy-pages.yml)가 배포할 때마다 저장소 secret
// (GEMINI_API_KEY)로 config.js를 자동 생성해서 이 자리를 대신한다.
//
// 로컬에서 "AI에게 털어놓기" 기능을 테스트해보고 싶으면, 이 파일을
// config.js로 복사한 뒤 아래 값을 본인의 Gemini API 키로 바꾸면 된다.
// 키는 https://aistudio.google.com/apikey 에서 무료로 발급받을 수 있다.
//
// 주의: 이 키는 백엔드 없이 브라우저에서 직접 호출되므로 배포 후에는
// 누구나 페이지 소스/네트워크 탭에서 볼 수 있다 — Google AI Studio나
// Google Cloud 콘솔에서 이 키를 "HTTP 리퍼러 제한"으로 우리 사이트
// 도메인에서 온 요청만 허용하도록 반드시 제한해둘 것.
window.CSL_GEMINI_KEY = 'YOUR_GEMINI_API_KEY_HERE';
