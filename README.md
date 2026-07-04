# sql üben: Interaktives SQL-Praxislabor

Eine kleine, selbst gehostete Website zum Üben von SQL-Abfragen direkt im Browser.
Keine Installation eines Datenbank-Servers nötig, alles läuft clientseitig über
[sql.js](https://github.com/sql-js/sql.js) (SQLite kompiliert zu WebAssembly).

## Lokal starten (mit npm)

1. Diesen Ordner nach `~/Desktop/MyProjects/sql-ueben` (oder wohin auch immer) verschieben.
2. Im Terminal in den Ordner wechseln:
   ```bash
   cd ~/Desktop/MyProjects/sql-ueben
   npm install
   npm run dev
   ```
3. Der Terminal zeigt eine lokale Adresse an (z. B. `http://localhost:5173`),
   die öffnet sich automatisch im Browser. Änderungen an den Dateien werden
   sofort per Live-Reload übernommen.

Weitere Befehle:
```bash
npm run build     # erzeugt eine fertige, statische Version im Ordner dist/
npm run preview   # zeigt die gebaute Version lokal an
```

Voraussetzung: [Node.js](https://nodejs.org) (Version 18 oder neuer) muss installiert sein.
Prüfen mit `node -v`.

## Ohne npm: einfach per Doppelklick

`index.html` funktioniert auch direkt im Browser, ganz ohne Node/npm/Vite.
`npm run dev` bringt lediglich Live-Reload und eine saubere lokale URL statt `file://`.


## Was ist enthalten?

- **10 Übungsdatenbanken, je eigene Seite**: Nordwind (Bestellwesen), CIA World Factbook
  (Länder), Formel-1-Weltmeistertitel, Schule (n:m + DML), Bibliothek (Ausleihen,
  Datumsvergleiche), Kino (3-fach-JOINs, Umsatz/Auslastung), Personal & Firma
  (Self-JOIN/Gehaltshierarchie), Krankenhaus (Aggregation/NOT IN), Online-Shop
  (Umsatz/Retouren über 4 Tabellen), Sportliga (Self-JOIN Heim/Gast, korrelierte Subqueries)
- **69 Übungsaufgaben** mit Schwierigkeitsgrad, Hinweis und Musterlösung
- **SQL-Editor mit Syntax-Highlighting** (CodeMirror 6) statt reinem Textfeld
- **Automatische Prüfung**: deine Abfrage wird gegen die Musterlösung verglichen
- **Fortschrittsspeicherung** im Browser (localStorage), kein Login nötig, seitenübergreifend
- **Eigene Kurzreferenz-Seite** zu JOINs, GROUP BY/HAVING, NOT IN vs. NOT EXISTS, Rabattberechnung

## Seitenstruktur

```
index.html                       Startseite: Hero, keine Datenbankliste
datenbanken.html                 Datenbank-Auswahl: alle 10 DBs sortiert von leicht bis schwer
referenz.html                    Kurzreferenz-Seite
datenbanken/nordwind.html        Schema + Konsole + Aufgaben
datenbanken/cia.html             ...
datenbanken/f1.html              ...
datenbanken/schule.html          ...
datenbanken/bibliothek.html      ...
datenbanken/kino.html            ...
datenbanken/firma.html           ...
datenbanken/krankenhaus.html     ...
datenbanken/shop.html            ...
datenbanken/liga.html            ...
```

Jede Datenbankseite ist eigenständig aufrufbar (z. B. per Lesezeichen oder Link)
und lädt nur die für sie relevanten Aufgaben. Der Fortschritt wird seitenübergreifend
im selben `localStorage` gespeichert, daher zeigt die Startseite den Fortschritt
aller Datenbanken gesammelt an.

## Deployment

### Variante 1: GitHub Pages (kostenlos, empfohlen)

1. Repository auf GitHub erstellen und diesen Ordner hochladen (`git init`, `git add .`,
   `git commit -m "init"`, `git push`).
2. Unter **Settings → Pages** die Quelle auf den `main`-Branch setzen.
3. Die Seite ist danach unter `https://<username>.github.io/<repo>/` erreichbar.

### Variante 2: Universitäts-Webspace (z. B. h-da)

Am einfachsten: `npm run build` ausführen und den Inhalt von `dist/` per FTP/SFTP
hochladen, das ist eine fertige, statische Version. Alternativ reicht auch der
Ordner so wie er ist (`index.html`, `public/`), da keine PHP/Datenbank-Konfiguration
nötig ist, die SQL-Engine läuft im Browser.

### Variante 3: Netlify / Vercel

Ordner per Drag & Drop auf [app.netlify.com/drop](https://app.netlify.com/drop) ziehen,
fertig, sofort live. Oder Repository verbinden (Build-Command: `npm run build`,
Output-Verzeichnis: `dist`).

## Eigene Datenbank oder Aufgaben hinzufügen

- **Neue Aufgabe für eine bestehende Datenbank**: In `public/js/exercises.js` unter dem
  passenden Datenbank-Key ein Objekt mit `question`, `hint`, `solution` und
  `difficulty` (1–3) ergänzen. `check: "exact"` erzwingt gleiche Zeilenreihenfolge
  (nützlich bei ORDER BY-Aufgaben), `check: "set"` vergleicht ungeordnet (Standard).
  Änderungen werden bei laufendem `npm run dev` automatisch neu geladen.

- **Neue Datenbank (eigene Seite)**:
  1. In `public/js/databases.js` ein neues Objekt zum `DATABASES`-Array hinzufügen
     (Schema-SQL im SQLite-Dialekt, `schema`-Metadaten für die Anzeige und ein
     `level` von 1–3, das auf `datenbanken.html` als Leicht/Mittel/Schwer-Badge
     angezeigt wird). Position im Array bestimmt die Sortierung auf der Auswahlseite.
  2. In `public/js/exercises.js` einen neuen Eintrag mit demselben `id` anlegen.
  3. Eine neue Seite `datenbanken/<id>.html` erstellen, am einfachsten eine der
     bestehenden Seiten kopieren und `data-db-id="..."` im `<body>`-Tag sowie den
     Titel/die Überschrift anpassen. Der Rest (Schema-Anzeige, Konsole, Prüfung)
     funktioniert automatisch über `db-page.js`.
  4. Die neue Seite in `vite.config.js` unter `build.rollupOptions.input` ergänzen,
     damit `npm run build` sie mit einschließt.
  5. Der Eintrag im Grid auf `datenbanken.html` erscheint automatisch, da
     `datenbanken-page.js` alle Einträge aus `DATABASES` rendert.

## Technischer Hinweis

Alle Abfragen laufen ausschließlich lokal im Browser-Tab (SQLite/WASM),
es gibt keinen Server, der Daten empfängt oder speichert. Der Fortschritt liegt
nur in `localStorage` des jeweiligen Browsers und geht beim Leeren des
Browser-Caches verloren.

## Lizenz / Nutzung

Frei nutzbar und anpassbar für Lehre, Übungsgruppen oder Selbststudium.
