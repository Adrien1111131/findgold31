import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true
  },
  define: {
    // Suppression de la définition incorrecte de process.env
    // Vite utilise import.meta.env au lieu de process.env
  },
  base: '/',
  envPrefix: 'VITE_'
});
