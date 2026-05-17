import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pagesのプロジェクトページでそのまま配信しやすいbase設定です。
export default defineConfig({
  base: '/quiz-typing-academy/',
  plugins: [react()],
});
