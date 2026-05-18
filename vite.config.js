import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const envKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_TMDB_API_KEY',
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const envDefines = Object.fromEntries(
    envKeys.map((key) => [`process.env.${key}`, JSON.stringify(env[key] || '')])
  );

  return {
    base: '/',
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      ...envDefines,
    },
  };
});
