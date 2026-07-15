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
     "throws"   - testSql muss nach dem User-SQL einen Fehler werfen (z.B.
                 UNIQUE-Constraint-Verletzung).
     "succeeds" - testSql darf nach dem User-SQL KEINEN Fehler werfen.
   ========================================================================== */

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
