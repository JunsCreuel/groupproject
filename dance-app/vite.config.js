import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 메인 사이트(정적 HTML)의 dance/ 하위 폴더에서 그대로 열리도록
// 상대 경로(base: './')로 빌드하고, 결과물을 ../dance 에 직접 출력한다.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../dance',
    emptyOutDir: true,
  },
});
