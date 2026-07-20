/* ==========================================================================
   SQL-PRAXIS EXERCISES
   DDL, DML und Trigger sind echt gegen sql.js ausfuehrbare Aufgaben.
   Stored Procedure/JDBC sind Verstaendnisfragen (Multiple-Choice), da SQLite
   keine echten Stored Procedures kennt und JDBC eine Java-API ist, die im
   Browser nicht laeuft.

   Jede SQL-Aufgabe (category ddl/dml/trigger) laeuft gegen eine FRISCHE,
   nicht zwischengespeicherte sql.js-Instanz, die aus dbId neu aufgesetzt
   wird - Mutationen (ALTER/INSERT/CREATE TRIGGER ...) duerfen nicht in die
   naechste Aufgabe durchsickern.

   checkType:
     "select"   (default) - postAction (optional) laeuft, dann verify-SELECT.
                 Ergebnis wird mit dem Ergebnis von solution+postAction+verify
                 auf einer zweiten frischen Instanz verglichen (rowsMatchAsSet).
                 postAction darf dabei einen Fehler werfen (z.B. RAISE(ABORT,...)
                 in einem ablehnenden BEFORE-Trigger) - das wird nicht als
                 Nutzerfehler behandelt, verify entscheidet trotzdem ueber richtig/falsch.
     "throws"   - testSql muss nach dem User-SQL einen Fehler werfen (z.B.
                 UNIQUE-Constraint-Verletzung).
     "succeeds" - testSql darf nach dem User-SQL KEINEN Fehler werfen.

   Aufgaben koennen entweder dbId (Datenbank aus dem globalen DATABASES-
   Katalog, siehe databases.js) ODER customSchema (ein eigenstaendiges Schema
   nur fuer SQL-Praxis-Aufgaben, taucht nicht im Datenbanken-Picker auf) nutzen.
   ========================================================================== */

// Eigenes Uebungsschema fuer Trigger-Aufgaben rund um Rechnungen/Positionen -
// bewusst NICHT im globalen DATABASES-Katalog, da es keine eigene
// SELECT-Uebungsseite braucht.
const RECHNUNG_SCHEMA = {
  name: "Rechnungswesen (Übungsschema)",
  schema: {
    Produkt: [["ProdNr", "INT", "pk"], ["ProdName", "TEXT"], ["ProdPreis", "REAL"], ["Lagerbestand", "INT"]],
    Mitarbeiter: [["MitarbeiterNr", "INT", "pk"], ["Name", "TEXT"], ["Gehalt", "REAL"], ["VorgesetzterNr", "INT", "fk"], ["AbteilungNr", "INT"]],
    Rechnung: [["RNr", "INT", "pk"], ["Datum", "TEXT"], ["GesPreis", "REAL"]],
    Position: [["RNr", "INT", "pk/fk"], ["PositionsNr", "INT", "pk"], ["ProdNr", "INT", "fk"], ["Anzahl", "INT"]]
  },
  sql: `
    CREATE TABLE Produkt (ProdNr INTEGER PRIMARY KEY, ProdName TEXT, ProdPreis REAL, Lagerbestand INTEGER);
    CREATE TABLE Mitarbeiter (
      MitarbeiterNr INTEGER PRIMARY KEY, Name TEXT, Gehalt REAL, VorgesetzterNr INTEGER, AbteilungNr INTEGER,
      FOREIGN KEY (VorgesetzterNr) REFERENCES Mitarbeiter(MitarbeiterNr)
    );
    CREATE TABLE Rechnung (RNr INTEGER PRIMARY KEY, Datum TEXT, GesPreis REAL);
    CREATE TABLE Position (
      RNr INTEGER, PositionsNr INTEGER, ProdNr INTEGER, Anzahl INTEGER,
      PRIMARY KEY (RNr, PositionsNr),
      FOREIGN KEY (RNr) REFERENCES Rechnung(RNr),
      FOREIGN KEY (ProdNr) REFERENCES Produkt(ProdNr)
    );

    INSERT INTO Produkt VALUES (1,'Kaffeetasse',8,50), (2,'Teekanne',25,30), (3,'Untertasse',4,5);
    INSERT INTO Mitarbeiter VALUES (1,'Anna Chef',8000,NULL,10), (2,'Bernd Team',5000,1,10);
    INSERT INTO Rechnung VALUES (1,'2026-01-10',16);
    INSERT INTO Position VALUES (1,1,1,2);
  `
};

