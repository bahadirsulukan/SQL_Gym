import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Projekt ist reines HTML/CSS/JS - kein Framework-Build noetig.
  // Vite dient hier nur als schneller lokaler Dev-Server mit Live-Reload
  // und uebernimmt beim Build das Kopieren/Bundeln aller Seiten.
  root: '.',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        datenbankenUebersicht: resolve(__dirname, 'datenbanken.html'),
        referenz: resolve(__dirname, 'referenz.html'),
        normalisierung: resolve(__dirname, 'normalisierung.html'),
        cia: resolve(__dirname, 'datenbanken/cia.html'),
        f1: resolve(__dirname, 'datenbanken/f1.html'),
        schule: resolve(__dirname, 'datenbanken/schule.html'),
        bibliothek: resolve(__dirname, 'datenbanken/bibliothek.html'),
        krankenhaus: resolve(__dirname, 'datenbanken/krankenhaus.html'),
        nordwind: resolve(__dirname, 'datenbanken/nordwind.html'),
        kino: resolve(__dirname, 'datenbanken/kino.html'),
        shop: resolve(__dirname, 'datenbanken/shop.html'),
        firma: resolve(__dirname, 'datenbanken/firma.html'),
        liga: resolve(__dirname, 'datenbanken/liga.html')
      }
    }
  }
});
