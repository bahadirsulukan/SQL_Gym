/* ==========================================================================
   DATABASES
   Each entry provides:
   - id, name, icon, description, tags
   - sql: full CREATE TABLE + INSERT script (SQLite dialect, run via sql.js)
   - schema: display metadata for the schema view (table -> columns)
   ========================================================================== */

const DATABASES = [
  // -------------------------------------------------------------- CIA FACTBOOK
  {
    id: "cia",
    name: "CIA World Factbook",
    icon: "&#127760;",
    description: "Laender, Regionen, Flaeche, Einwohner, BIP. Ideal fuer GROUP BY, HAVING und Aggregatfunktionen.",
    tags: ["GROUP BY", "HAVING", "Aggregat"],
    level: 1,
    schema: {
      cia: [["Name","TEXT","pk"],["Region","TEXT"],["Flaeche","INT"],["Einwohner","INT"],["BIP","INT"]]
    },
    sql: `
      CREATE TABLE cia (
        Name TEXT PRIMARY KEY, Region TEXT, Flaeche INTEGER, Einwohner INTEGER, BIP INTEGER
      );
      INSERT INTO cia VALUES
        ('Afghanistan','Asien',652000,25838797,21000000000),
        ('Albanien','Europa',28748,3490435,5600000000),
        ('Algerien','Afrika',2381740,31193917,147600000000),
        ('Andorra','Europa',468,66824,1200000000),
        ('Angola','Afrika',1246700,10145267,11600000000),
        ('Argentinien','Suedamerika',2766890,36955182,367000000000),
        ('Armenien','Osteuropa',29800,3344336,9900000000),
        ('Australien','Ozeanien',7686850,19169083,416200000000),
        ('Oesterreich','Europa',83858,8131111,190600000000),
        ('Azerbaidschan','Osteuropa',86600,7748163,14000000000),
        ('Bahamas','Mittelamerika',13940,294982,5580000000),
        ('Bahrain','Mittlerer Osten',620,634137,8600000000),
        ('Bangladesch','Asien',144000,129194224,187000000000),
        ('Belgien','Europa',30528,10241506,232700000000),
        ('Brasilien','Suedamerika',8511965,172860370,1340000000000),
        ('Kanada','Nordamerika',9976140,31281092,722300000000),
        ('Chile','Suedamerika',756950,15328467,153700000000),
        ('China','Asien',9596960,1261832482,4800000000000),
        ('Daenemark','Europa',43094,5336745,140100000000),
        ('Aegypten','Afrika',1001450,68359979,200400000000),
        ('Finnland','Europa',337030,5167486,121400000000),
        ('Frankreich','Europa',547030,59329691,1373000000000),
        ('Deutschland','Europa',357021,82797408,1866000000000),
        ('Griechenland','Europa',131940,10601527,168800000000),
        ('Indien','Asien',3287590,1013661800,1176000000000),
        ('Indonesien','Suedostasien',1919440,224784210,610000000000),
        ('Iran','Mittlerer Osten',1648000,65619636,367000000000),
        ('Irland','Europa',70280,3797257,80700000000),
        ('Israel','Mittlerer Osten',20770,5842454,110100000000),
        ('Italien','Europa',301230,57634327,1273000000000),
        ('Japan','Asien',377835,126549976,3151000000000),
        ('Mexiko','Mittelamerika',1972550,100294036,864200000000),
        ('Niederlande','Europa',41526,15892237,373200000000),
        ('Neuseeland','Ozeanien',268680,3819762,64300000000),
        ('Norwegen','Europa',324220,4481162,136500000000),
        ('Polen','Europa',312685,38646023,349900000000),
        ('Portugal','Europa',92391,10008806,153700000000),
        ('Russland','Osteuropa',17075200,146001176,1120000000000),
        ('Suedafrika','Afrika',1219912,44000000,330100000000),
        ('Spanien','Europa',504782,40037995,754400000000),
        ('Schweden','Europa',449964,8875053,225600000000),
        ('Schweiz','Europa',41290,7301994,240800000000),
        ('Tuerkei','Osteuropa',780580,65666677,468100000000),
        ('Vereinigtes Koenigreich','Europa',244820,59511464,1442400000000),
        ('USA','Nordamerika',9629091,281421906,9963000000000);
    `
  },

  // -------------------------------------------------------------------- F1 WM
  {
    id: "f1",
    name: "Formel 1 WM-Titel",
    icon: "&#127937;",
    description: "Fahrer- und Konstrukteursweltmeister je Saison. Gut fuer JOINs, Subqueries und Ranglisten.",
    tags: ["ORDER BY", "Subquery", "Ranking"],
    level: 1,
    schema: {
      WMTitel: [["Saison","INT","pk"],["Fahrerweltmeister","TEXT"],["KonstrukteursWM","TEXT"],["WM_Punkte","INT"],["Team_Punkte","INT"]]
    },
    sql: `
      CREATE TABLE WMTitel (
        Saison INTEGER PRIMARY KEY, Fahrerweltmeister TEXT, KonstrukteursWM TEXT,
        WM_Punkte INTEGER, Team_Punkte INTEGER
      );
      INSERT INTO WMTitel VALUES
        (1991,'Ayrton Senna','McLaren-Honda',96,139),
        (1992,'Nigel Mansell','Williams-Renault',108,164),
        (1993,'Alain Prost','Williams-Renault',99,168),
        (1994,'Michael Schumacher','Williams-Renault',92,118),
        (1995,'Michael Schumacher','Benetton-Renault',102,137),
        (1996,'Damon Hill','Williams-Renault',97,175),
        (1997,'Jacques Villeneuve','Williams-Renault',81,123),
        (1998,'Mika Hakkinen','McLaren-Mercedes',100,156),
        (1999,'Mika Hakkinen','Ferrari',76,128),
        (2000,'Michael Schumacher','Ferrari',108,170),
        (2001,'Michael Schumacher','Ferrari',123,179),
        (2002,'Michael Schumacher','Ferrari',144,221),
        (2003,'Michael Schumacher','Ferrari',93,158),
        (2004,'Michael Schumacher','Ferrari',148,262),
        (2005,'Fernando Alonso','Renault',133,191),
        (2006,'Fernando Alonso','Renault',134,206),
        (2007,'Kimi Raikkonen','Ferrari',110,204),
        (2008,'Lewis Hamilton','Ferrari',98,172),
        (2009,'Jenson Button','Brawn-Mercedes',95,172),
        (2010,'Sebastian Vettel','Red Bull-Renault',256,498);
    `
  },

  // ------------------------------------------------------------------- SCHULE
  {
    id: "schule",
    name: "Schule",
    icon: "&#127891;",
    description: "Schueler, Kurse und Belegungen (n:m). Fokus auf INSERT/UPDATE/DELETE und die Verbindungstabelle.",
    tags: ["DML", "n:m", "PRIMARY KEY"],
    level: 1,
    schema: {
      schueler: [["SNr","INT","pk"],["Nachname","TEXT"],["Vorname","TEXT"],["Geburtsdatum","TEXT"],["Ort","TEXT"]],
      Kurs: [["KursNr","TEXT","pk"],["Fach","TEXT"],["Thema","TEXT"],["Art","TEXT"],["Halbjahr","TEXT"],["Stunden","INT"]],
      belegt: [["SNr","INT","pk/fk"],["KursNr","TEXT","pk/fk"],["Punkte","INT"]]
    },
    sql: `
      CREATE TABLE schueler (
        SNr INTEGER PRIMARY KEY, Nachname TEXT, Vorname TEXT, Geburtsdatum TEXT, Ort TEXT
      );
      CREATE TABLE Kurs (
        KursNr TEXT PRIMARY KEY, Fach TEXT, Thema TEXT, Art TEXT, Halbjahr TEXT, Stunden INTEGER
      );
      CREATE TABLE belegt (
        SNr INTEGER, KursNr TEXT, Punkte INTEGER,
        PRIMARY KEY (SNr, KursNr),
        FOREIGN KEY (SNr) REFERENCES schueler(SNr),
        FOREIGN KEY (KursNr) REFERENCES Kurs(KursNr)
      );

      INSERT INTO schueler VALUES
        (10001,'Yilmaz','Bahadir','2002-05-15','Darmstadt'),
        (10002,'Schmidt','Lena','2001-11-02','Frankfurt'),
        (10003,'Weber','Tim','2002-02-20','Darmstadt'),
        (10004,'Klein','Mara','2001-09-09','Griesheim'),
        (10005,'Hoffmann','Jonas','2002-07-30','Darmstadt');

      INSERT INTO Kurs VALUES
        ('MA-LK-1','MA','Analysis','LK','1. Halbjahr',5),
        ('MA-GK-1','MA','Stochastik','GK','1. Halbjahr',3),
        ('DE-LK-1','DE','Lyrik der Romantik','LK','1. Halbjahr',5),
        ('IF-GK-1','IF','Datenbanken','GK','1. Halbjahr',3),
        ('EN-GK-1','EN','Shakespeare','GK','1. Halbjahr',3);

      INSERT INTO belegt VALUES
        (10001,'MA-LK-1',13),
        (10001,'IF-GK-1',15),
        (10002,'MA-GK-1',9),
        (10002,'DE-LK-1',11),
        (10003,'IF-GK-1',14),
        (10003,'EN-GK-1',10),
        (10004,'MA-LK-1',8),
        (10004,'DE-LK-1',12),
        (10005,'IF-GK-1',13),
        (10005,'MA-GK-1',7);
    `
  },

  // -------------------------------------------------------------- BIBLIOTHEK
  {
    id: "bibliothek",
    name: "Bibliothek",
    icon: "&#128218;",
    description: "Autoren, Bücher, Mitglieder und Ausleihen. Fokus auf Datumsvergleiche und 'wer hat noch nie...'-Abfragen.",
    tags: ["JOIN", "Datum", "NOT EXISTS"],
    level: 2,
    schema: {
      Autor: [["AutorNr","INT","pk"],["Name","TEXT"],["Geburtsjahr","INT"]],
      Buch: [["ISBN","TEXT","pk"],["Titel","TEXT"],["AutorNr","INT","fk"],["Jahr","INT"],["Genre","TEXT"]],
      Mitglied: [["MitgliedNr","INT","pk"],["Name","TEXT"],["Ort","TEXT"]],
      Ausleihe: [["AusleiheNr","INT","pk"],["ISBN","TEXT","fk"],["MitgliedNr","INT","fk"],["Ausleihdatum","TEXT"],["Rueckgabedatum","TEXT"]]
    },
    sql: `
      CREATE TABLE Autor (AutorNr INTEGER PRIMARY KEY, Name TEXT, Geburtsjahr INTEGER);
      CREATE TABLE Buch (
        ISBN TEXT PRIMARY KEY, Titel TEXT, AutorNr INTEGER, Jahr INTEGER, Genre TEXT,
        FOREIGN KEY (AutorNr) REFERENCES Autor(AutorNr)
      );
      CREATE TABLE Mitglied (MitgliedNr INTEGER PRIMARY KEY, Name TEXT, Ort TEXT);
      CREATE TABLE Ausleihe (
        AusleiheNr INTEGER PRIMARY KEY, ISBN TEXT, MitgliedNr INTEGER,
        Ausleihdatum TEXT, Rueckgabedatum TEXT,
        FOREIGN KEY (ISBN) REFERENCES Buch(ISBN),
        FOREIGN KEY (MitgliedNr) REFERENCES Mitglied(MitgliedNr)
      );

      INSERT INTO Autor VALUES
        (1,'Franz Kafka',1883),
        (2,'Agatha Christie',1890),
        (3,'Isaac Asimov',1920),
        (4,'Astrid Lindgren',1907),
        (5,'Umberto Eco',1932);

      INSERT INTO Buch VALUES
        ('978-3-001','Der Prozess',1,1925,'Roman'),
        ('978-3-002','Das Schloss',1,1926,'Roman'),
        ('978-3-003','Mord im Orientexpress',2,1934,'Krimi'),
        ('978-3-004','Und dann gabs keines mehr',2,1939,'Krimi'),
        ('978-3-005','Foundation',3,1951,'Science-Fiction'),
        ('978-3-006','Ich, der Roboter',3,1950,'Science-Fiction'),
        ('978-3-007','Pippi Langstrumpf',4,1945,'Kinderbuch'),
        ('978-3-008','Der Name der Rose',5,1980,'Roman');

      INSERT INTO Mitglied VALUES
        (1,'Bahadir Yilmaz','Darmstadt'),
        (2,'Lena Schmidt','Frankfurt'),
        (3,'Tim Weber','Darmstadt'),
        (4,'Mara Klein','Griesheim'),
        (5,'Jonas Hoffmann','Darmstadt'),
        (6,'Nora Fischer','Frankfurt');

      INSERT INTO Ausleihe VALUES
        (1,'978-3-001',1,'2026-01-05','2026-01-19'),
        (2,'978-3-003',2,'2026-01-10',NULL),
        (3,'978-3-005',1,'2026-02-01','2026-02-15'),
        (4,'978-3-007',4,'2026-02-03','2026-02-17'),
        (5,'978-3-003',3,'2026-02-10',NULL),
        (6,'978-3-008',5,'2026-02-12','2026-03-01'),
        (7,'978-3-001',3,'2026-03-01',NULL),
        (8,'978-3-006',1,'2026-03-05','2026-03-19'),
        (9,'978-3-002',2,'2026-03-10',NULL);
    `
  },

  // ------------------------------------------------------------- KRANKENHAUS
  {
    id: "krankenhaus",
    name: "Krankenhaus",
    icon: "&#127973;",
    description: "Ärzte, Patienten und Behandlungen. Fokus auf Aggregation nach Fachbereich und 'wer wurde nie behandelt'.",
    tags: ["JOIN", "NOT IN", "Aggregat"],
    level: 2,
    schema: {
      Arzt: [["ArztNr","INT","pk"],["Name","TEXT"],["Fachbereich","TEXT"]],
      Patient: [["PatientNr","INT","pk"],["Name","TEXT"],["Geburtsdatum","TEXT"],["Ort","TEXT"]],
      Behandlung: [["BehandlungNr","INT","pk"],["PatientNr","INT","fk"],["ArztNr","INT","fk"],["Datum","TEXT"],["Diagnose","TEXT"],["Kosten","REAL"]]
    },
    sql: `
      CREATE TABLE Arzt (ArztNr INTEGER PRIMARY KEY, Name TEXT, Fachbereich TEXT);
      CREATE TABLE Patient (PatientNr INTEGER PRIMARY KEY, Name TEXT, Geburtsdatum TEXT, Ort TEXT);
      CREATE TABLE Behandlung (
        BehandlungNr INTEGER PRIMARY KEY, PatientNr INTEGER, ArztNr INTEGER,
        Datum TEXT, Diagnose TEXT, Kosten REAL,
        FOREIGN KEY (PatientNr) REFERENCES Patient(PatientNr),
        FOREIGN KEY (ArztNr) REFERENCES Arzt(ArztNr)
      );

      INSERT INTO Arzt VALUES
        (1,'Dr. Schaefer','Kardiologie'),
        (2,'Dr. Meier','Orthopaedie'),
        (3,'Dr. Winter','Kardiologie'),
        (4,'Dr. Braun','Allgemeinmedizin'),
        (5,'Dr. Lang','Orthopaedie');

      INSERT INTO Patient VALUES
        (1,'Herrmann Uwe','1975-03-12','Darmstadt'),
        (2,'Koch Petra','1988-07-22','Frankfurt'),
        (3,'Richter Max','1990-11-05','Darmstadt'),
        (4,'Wagner Sara','1965-01-30','Griesheim'),
        (5,'Schulz Ali','2000-09-18','Frankfurt'),
        (6,'Fischer Nora','1982-04-09','Darmstadt'),
        (7,'Krueger Ben','1995-12-25','Offenbach'),
        (8,'Lorenz Amy','1978-06-14','Darmstadt');

      INSERT INTO Behandlung VALUES
        (1,1,1,'2026-01-05','Bluthochdruck',150.00),
        (2,2,2,'2026-01-10','Kniebeschwerden',220.00),
        (3,1,3,'2026-02-01','Herzrhythmusstoerung',300.00),
        (4,3,4,'2026-02-05','Grippe',60.00),
        (5,4,1,'2026-02-10','Bluthochdruck',150.00),
        (6,5,2,'2026-02-15','Bandriss',450.00),
        (7,6,3,'2026-03-01','Herzinsuffizienz',380.00),
        (8,2,4,'2026-03-05','Erkaeltung',50.00),
        (9,7,5,'2026-03-10','Sehnenriss',500.00),
        (10,1,4,'2026-03-15','Kontrolle',40.00),
        (11,3,1,'2026-03-20','Bluthochdruck',150.00),
        (12,5,5,'2026-03-25','Knieschmerzen',220.00),
        (13,6,1,'2026-03-28','Nachsorge',40.00);
    `
  },

  // ------------------------------------------------------------------ NORDWIND
  {
    id: "nordwind",
    name: "Nordwind",
    icon: "&#128230;",
    description: "Auftragsverwaltung: Kunden, Artikel, Bestellungen, Versand. Der Klassiker für JOINs und Aggregation.",
    tags: ["JOIN", "GROUP BY", "Subquery"],
    level: 2,
    schema: {
      Lieferant: [["LieferantenNr","INT","pk"],["Firma","TEXT"],["Ort","TEXT"],["Land","TEXT"]],
      Kategorie: [["KategorieNr","INT","pk"],["Kategoriename","TEXT"],["Beschreibung","TEXT"]],
      Kunde: [["KundenCode","TEXT","pk"],["Firma","TEXT"],["Ort","TEXT"],["Land","TEXT"]],
      Personal: [["PersonalNr","INT","pk"],["Nachname","TEXT"],["Vorname","TEXT"]],
      Versandfirma: [["FirmenNr","INT","pk"],["Firma","TEXT"],["Telefon","TEXT"]],
      Artikel: [["ArtikelNr","INT","pk"],["Artikelname","TEXT"],["LieferantenNr","INT","fk"],["KategorieNr","INT","fk"],["Einzelpreis","REAL"],["Lagerbestand","INT"],["Mindestbestand","INT"],["Auslaufartikel","INT"]],
      Bestellung: [["BestellNr","INT","pk"],["KundenCode","TEXT","fk"],["PersonalNr","INT","fk"],["FirmenNr","INT","fk"],["Bestelldatum","TEXT"],["Lieferdatum","TEXT"],["Frachtkosten","REAL"]],
      Bestelldetails: [["BestellNr","INT","pk/fk"],["ArtikelNr","INT","pk/fk"],["Einzelpreis","REAL"],["Anzahl","INT"],["Rabatt","REAL"]]
    },
    sql: `
      CREATE TABLE Lieferant (LieferantenNr INTEGER PRIMARY KEY, Firma TEXT, Ort TEXT, Land TEXT);
      CREATE TABLE Kategorie (KategorieNr INTEGER PRIMARY KEY, Kategoriename TEXT, Beschreibung TEXT);
      CREATE TABLE Kunde (KundenCode TEXT PRIMARY KEY, Firma TEXT, Ort TEXT, Land TEXT);
      CREATE TABLE Personal (PersonalNr INTEGER PRIMARY KEY, Nachname TEXT, Vorname TEXT);
      CREATE TABLE Versandfirma (FirmenNr INTEGER PRIMARY KEY, Firma TEXT, Telefon TEXT);
      CREATE TABLE Artikel (
        ArtikelNr INTEGER PRIMARY KEY, Artikelname TEXT, LieferantenNr INTEGER, KategorieNr INTEGER,
        Einzelpreis REAL, Lagerbestand INTEGER, Mindestbestand INTEGER, Auslaufartikel INTEGER,
        FOREIGN KEY (LieferantenNr) REFERENCES Lieferant(LieferantenNr),
        FOREIGN KEY (KategorieNr) REFERENCES Kategorie(KategorieNr)
      );
      CREATE TABLE Bestellung (
        BestellNr INTEGER PRIMARY KEY, KundenCode TEXT, PersonalNr INTEGER, FirmenNr INTEGER,
        Bestelldatum TEXT, Lieferdatum TEXT, Frachtkosten REAL,
        FOREIGN KEY (KundenCode) REFERENCES Kunde(KundenCode),
        FOREIGN KEY (PersonalNr) REFERENCES Personal(PersonalNr),
        FOREIGN KEY (FirmenNr) REFERENCES Versandfirma(FirmenNr)
      );
      CREATE TABLE Bestelldetails (
        BestellNr INTEGER, ArtikelNr INTEGER, Einzelpreis REAL, Anzahl INTEGER, Rabatt REAL,
        PRIMARY KEY (BestellNr, ArtikelNr),
        FOREIGN KEY (BestellNr) REFERENCES Bestellung(BestellNr),
        FOREIGN KEY (ArtikelNr) REFERENCES Artikel(ArtikelNr)
      );

      INSERT INTO Lieferant VALUES
        (1,'Flattermann GmbH','Berlin','Deutschland'),
        (2,'Dragon.com','Shanghai','China'),
        (3,'KiteSports','Lyon','Frankreich'),
        (4,'Nordsee Feinkost','Hamburg','Deutschland');

      INSERT INTO Kategorie VALUES
        (1,'Getraenke','Erfrischungsgetraenke, Kaffee, Tee'),
        (2,'Gebaeck','Kekse, Kuchen, Brot'),
        (3,'Meeresfruechte','Fisch und Meeresfruechte'),
        (4,'Milchprodukte','Kaese und andere Milchprodukte');

      INSERT INTO Kunde VALUES
        ('ALFKI','Alfreds Futterkiste','Berlin','Deutschland'),
        ('ANATR','Ana Trujillo','Mexico City','Mexiko'),
        ('RATTC','Rattlesnake Canyon Grocery','Albuquerque','USA'),
        ('BLAUS','Blauer See Delikatessen','Mannheim','Deutschland'),
        ('WELLI','Wellington Importadora','Resende','Brasilien'),
        ('HANAR','Hanari Carnes','Rio de Janeiro','Brasilien'),
        ('CHOPS','Chop-suey Chinese','Bern','Schweiz'),
        ('SUPRD','Supremes delices','Charleroi','Belgien');

      INSERT INTO Personal VALUES
        (1,'Fuller','Andrew'),
        (2,'Davolio','Nancy'),
        (3,'Leverling','Janet'),
        (4,'Peacock','Margaret'),
        (5,'Buchanan','Steven'),
        (6,'Callahan','Laura');

      INSERT INTO Versandfirma VALUES
        (1,'Spedition Nord','030-1122334'),
        (2,'United Package','040-5566778'),
        (3,'Speedy Express','089-9988776');

      INSERT INTO Artikel VALUES
        (1,'Chai',1,1,18.00,39,10,0),
        (2,'Chang',1,1,19.00,17,25,0),
        (3,'Teatime Chocolate Biscuits',3,2,9.20,25,5,0),
        (4,'Aniseed Syrup',2,1,10.00,13,25,0),
        (5,'Boston Crab Meat',4,3,18.40,123,30,0),
        (6,'Camembert Pierrot',1,4,34.00,19,20,0),
        (7,'Rossle Sauerkraut',1,4,45.60,26,0,1),
        (8,'Konbu',2,3,6.00,24,5,0),
        (9,'Gorgonzola Telino',3,4,12.50,0,20,1);

      INSERT INTO Bestellung VALUES
        (10248,'ALFKI',5,3,'1996-07-04','1996-08-01',32.38),
        (10249,'ANATR',6,1,'1996-07-05','1996-08-16',11.61),
        (10250,'HANAR',4,2,'1996-07-08','1996-08-05',65.83),
        (10251,'RATTC',3,1,'1998-05-06','1998-06-03',41.34),
        (10252,'WELLI',4,2,'1997-01-10','1997-02-07',51.30),
        (10253,'HANAR',3,2,'1997-03-10','1997-03-24',58.17),
        (10254,'CHOPS',5,2,'1997-06-11','1997-07-08',22.98),
        (10255,'SUPRD',4,3,'1997-11-12','1997-12-09',148.33),
        (10256,'RATTC',3,2,'1998-05-06','1998-06-02',13.97),
        (10257,'BLAUS',4,3,'1996-07-16','1996-08-13',81.91);

      INSERT INTO Bestelldetails VALUES
        (10248,1,18.00,12,0.0),
        (10248,3,9.20,10,0.0),
        (10249,2,19.00,5,0.05),
        (10250,1,18.00,15,0.0),
        (10250,4,10.00,10,0.1),
        (10251,3,9.20,20,0.0),
        (10251,5,18.40,7,0.0),
        (10252,6,34.00,25,0.0),
        (10253,1,18.00,6,0.0),
        (10254,8,6.00,15,0.15),
        (10255,2,19.00,20,0.25),
        (10256,3,9.20,4,0.0),
        (10256,5,18.40,9,0.0),
        (10257,4,10.00,30,0.0);
    `
  },

  // -------------------------------------------------------------------- KINO
  {
    id: "kino",
    name: "Kino",
    icon: "&#127916;",
    description: "Filme, Vorstellungen, Säle und Tickets. Fokus auf Umsatzberechnungen und Auslastung über drei Tabellen.",
    tags: ["3-fach JOIN", "SUM", "Auslastung"],
    level: 2,
    schema: {
      Film: [["FilmNr","INT","pk"],["Titel","TEXT"],["Genre","TEXT"],["Laenge","INT"],["FSK","INT"]],
      Saal: [["SaalNr","INT","pk"],["Name","TEXT"],["Plaetze","INT"]],
      Vorstellung: [["VorstellungNr","INT","pk"],["FilmNr","INT","fk"],["SaalNr","INT","fk"],["Datum","TEXT"],["Uhrzeit","TEXT"]],
      Ticket: [["TicketNr","INT","pk"],["VorstellungNr","INT","fk"],["Preis","REAL"],["Sitzplatz","TEXT"]]
    },
    sql: `
      CREATE TABLE Film (FilmNr INTEGER PRIMARY KEY, Titel TEXT, Genre TEXT, Laenge INTEGER, FSK INTEGER);
      CREATE TABLE Saal (SaalNr INTEGER PRIMARY KEY, Name TEXT, Plaetze INTEGER);
      CREATE TABLE Vorstellung (
        VorstellungNr INTEGER PRIMARY KEY, FilmNr INTEGER, SaalNr INTEGER, Datum TEXT, Uhrzeit TEXT,
        FOREIGN KEY (FilmNr) REFERENCES Film(FilmNr),
        FOREIGN KEY (SaalNr) REFERENCES Saal(SaalNr)
      );
      CREATE TABLE Ticket (
        TicketNr INTEGER PRIMARY KEY, VorstellungNr INTEGER, Preis REAL, Sitzplatz TEXT,
        FOREIGN KEY (VorstellungNr) REFERENCES Vorstellung(VorstellungNr)
      );

      INSERT INTO Film VALUES
        (1,'Dune: Teil Zwei','Science-Fiction',166,12),
        (2,'Oppenheimer','Drama',180,12),
        (3,'Inside Out 2','Animation',96,0),
        (4,'The Batman','Action',176,16);

      INSERT INTO Saal VALUES
        (1,'Saal 1',120),
        (2,'Saal 2 (IMAX)',200),
        (3,'Saal 3',80);

      INSERT INTO Vorstellung VALUES
        (1,1,2,'2026-06-01','20:00'),
        (2,1,2,'2026-06-02','20:00'),
        (3,2,1,'2026-06-01','19:30'),
        (4,3,3,'2026-06-01','16:00'),
        (5,3,3,'2026-06-02','16:00'),
        (6,4,1,'2026-06-02','21:15'),
        (7,4,1,'2026-06-03','21:15');

      INSERT INTO Ticket VALUES
        (1,1,12.50,'A1'),(2,1,12.50,'A2'),(3,1,10.00,'B1'),
        (4,2,12.50,'A1'),(5,2,12.50,'A2'),
        (6,3,11.00,'C1'),(7,3,11.00,'C2'),(8,3,11.00,'C3'),
        (9,4,8.50,'D1'),(10,4,8.50,'D2'),(11,4,8.50,'D3'),(12,4,8.50,'D4'),
        (13,5,8.50,'D1'),
        (14,6,13.00,'A5'),(15,6,13.00,'A6');
    `
  },

  // --------------------------------------------------------------------- SHOP
  {
    id: "shop",
    name: "Online-Shop",
    icon: "&#128722;",
    description: "Produkte, Kunden, Bestellungen und Positionen. Fokus auf Umsatzberechnung und Retouren-Logik über vier Tabellen.",
    tags: ["Subquery", "n:m", "Umsatz"],
    level: 2,
    schema: {
      Kategorie: [["KategorieNr","INT","pk"],["Name","TEXT"]],
      Produkt: [["ProduktNr","INT","pk"],["Name","TEXT"],["KategorieNr","INT","fk"],["Preis","REAL"],["Lagerbestand","INT"]],
      Kunde: [["KundenNr","INT","pk"],["Name","TEXT"],["Ort","TEXT"]],
      Bestellung: [["BestellNr","INT","pk"],["KundenNr","INT","fk"],["Datum","TEXT"],["Status","TEXT"]],
      Bestellposition: [["BestellNr","INT","pk/fk"],["ProduktNr","INT","pk/fk"],["Anzahl","INT"],["Einzelpreis","REAL"]]
    },
    sql: `
      CREATE TABLE Kategorie (KategorieNr INTEGER PRIMARY KEY, Name TEXT);
      CREATE TABLE Produkt (
        ProduktNr INTEGER PRIMARY KEY, Name TEXT, KategorieNr INTEGER, Preis REAL, Lagerbestand INTEGER,
        FOREIGN KEY (KategorieNr) REFERENCES Kategorie(KategorieNr)
      );
      CREATE TABLE Kunde (KundenNr INTEGER PRIMARY KEY, Name TEXT, Ort TEXT);
      CREATE TABLE Bestellung (
        BestellNr INTEGER PRIMARY KEY, KundenNr INTEGER, Datum TEXT, Status TEXT,
        FOREIGN KEY (KundenNr) REFERENCES Kunde(KundenNr)
      );
      CREATE TABLE Bestellposition (
        BestellNr INTEGER, ProduktNr INTEGER, Anzahl INTEGER, Einzelpreis REAL,
        PRIMARY KEY (BestellNr, ProduktNr),
        FOREIGN KEY (BestellNr) REFERENCES Bestellung(BestellNr),
        FOREIGN KEY (ProduktNr) REFERENCES Produkt(ProduktNr)
      );

      INSERT INTO Kategorie VALUES
        (1,'Elektronik'),
        (2,'Buecher'),
        (3,'Haushalt');

      INSERT INTO Produkt VALUES
        (1,'Kopfhoerer',1,49.99,30),
        (2,'Smartphone-Huelle',1,14.99,100),
        (3,'USB-Kabel',1,9.99,200),
        (4,'Roman - Der Sturm',2,12.50,40),
        (5,'Kochbuch Italien',2,19.90,25),
        (6,'Kaffeemaschine',3,79.00,15),
        (7,'Toaster',3,34.50,20),
        (8,'Staubsauger',3,129.00,8);

      INSERT INTO Kunde VALUES
        (1,'Adler Tim','Darmstadt'),
        (2,'Baumann Lisa','Frankfurt'),
        (3,'Conrad Nils','Darmstadt'),
        (4,'Dietrich Ana','Griesheim'),
        (5,'Ebert Kim','Offenbach'),
        (6,'Falk Otto','Darmstadt');

      INSERT INTO Bestellung VALUES
        (1,1,'2026-01-05','versendet'),
        (2,2,'2026-01-10','versendet'),
        (3,1,'2026-02-01','retourniert'),
        (4,3,'2026-02-10','offen'),
        (5,4,'2026-02-15','versendet'),
        (6,2,'2026-03-01','versendet'),
        (7,5,'2026-03-05','retourniert'),
        (8,3,'2026-03-20','versendet');

      INSERT INTO Bestellposition VALUES
        (1,1,1,49.99),
        (1,3,2,9.99),
        (2,4,1,12.50),
        (2,5,1,19.90),
        (3,6,1,79.00),
        (4,2,3,14.99),
        (5,7,1,34.50),
        (5,3,1,9.99),
        (6,1,1,49.99),
        (6,8,1,129.00),
        (7,4,2,12.50),
        (8,5,2,19.90),
        (8,2,1,14.99);
    `
  },

  // -------------------------------------------------------------------- FIRMA
  {
    id: "firma",
    name: "Personal & Firma",
    icon: "&#128188;",
    description: "Mitarbeiter, Abteilungen und Vorgesetzte. Fokus auf Self-JOINs und Gehaltsvergleiche in der Hierarchie.",
    tags: ["Self-JOIN", "HAVING", "Gehalt"],
    level: 3,
    schema: {
      Abteilung: [["AbteilungNr","INT","pk"],["Name","TEXT"],["Standort","TEXT"]],
      Mitarbeiter: [["MitarbeiterNr","INT","pk"],["Nachname","TEXT"],["Vorname","TEXT"],["AbteilungNr","INT","fk"],["Gehalt","REAL"],["Eintrittsdatum","TEXT"],["VorgesetzterNr","INT","fk"]]
    },
    sql: `
      CREATE TABLE Abteilung (AbteilungNr INTEGER PRIMARY KEY, Name TEXT, Standort TEXT);
      CREATE TABLE Mitarbeiter (
        MitarbeiterNr INTEGER PRIMARY KEY, Nachname TEXT, Vorname TEXT, AbteilungNr INTEGER,
        Gehalt REAL, Eintrittsdatum TEXT, VorgesetzterNr INTEGER,
        FOREIGN KEY (AbteilungNr) REFERENCES Abteilung(AbteilungNr),
        FOREIGN KEY (VorgesetzterNr) REFERENCES Mitarbeiter(MitarbeiterNr)
      );

      INSERT INTO Abteilung VALUES
        (1,'Vertrieb','Frankfurt'),
        (2,'Entwicklung','Darmstadt'),
        (3,'Personal','Darmstadt'),
        (4,'Marketing','Frankfurt');

      INSERT INTO Mitarbeiter VALUES
        (1,'Fuchs','Peter',2,95000,'2015-01-10',NULL),
        (2,'Berg','Nina',2,68000,'2018-03-01',1),
        (3,'Otto','Jan',2,62000,'2019-06-15',1),
        (4,'Krause','Eva',1,88000,'2014-09-01',NULL),
        (5,'Wolf','Tom',1,55000,'2020-02-01',4),
        (6,'Sommer','Lea',1,92000,'2021-05-10',4),
        (7,'Neumann','Rolf',3,60000,'2016-01-01',NULL),
        (8,'Vogel','Mia',3,48000,'2022-01-15',7),
        (9,'Bauer','Finn',4,65000,'2017-08-01',NULL),
        (10,'Frank','Zoe',4,50000,'2023-04-01',9);
    `
  },

  // -------------------------------------------------------------------- LIGA
  {
    id: "liga",
    name: "Sportliga",
    icon: "&#9917;",
    description: "Vereine, Spieler und Spielergebnisse. Fokus auf Self-JOINs (Heim/Gast) und korrelierte Subqueries.",
    tags: ["Self-JOIN", "Subquery", "Ranking"],
    level: 3,
    schema: {
      Verein: [["VereinNr","INT","pk"],["Name","TEXT"],["Stadt","TEXT"]],
      Spieler: [["SpielerNr","INT","pk"],["Name","TEXT"],["VereinNr","INT","fk"],["Position","TEXT"],["Tore","INT"]],
      Spiel: [["SpielNr","INT","pk"],["HeimVereinNr","INT","fk"],["GastVereinNr","INT","fk"],["HeimTore","INT"],["GastTore","INT"],["Datum","TEXT"]]
    },
    sql: `
      CREATE TABLE Verein (VereinNr INTEGER PRIMARY KEY, Name TEXT, Stadt TEXT);
      CREATE TABLE Spieler (
        SpielerNr INTEGER PRIMARY KEY, Name TEXT, VereinNr INTEGER, Position TEXT, Tore INTEGER,
        FOREIGN KEY (VereinNr) REFERENCES Verein(VereinNr)
      );
      CREATE TABLE Spiel (
        SpielNr INTEGER PRIMARY KEY, HeimVereinNr INTEGER, GastVereinNr INTEGER,
        HeimTore INTEGER, GastTore INTEGER, Datum TEXT,
        FOREIGN KEY (HeimVereinNr) REFERENCES Verein(VereinNr),
        FOREIGN KEY (GastVereinNr) REFERENCES Verein(VereinNr)
      );

      INSERT INTO Verein VALUES
        (1,'FC Waldstadt','Darmstadt'),
        (2,'SV Rheinau','Frankfurt'),
        (3,'TSV Bergheim','Offenbach'),
        (4,'FC Nordstern','Griesheim'),
        (5,'SC Talbach','Darmstadt');

      INSERT INTO Spieler VALUES
        (1,'Keller Jonas',1,'Stuermer',14),
        (2,'Roth Finn',1,'Mittelfeld',5),
        (3,'Vogt Elias',2,'Stuermer',9),
        (4,'Busch Paul',2,'Abwehr',1),
        (5,'Graf Noah',3,'Stuermer',11),
        (6,'Berger Kim',3,'Mittelfeld',4),
        (7,'Simon Leo',4,'Stuermer',7),
        (8,'Peters Emil',4,'Abwehr',2),
        (9,'Arnold Tim',5,'Stuermer',16),
        (10,'Wagner Nils',5,'Mittelfeld',3);

      INSERT INTO Spiel VALUES
        (1,1,2,2,1,'2026-02-01'),
        (2,3,4,0,0,'2026-02-01'),
        (3,5,1,3,2,'2026-02-08'),
        (4,2,3,1,1,'2026-02-08'),
        (5,4,5,1,2,'2026-02-15'),
        (6,1,3,4,0,'2026-02-15'),
        (7,2,5,0,2,'2026-02-22'),
        (8,4,1,1,1,'2026-02-22');
    `
  }
];
