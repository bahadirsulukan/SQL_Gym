/* ==========================================================================
   REFERENCE DATA
   Three independent cheat-sheet datasets - SQL (SELECT-Aufgaben), SQL-Praxis
   (DDL/DML/Trigger/Stored Procedure/JDBC) und Normalisierung - used both by
   the standalone referenz.html page (as tabs) and by the in-page reference
   panel on every page (reference-view.js renders whichever dataset is
   passed to it into either place; each page's "Referenz"-Link opens the
   dataset that matches what that page is about).
   ========================================================================== */

const REFERENCE_SQL = [
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

const REFERENCE_SQL_PRAXIS = [
  {
    id: "ddl",
    num: "01",
    title: "DDL &ndash; Schema &auml;ndern",
    cards: [
      {
        title: "CREATE TABLE",
        code: `CREATE TABLE Kurs (
  KursNr TEXT PRIMARY KEY,
  Fach TEXT,
  Punkte INTEGER
);`,
        note: "Primärschlüssel direkt an der Spalte mit <code>PRIMARY KEY</code>, oder am Ende als eigene Zeile <code>PRIMARY KEY (a, b)</code> für zusammengesetzte Schlüssel."
      },
      {
        title: "ALTER TABLE",
        code: `-- Spalte hinzufügen
ALTER TABLE Kurs ADD COLUMN Raum TEXT;

-- Spalte löschen (SQLite ab Version 3.35)
ALTER TABLE Kurs DROP COLUMN Raum;

-- Tabelle/Spalte umbenennen
ALTER TABLE Kurs RENAME TO Kurse;
ALTER TABLE Kurse RENAME COLUMN Fach TO Fachbereich;`,
        note: "SQLite kann nachträglich keine Constraints (z. B. UNIQUE, NOT NULL) per ALTER TABLE hinzufügen - dafür braucht es einen UNIQUE INDEX oder eine neue Tabelle."
      },
      {
        title: "Index &amp; Eindeutigkeit",
        code: `CREATE INDEX idx_kurs_fach ON Kurs(Fach);

-- erzwingt Eindeutigkeit, wie eine nachträgliche UNIQUE-Regel
CREATE UNIQUE INDEX idx_kurs_nr ON Kurs(KursNr);`,
        note: "Ein normaler Index beschleunigt nur Abfragen. Ein UNIQUE INDEX verhindert zusätzlich doppelte Werte, so wie eine UNIQUE-Constraint es täte."
      }
    ]
  },
  {
    id: "dml",
    num: "02",
    title: "DML &ndash; Daten &auml;ndern",
    cards: [
      {
        title: "INSERT / UPDATE / DELETE",
        code: `INSERT INTO Kurs (KursNr, Fach, Punkte)
VALUES ('IF-GK-2', 'IF', 10);

UPDATE Kurs SET Punkte = Punkte + 1
WHERE Fach = 'IF';

DELETE FROM Kurs WHERE Punkte < 5;`,
        note: "UPDATE/DELETE ohne WHERE betrifft <strong>alle</strong> Zeilen. Vorher immer mit einem SELECT prüfen, welche Zeilen betroffen wären."
      },
      {
        title: "Mehrere Zeilen auf einmal einfügen",
        code: `INSERT INTO Kurs (KursNr, Fach, Punkte) VALUES
  ('MA-LK-1', 'MA', 15),
  ('DE-GK-1', 'DE', 8);`
      }
    ]
  },
  {
    id: "trigger",
    num: "03",
    title: "Trigger",
    cards: [
      {
        title: "Grundgerüst",
        code: `CREATE TRIGGER name
AFTER INSERT ON Tabelle
FOR EACH ROW
WHEN NEW.Spalte < 20
BEGIN
  UPDATE Tabelle SET Spalte = 20 WHERE id = NEW.id;
END;`,
        note: "<code>NEW</code> bezieht sich auf die neu eingefügte/geänderte Zeile, <code>OLD</code> auf den Zustand vor der Änderung (bei UPDATE/DELETE verfügbar)."
      },
      {
        title: "BEFORE vs. AFTER, Auslöser",
        order: ["BEFORE INSERT/UPDATE/DELETE", "AFTER INSERT/UPDATE/DELETE", "FOR EACH ROW (Standard, pro betroffener Zeile)", "WHEN (optionale Bedingung)"],
        note: "BEFORE-Trigger können Werte vor dem Schreiben noch validieren/verändern, AFTER-Trigger reagieren auf einen bereits abgeschlossenen Schreibvorgang (z. B. um eine andere Tabelle nachzuziehen)."
      }
    ]
  },
  {
    id: "jdbc",
    num: "04",
    title: "Stored Procedure &amp; JDBC",
    cards: [
      {
        title: "Typischer JDBC-Ablauf",
        order: [
          "Treiber laden / Verbindung aufbauen: DriverManager.getConnection(url, user, passwort)",
          "(Prepared/Callable)Statement erstellen",
          "SQL ausführen: executeQuery() / executeUpdate()",
          "ResultSet verarbeiten (bei SELECT)",
          "Verbindung schließen (idealerweise try-with-resources)"
        ]
      },
      {
        title: "Statement vs. PreparedStatement",
        code: `// Anfällig für SQL-Injection - Werte landen direkt im SQL-Text
Statement stmt = con.createStatement();
stmt.executeQuery("SELECT * FROM Kunde WHERE Name = '" + eingabe + "'");

// Sicher - Platzhalter werden typsicher gebunden
PreparedStatement ps = con.prepareStatement(
  "SELECT * FROM Kunde WHERE Name = ?");
ps.setString(1, eingabe);
ps.executeQuery();`,
        note: "Nutzereingaben gehören nie direkt in einen SQL-String - immer PreparedStatement mit Platzhaltern (<code>?</code>) verwenden."
      },
      {
        title: "Stored Procedure aufrufen (CallableStatement)",
        code: `CallableStatement cs = con.prepareCall("{call meineProzedur(?, ?)}");
cs.setInt(1, 42);
cs.registerOutParameter(2, Types.VARCHAR);
cs.execute();
String ergebnis = cs.getString(2);`,
        note: "Eine Stored Procedure wird explizit aufgerufen (im Gegensatz zum Trigger, der implizit durch ein Datenbank-Ereignis ausgelöst wird)."
      }
    ]
  }
];

const REFERENCE_NORMALISIERUNG = [
  {
    id: "fds",
    num: "01",
    title: "Funktionale Abh&auml;ngigkeiten",
    cards: [
      {
        title: "Notation &amp; Bedeutung",
        code: `X → Y
"X bestimmt Y funktional"
"Zu jedem X-Wert gehört genau ein Y-Wert"`,
        note: "Beispiel: <code>PersonenID → Nachname</code> bedeutet, dass jede PersonenID zu genau einem Nachnamen gehört (eine Person hat nur einen Nachnamen)."
      },
      {
        title: "Volle, partielle &amp; transitive Abh&auml;ngigkeit",
        order: [
          "Volle Abhängigkeit: Y hängt vom gesamten Schlüssel ab, nicht von einem Teil davon",
          "Partielle Abhängigkeit: Y hängt nur von einem echten Teil eines zusammengesetzten Schlüssels ab (2NF-Verletzung)",
          "Transitive Abhängigkeit: X → Z über einen Umweg X → Y → Z, wobei Y kein Schlüssel ist (3NF-Verletzung)"
        ]
      }
    ]
  },
  {
    id: "schluessel",
    num: "02",
    title: "Schl&uuml;sselkandidaten bestimmen",
    cards: [
      {
        title: "Attributabschluss (Closure)",
        code: `X+ = X
solange sich X+ ändert:
  für jede FD A → B:
    wenn A ⊆ X+: X+ = X+ ∪ B`,
        note: "Der Abschluss X+ einer Attributmenge X ist die Menge aller Attribute, die man aus X mithilfe der gegebenen FDs herleiten kann. Ist X+ = alle Attribute, ist X ein Superschlüssel."
      },
      {
        title: "Schlüsselkandidat = minimaler Superschlüssel",
        note: "X ist Schlüsselkandidat, wenn X+ alle Attribute enthält, aber keine echte Teilmenge von X das auch schafft. In der Klausur: Attribute, die auf keiner rechten Seite einer FD stehen, müssen zwingend Teil <strong>jedes</strong> Schlüsselkandidaten sein - guter Startpunkt für den Abschluss-Test."
      }
    ]
  },
  {
    id: "normalformen",
    num: "03",
    title: "Normalformen",
    cards: [
      {
        title: "1NF, 2NF, 3NF, BCNF",
        order: [
          "1NF: nur atomare Werte, keine Wiederholungsgruppen",
          "2NF: 1NF, und kein Nicht-Schlüsselattribut hängt nur von einem Teil eines zusammengesetzten Schlüssels ab",
          "3NF: 2NF, und kein Nicht-Schlüsselattribut hängt transitiv von einem Schlüssel ab (Ausnahme: das Attribut ist selbst prim, also Teil irgendeines Schlüsselkandidaten)",
          "BCNF: für jede nichttriviale FD X → Y muss X ein Superschlüssel sein - keine Ausnahme für prime Attribute"
        ],
        note: "BCNF ist strenger als 3NF: eine Tabelle kann in 3NF sein, aber nicht in BCNF, wenn eine FD mit einem Nicht-Superschlüssel auf der linken Seite existiert, deren rechte Seite nur prime Attribute enthält."
      }
    ]
  },
  {
    id: "zerlegung",
    num: "04",
    title: "Verlustfreier Join &amp; Abh&auml;ngigkeitserhaltung",
    cards: [
      {
        title: "Verlustfreier Join (Lossless Join)",
        note: "Eine Zerlegung ist verlustfrei, wenn der JOIN der Teiltabellen wieder exakt die Ursprungstabelle ergibt - keine Zeilen mehr, keine weniger. Eine hinreichende Bedingung: bei jedem Zerlegungsschritt X → Y bleibt X (die linke Seite) in beiden entstehenden Tabellen erhalten."
      },
      {
        title: "Abh&auml;ngigkeitserhaltung",
        note: "Eine Zerlegung ist abhängigkeitserhaltend, wenn sich jede ursprüngliche FD weiterhin prüfen lässt, ohne die Tabellen erst wieder zusammenzujoinen. Bei der Zerlegung nach BCNF kann das verloren gehen (klassisches Beispiel: {Student,Kurs} → Dozentin, siehe Kurswahl-Aufgabe) - das ist der bekannte Zielkonflikt 3NF (immer abhängigkeitserhaltend erreichbar) vs. BCNF (nicht immer)."
      }
    ]
  }
];