const SQL_PRAXIS_EXERCISES = [

  /* ------------------------------------------------------------ DDL */
  {
    id: "ddl1",
    category: "ddl",
    level: 1,
    dbId: "firma",
    title: "Spalte hinzufügen",
    question: "Füge der Tabelle Mitarbeiter eine neue Spalte 'Email' vom Typ TEXT hinzu.",
    hint: "ALTER TABLE ... ADD COLUMN ...",
    solution: "ALTER TABLE Mitarbeiter ADD COLUMN Email TEXT;",
    checkType: "select",
    verify: "SELECT name, type FROM pragma_table_info('Mitarbeiter');"
  },
  {
    id: "ddl2",
    category: "ddl",
    level: 2,
    dbId: "krankenhaus",
    title: "Neue Tabelle anlegen",
    question: "Erstelle eine neue Tabelle 'Zimmer' mit den Spalten ZimmerNr (INTEGER, Primärschlüssel), Station (TEXT) und Betten (INTEGER).",
    hint: "CREATE TABLE Zimmer (ZimmerNr INTEGER PRIMARY KEY, Station TEXT, Betten INTEGER);",
    solution: "CREATE TABLE Zimmer (ZimmerNr INTEGER PRIMARY KEY, Station TEXT, Betten INTEGER);",
    checkType: "select",
    verify: "SELECT name, type, pk FROM pragma_table_info('Zimmer');"
  },
  {
    id: "ddl3",
    category: "ddl",
    level: 3,
    dbId: "firma",
    title: "Eindeutigkeit erzwingen",
    question: "In SQLite kann man eine UNIQUE-Regel nachträglich nicht per ALTER TABLE hinzufügen, sondern nur über einen UNIQUE-Index. Erstelle einen UNIQUE-Index, der doppelte Abteilungsnamen in der Tabelle Abteilung verhindert.",
    hint: "CREATE UNIQUE INDEX irgendeinname ON Abteilung(Name);",
    solution: "CREATE UNIQUE INDEX idx_abteilung_name ON Abteilung(Name);",
    checkType: "throws",
    testSql: "INSERT INTO Abteilung (AbteilungNr, Name, Standort) VALUES (99, 'Vertrieb', 'Testort');",
    testExplainOk: "✓ Der doppelte Abteilungsname wurde korrekt abgelehnt.",
    testExplainFail: "✗ Ein zweiter Eintrag mit Name 'Vertrieb' wurde noch akzeptiert - der UNIQUE-Index fehlt oder wirkt nicht auf die richtige Spalte."
  },

  /* ------------------------------------------------------------ DML */
  {
    id: "dml1",
    category: "dml",
    level: 1,
    dbId: "firma",
    title: "Zeile einfügen",
    question: "Füge einen neuen Mitarbeiter ein: MitarbeiterNr 11, Nachname 'Keller', Vorname 'Julia', AbteilungNr 2, Gehalt 58000, Eintrittsdatum '2026-05-01', kein Vorgesetzter.",
    hint: "INSERT INTO Mitarbeiter VALUES (11,'Keller','Julia',2,58000,'2026-05-01',NULL);",
    solution: "INSERT INTO Mitarbeiter VALUES (11,'Keller','Julia',2,58000,'2026-05-01',NULL);",
    checkType: "select",
    verify: "SELECT * FROM Mitarbeiter WHERE MitarbeiterNr = 11;"
  },
  {
    id: "dml2",
    category: "dml",
    level: 2,
    dbId: "krankenhaus",
    title: "Werte aktualisieren",
    question: "Erhöhe die Kosten aller Behandlungen von Dr. Schaefer (ArztNr 1) um 10 Prozent.",
    hint: "UPDATE Behandlung SET Kosten = Kosten * 1.1 WHERE ArztNr = 1;",
    solution: "UPDATE Behandlung SET Kosten = Kosten * 1.1 WHERE ArztNr = 1;",
    checkType: "select",
    verify: "SELECT BehandlungNr, ROUND(Kosten,2) AS Kosten FROM Behandlung WHERE ArztNr = 1;"
  },
  {
    id: "dml3",
    category: "dml",
    level: 2,
    dbId: "krankenhaus",
    title: "Zeilen löschen",
    question: "Lösche alle Behandlungen mit Kosten unter 50 (also Kosten < 50, nicht = 50).",
    hint: "DELETE FROM Behandlung WHERE Kosten < 50;",
    solution: "DELETE FROM Behandlung WHERE Kosten < 50;",
    checkType: "select",
    verify: "SELECT BehandlungNr FROM Behandlung;"
  },

  /* ------------------------------------------------------------ TRIGGER */
  {
    id: "trig1",
    category: "trigger",
    level: 2,
    dbId: "krankenhaus",
    title: "Mindestgebühr per Trigger",
    question: "Erstelle einen Trigger, der nach jedem INSERT in Behandlung die Kosten automatisch auf mindestens 20 anhebt, falls sie niedriger eingetragen wurden.",
    hint: "AFTER INSERT ... FOR EACH ROW WHEN NEW.Kosten < 20 BEGIN UPDATE Behandlung SET Kosten = 20 WHERE BehandlungNr = NEW.BehandlungNr; END;",
    solution: `CREATE TRIGGER mindestgebuehr
AFTER INSERT ON Behandlung
FOR EACH ROW
WHEN NEW.Kosten < 20
BEGIN
  UPDATE Behandlung SET Kosten = 20 WHERE BehandlungNr = NEW.BehandlungNr;
END;`,
    checkType: "select",
    postAction: "INSERT INTO Behandlung VALUES (14,1,1,'2026-04-01','Kontrolle',10.00);",
    verify: "SELECT Kosten FROM Behandlung WHERE BehandlungNr = 14;"
  },
  {
    id: "trig2",
    category: "trigger",
    level: 3,
    dbId: "firma",
    title: "Gehaltsdeckel per Trigger",
    question: "Erstelle einen Trigger, der beim Einfügen eines neuen Mitarbeiters dessen Gehalt automatisch auf das Gehalt des direkten Vorgesetzten deckelt, falls es höher wäre (nur wenn ein Vorgesetzter existiert).",
    hint: "AFTER INSERT ... FOR EACH ROW WHEN NEW.VorgesetzterNr IS NOT NULL AND NEW.Gehalt > (SELECT Gehalt FROM Mitarbeiter WHERE MitarbeiterNr = NEW.VorgesetzterNr) BEGIN UPDATE ... END;",
    solution: `CREATE TRIGGER gehaltsdeckel
AFTER INSERT ON Mitarbeiter
FOR EACH ROW
WHEN NEW.VorgesetzterNr IS NOT NULL
  AND NEW.Gehalt > (SELECT Gehalt FROM Mitarbeiter WHERE MitarbeiterNr = NEW.VorgesetzterNr)
BEGIN
  UPDATE Mitarbeiter
  SET Gehalt = (SELECT Gehalt FROM Mitarbeiter WHERE MitarbeiterNr = NEW.VorgesetzterNr)
  WHERE MitarbeiterNr = NEW.MitarbeiterNr;
END;`,
    checkType: "select",
    postAction: "INSERT INTO Mitarbeiter VALUES (11,'Stark','Ida',2,150000,'2026-05-01',1);",
    verify: "SELECT Gehalt FROM Mitarbeiter WHERE MitarbeiterNr = 11;"
  },
  {
    id: "trig3",
    category: "trigger",
    level: 1,
    customSchema: RECHNUNG_SCHEMA,
    title: "Mindestpreis per Trigger",
    question: "Erstelle einen Trigger, der beim Einfügen eines neuen Produkts dafür sorgt, dass ProdPreis mindestens 5 beträgt. Ist der eingefügte Preis niedriger, soll er auf 5 korrigiert werden.",
    hint: "SQLite kann NEW-Werte in einem BEFORE-Trigger nicht direkt verändern (anders als Postgres). Nutze stattdessen AFTER INSERT mit einer WHEN-Bedingung und einem UPDATE auf die neue Zeile.",
    solution: `CREATE TRIGGER preis_mindestwert
AFTER INSERT ON Produkt
FOR EACH ROW
WHEN NEW.ProdPreis < 5
BEGIN
  UPDATE Produkt SET ProdPreis = 5 WHERE ProdNr = NEW.ProdNr;
END;`,
    checkType: "select",
    postAction: "INSERT INTO Produkt (ProdNr, ProdName, ProdPreis, Lagerbestand) VALUES (99, 'Testprodukt', 2, 100);",
    verify: "SELECT ProdPreis FROM Produkt WHERE ProdNr = 99;"
  },
  {
    id: "trig4",
    category: "trigger",
    level: 2,
    customSchema: RECHNUNG_SCHEMA,
    title: "Rechnungssumme bei neuer Position",
    question: "Erstelle einen Trigger, der beim Einfügen einer neuen Position automatisch GesPreis der zugehörigen Rechnung um (ProdPreis * Anzahl) erhöht.",
    hint: "AFTER INSERT ON Position. Der Produktpreis kommt per Subquery aus Produkt, da SQLite kein SELECT ... INTO in Triggern kennt.",
    solution: `CREATE TRIGGER position_erhoeht_gespreis
AFTER INSERT ON Position
FOR EACH ROW
BEGIN
  UPDATE Rechnung
  SET GesPreis = GesPreis + (SELECT ProdPreis FROM Produkt WHERE ProdNr = NEW.ProdNr) * NEW.Anzahl
  WHERE RNr = NEW.RNr;
END;`,
    checkType: "select",
    postAction: "INSERT INTO Position (RNr, PositionsNr, ProdNr, Anzahl) VALUES (1, 2, 2, 1);",
    verify: "SELECT GesPreis FROM Rechnung WHERE RNr = 1;"
  },
  {
    id: "trig5",
    category: "trigger",
    level: 2,
    customSchema: RECHNUNG_SCHEMA,
    title: "Rechnungssumme bei gelöschter Position",
    question: "Erstelle einen Trigger, der beim Löschen einer Position GesPreis der zugehörigen Rechnung wieder verringert (Umkehrung der vorherigen Aufgabe).",
    hint: "AFTER DELETE ON Position. In DELETE-Triggern gibt es nur OLD, kein NEW.",
    solution: `CREATE TRIGGER position_verringert_gespreis
AFTER DELETE ON Position
FOR EACH ROW
BEGIN
  UPDATE Rechnung
  SET GesPreis = GesPreis - (SELECT ProdPreis FROM Produkt WHERE ProdNr = OLD.ProdNr) * OLD.Anzahl
  WHERE RNr = OLD.RNr;
END;`,
    checkType: "select",
    postAction: "DELETE FROM Position WHERE RNr = 1 AND PositionsNr = 1;",
    verify: "SELECT GesPreis FROM Rechnung WHERE RNr = 1;"
  },
  {
    id: "trig6",
    category: "trigger",
    level: 3,
    customSchema: RECHNUNG_SCHEMA,
    title: "Rechnungssumme bei geänderter Anzahl",
    question: "Erstelle einen Trigger, der beim Ändern (UPDATE) der Anzahl in einer Position GesPreis um die Differenz zwischen neuer und alter Anzahl anpasst.",
    hint: "AFTER UPDATE OF Anzahl ON Position. Hier stehen sowohl OLD als auch NEW zur Verfügung.",
    solution: `CREATE TRIGGER position_update_gespreis
AFTER UPDATE OF Anzahl ON Position
FOR EACH ROW
BEGIN
  UPDATE Rechnung
  SET GesPreis = GesPreis + (SELECT ProdPreis FROM Produkt WHERE ProdNr = NEW.ProdNr) * (NEW.Anzahl - OLD.Anzahl)
  WHERE RNr = NEW.RNr;
END;`,
    checkType: "select",
    postAction: "UPDATE Position SET Anzahl = 5 WHERE RNr = 1 AND PositionsNr = 1;",
    verify: "SELECT GesPreis FROM Rechnung WHERE RNr = 1;"
  },
  {
    id: "trig7",
    category: "trigger",
    level: 3,
    customSchema: RECHNUNG_SCHEMA,
    title: "Gehaltsdeckel (Rechnungswesen)",
    question: "Erstelle einen Trigger, der beim Einfügen eines neuen Mitarbeiters dessen Gehalt automatisch auf das Gehalt des direkten Vorgesetzten deckelt, falls es höher wäre (nur wenn ein Vorgesetzter existiert).",
    hint: "AFTER INSERT ON Mitarbeiter, WHEN NEW.VorgesetzterNr IS NOT NULL AND NEW.Gehalt > (Gehalt des Vorgesetzten).",
    solution: `CREATE TRIGGER gehaltsdeckel_rechnungswesen
AFTER INSERT ON Mitarbeiter
FOR EACH ROW
WHEN NEW.VorgesetzterNr IS NOT NULL
  AND NEW.Gehalt > (SELECT Gehalt FROM Mitarbeiter WHERE MitarbeiterNr = NEW.VorgesetzterNr)
BEGIN
  UPDATE Mitarbeiter
  SET Gehalt = (SELECT Gehalt FROM Mitarbeiter WHERE MitarbeiterNr = NEW.VorgesetzterNr)
  WHERE MitarbeiterNr = NEW.MitarbeiterNr;
END;`,
    checkType: "select",
    postAction: "INSERT INTO Mitarbeiter (MitarbeiterNr, Name, Gehalt, VorgesetzterNr, AbteilungNr) VALUES (99, 'Test Mitarbeiter', 9000, 1, 10);",
    verify: "SELECT Gehalt FROM Mitarbeiter WHERE MitarbeiterNr = 99;"
  },
  {
    id: "trig8",
    category: "trigger",
    level: 3,
    customSchema: RECHNUNG_SCHEMA,
    title: "Lagerbestand-Prüfung per Trigger",
    question: "Erstelle einen Trigger, der das Einfügen einer Position verhindert, wenn die bestellte Anzahl größer als der Lagerbestand des Produkts ist.",
    hint: "BEFORE INSERT ON Position - hier musst du nichts an NEW ändern, sondern nur ablehnen. In SQLite mit SELECT RAISE(ABORT, 'Nachricht') innerhalb des Trigger-Bodies (SQLite-Äquivalent zu RAISE EXCEPTION in Postgres).",
    solution: `CREATE TRIGGER lagerbestand_pruefung
BEFORE INSERT ON Position
FOR EACH ROW
WHEN NEW.Anzahl > (SELECT Lagerbestand FROM Produkt WHERE ProdNr = NEW.ProdNr)
BEGIN
  SELECT RAISE(ABORT, 'Nicht genug Lagerbestand');
END;`,
    checkType: "select",
    postAction: "INSERT INTO Position (RNr, PositionsNr, ProdNr, Anzahl) VALUES (1, 2, 3, 10);",
    verify: "SELECT COUNT(*) AS AnzahlZeilen FROM Position WHERE RNr = 1 AND PositionsNr = 2;"
  },

  /* ------------------------------------------------------------ CONCEPT (Stored Procedure / JDBC) */
  {
    id: "concept1",
    category: "concept",
    level: 1,
    title: "JDBC-Verbindung aufbauen",
    question: "Welche JDBC-Methode stellt die Verbindung zu einer Datenbank her?",
    options: [
      "DriverManager.getConnection(url, user, passwort)",
      "Connection.create(url)",
      "Statement.connect(url)",
      "ResultSet.open(url)"
    ],
    correctIndex: 0,
    explanation: "DriverManager.getConnection(...) liefert ein Connection-Objekt, über das anschließend Statements erstellt werden."
  },
  {
    id: "concept2",
    category: "concept",
    level: 1,
    title: "SQL-Injection vermeiden",
    question: "Welches JDBC-Objekt verhindert SQL-Injection bei Nutzereingaben, indem Werte als Platzhalter (?) statt als Textbausteine eingesetzt werden?",
    options: [
      "Statement",
      "PreparedStatement",
      "ResultSet",
      "DriverManager"
    ],
    correctIndex: 1,
    explanation: "PreparedStatement trennt SQL-Struktur und Werte strikt: Platzhalter (?) werden typsicher gebunden, Nutzereingaben können den SQL-Text nicht verändern."
  },
  {
    id: "concept3",
    category: "concept",
    level: 2,
    title: "Stored Procedure aufrufen",
    question: "Wie ruft man in JDBC eine gespeicherte Prozedur (Stored Procedure) auf?",
    options: [
      "Über ein CallableStatement mit der Syntax { call prozedurname(?, ?) }",
      "Über ein normales Statement mit SELECT prozedurname()",
      "Gar nicht, JDBC unterstützt keine Stored Procedures",
      "Über DriverManager.callProcedure(...)"
    ],
    correctIndex: 0,
    explanation: "CallableStatement ist speziell für den Aufruf gespeicherter Prozeduren/Funktionen gedacht, inklusive IN-, OUT- und INOUT-Parametern."
  },
  {
    id: "concept4",
    category: "concept",
    level: 2,
    title: "Trigger vs. Stored Procedure",
    question: "Was ist der Hauptunterschied zwischen einem Trigger und einer Stored Procedure?",
    options: [
      "Ein Trigger wird automatisch durch ein Datenbank-Ereignis (INSERT/UPDATE/DELETE) ausgelöst, eine Stored Procedure wird explizit aufgerufen",
      "Eine Stored Procedure kann keine Parameter haben, ein Trigger schon",
      "Trigger und Stored Procedure sind exakt dasselbe, nur anders benannt",
      "Ein Trigger läuft auf dem Client, eine Stored Procedure auf dem Server"
    ],
    correctIndex: 0,
    explanation: "Trigger reagieren implizit auf Datenänderungen an einer Tabelle. Stored Procedures müssen aktiv aufgerufen werden (z.B. per CALL oder CallableStatement)."
  },
  {
    id: "concept5",
    category: "concept",
    level: 2,
    title: "Typischer JDBC-Ablauf",
    question: "In welcher Reihenfolge läuft ein typischer JDBC-Zugriff ab?",
    options: [
      "Verbindung aufbauen → Statement erstellen → SQL ausführen → ResultSet verarbeiten → Verbindung schließen",
      "ResultSet erstellen → Verbindung aufbauen → SQL ausführen",
      "SQL ausführen → Verbindung schließen → Statement erstellen",
      "Verbindung schließen → SQL ausführen → Verbindung aufbauen"
    ],
    correctIndex: 0,
    explanation: "Erst die Verbindung, dann ein (Prepared/Callable)Statement, dann ausführen und das Ergebnis lesen, am Ende immer die Verbindung schließen (idealerweise mit try-with-resources)."
  }
];
