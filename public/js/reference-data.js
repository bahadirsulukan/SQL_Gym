/* ==========================================================================
   REFERENCE DATA
   Single source of truth for the cheat-sheet content. Used both by the
   standalone referenz.html page and by the in-page reference panel on
   every database page (reference-view.js renders this into either place).
   ========================================================================== */

const REFERENCE = [
  {
    id: "grundgeruest",
    num: "01",
    title: "Grundgerüst",
    cards: [
      {
        title: "Abarbeitungsreihenfolge",
        order: ["FROM", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY"],
        note: "WHERE filtert einzelne Zeilen (keine Aggregatfunktionen). HAVING filtert Gruppen (mit Aggregatfunktionen wie <code>SUM</code>, <code>COUNT</code>). ORDER BY steht immer ganz am Ende, auch nach HAVING."
      },
      {
        title: "Aggregatfunktionen",
        code: `COUNT(*)  -- Anzahl aller Zeilen
COUNT(spalte)  -- Anzahl NICHT-NULL-Werte
COUNT(DISTINCT x)  -- Anzahl eindeutiger Werte
SUM(spalte)  -- Summe
AVG(spalte)  -- Durchschnitt
MIN / MAX  -- kleinster / größter Wert`,
        note: "Jede nicht-aggregierte Spalte im SELECT muss auch im GROUP BY stehen."
      },
      {
        title: "DISTINCT, Sortierung &amp; Limit",
        code: `SELECT DISTINCT Land FROM Kunde;

ORDER BY Land ASC, Ort DESC  -- mehrere Spalten
LIMIT 5  -- nur die ersten 5 Zeilen
LIMIT 5 OFFSET 10  -- Zeilen 11 bis 15`
      }
    ]
  },
  {
    id: "joins",
    num: "02",
    title: "JOINs",
    cards: [
      {
        title: "JOIN-Typen",
        code: `-- nur Treffer in beiden Tabellen
JOIN t2 ON a.id = t2.id

-- alle aus links, NULL wenn kein Treffer
LEFT JOIN t2 ON a.id = t2.id

-- "gibt es kein Treffer?"
LEFT JOIN t2 ON a.id = t2.id
WHERE t2.id IS NULL`
      },
      {
        title: "Self-JOIN",
        code: `-- Hierarchie: Mitarbeiter & Vorgesetzter
SELECT m.Name, v.Name AS Chef
FROM Mitarbeiter m
JOIN Mitarbeiter v ON m.ChefNr = v.Nr

-- Paarvergleich: Heim- & Gastverein
SELECT h.Name, g.Name
FROM Spiel s
JOIN Verein h ON s.HeimNr = h.Nr
JOIN Verein g ON s.GastNr = g.Nr`,
        note: "Dieselbe Tabelle zweimal mit unterschiedlichen Aliasen einbinden, sonst ist nicht klar, welche Spalte gemeint ist."
      }
    ]
  },
  {
    id: "subqueries",
    num: "03",
    title: "Subqueries",
    cards: [
      {
        title: "NOT IN vs. NOT EXISTS",
        code: `-- funktioniert, außer bei NULL-Werten!
WHERE id NOT IN (SELECT id FROM t2)

-- NULL-sicher, korrelierte Subquery
WHERE NOT EXISTS (
  SELECT 1 FROM t2
  WHERE t2.id = t1.id
)`
      },
      {
        title: "Korrelierte Subquery",
        code: `-- pro Gruppe den Höchstwert finden
SELECT s.Name, s.Tore
FROM Spieler s
WHERE s.Tore = (
  SELECT MAX(s2.Tore) FROM Spieler s2
  WHERE s2.VereinNr = s.VereinNr
)`,
        note: "Die innere Abfrage verweist auf die äußere Zeile (<code>s.VereinNr</code>) und läuft einmal pro Außenzeile."
      },
      {
        title: "Skalare Subquery",
        code: `-- Vergleich mit einem berechneten Einzelwert
WHERE Flaeche > (SELECT AVG(Flaeche) FROM cia)
WHERE Gehalt = (SELECT MAX(Gehalt) FROM Mitarbeiter)`,
        note: "Die Subquery muss genau einen Wert liefern (eine Zeile, eine Spalte)."
      }
    ]
  },
  {
    id: "text",
    num: "04",
    title: "Text &amp; Bedingungen",
    cards: [
      {
        title: "LIKE &amp; Wildcards",
        code: `LIKE 'A%'  -- beginnt mit A
LIKE '%mann'  -- endet auf 'mann'
LIKE '%at%'  -- enthält 'at'
LIKE '_ax'  -- genau 3 Zeichen, endet auf 'ax'`,
        note: "<code>%</code> = beliebig viele Zeichen, <code>_</code> = genau ein Zeichen. In SQLite standardmäßig case-insensitive für ASCII."
      },
      {
        title: "CASE WHEN",
        code: `SELECT Name,
  CASE
    WHEN Gehalt >= 80000 THEN 'hoch'
    WHEN Gehalt >= 55000 THEN 'mittel'
    ELSE 'niedrig'
  END AS Stufe
FROM Mitarbeiter;`
      },
      {
        title: "String-Verkettung",
        code: `-- SQLite: || statt CONCAT()
SELECT Vorname || ' ' || Nachname AS Vollname
FROM Mitarbeiter;`
      }
    ]
  },
  {
    id: "zahlen",
    num: "05",
    title: "Zahlen, Datum &amp; NULL",
    cards: [
      {
        title: "Rabatt-Falle",
        code: `-- FALSCH: Rabatt ist kein Fixbetrag
(Einzelpreis - Rabatt) * Anzahl

-- RICHTIG: Rabatt ist ein Faktor (0.05 = 5%)
Einzelpreis * (1 - Rabatt) * Anzahl`
      },
      {
        title: "Ganzzahl-Division &amp; Runden",
        code: `-- Falle: 7 / 2 ergibt 3, nicht 3.5!
SELECT 7 * 1.0 / 2;  -- erzwingt REAL: 3.5

ROUND(Wert, 2)  -- 2 Nachkommastellen
Anteil * 100.0 / Gesamt  -- Prozentsatz`,
        note: "Ohne <code>* 1.0</code> rechnet SQLite bei INTEGER/INTEGER ganzzahlig, eine beliebte Klausurfalle, z. B. bei Auslastung/Prozent."
      },
      {
        title: "Datumsvergleiche (SQLite)",
        code: `-- Format: 'YYYY-MM-DD'
WHERE datum BETWEEN '1997-01-01' AND '1997-12-31'
WHERE datum LIKE '1997%'
WHERE strftime('%Y', datum) = '1997'`
      },
      {
        title: "NULL-Fallen",
        code: `-- FALSCH: liefert nie ein Ergebnis
WHERE spalte = NULL

-- RICHTIG:
WHERE spalte IS NULL
WHERE spalte IS NOT NULL

-- Ersatzwert einsetzen
COALESCE(spalte, 'unbekannt')`
      }
    ]
  },
  {
    id: "dml",
    num: "06",
    title: "Daten ändern (DML)",
    cards: [
      {
        title: "INSERT / UPDATE / DELETE",
        code: `INSERT INTO Kurs (KursNr, Fach)
VALUES ('IF-GK-2', 'IF');

UPDATE belegt SET Punkte = 15
WHERE SNr = 10001 AND KursNr = 'MA-LK-1';

DELETE FROM belegt WHERE Punkte < 5;`,
        note: "UPDATE/DELETE ohne WHERE betrifft <strong>alle</strong> Zeilen der Tabelle, vorher immer mit einem SELECT prüfen, welche Zeilen betroffen wären."
      }
    ]
  }
];
