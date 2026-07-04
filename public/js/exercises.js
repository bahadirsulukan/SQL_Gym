/* ==========================================================================
   EXERCISES
   difficulty: 1 = leicht, 2 = mittel, 3 = schwer
   check: "set" compares result rows as an unordered set (default),
          "exact" requires same row order too (use when ORDER BY is required)
   ========================================================================== */

const EXERCISES = {

  nordwind: [
    {
      difficulty: 1,
      question: "Gib Artikelname und Einzelpreis aller Artikel aus, deren Preis über 15 liegt.",
      hint: "Nur eine Tabelle nötig: Artikel. WHERE Einzelpreis > 15.",
      solution: "SELECT Artikelname, Einzelpreis FROM Artikel WHERE Einzelpreis > 15;",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Zu welcher Kategorie gehört der Artikel 'Camembert Pierrot'? Gib den Kategorienamen aus.",
      hint: "JOIN zwischen Artikel und Kategorie über KategorieNr.",
      solution: "SELECT k.Kategoriename FROM Artikel a JOIN Kategorie k ON a.KategorieNr = k.KategorieNr WHERE a.Artikelname = 'Camembert Pierrot';",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Welche Artikel müssen nachbestellt werden (Lagerbestand kleiner oder gleich Mindestbestand), ohne Auslaufartikel?",
      hint: "WHERE Lagerbestand <= Mindestbestand AND Auslaufartikel = 0.",
      solution: "SELECT Artikelname, Lagerbestand, Mindestbestand FROM Artikel WHERE Lagerbestand <= Mindestbestand AND Auslaufartikel = 0;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Gib für jeden Kunden den Namen und die Anzahl seiner Bestellungen aus.",
      hint: "JOIN Kunde mit Bestellung, dann GROUP BY Kunde.",
      solution: "SELECT k.Firma, COUNT(*) AS Anzahl FROM Kunde k JOIN Bestellung b ON k.KundenCode = b.KundenCode GROUP BY k.Firma;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige alle Kunden, die noch NIE etwas bestellt haben (Firma).",
      hint: "NOT IN oder NOT EXISTS mit einer Subquery auf Bestellung.",
      solution: "SELECT Firma FROM Kunde WHERE KundenCode NOT IN (SELECT KundenCode FROM Bestellung);",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Berechne den Gesamtumsatz (Einzelpreis * (1 - Rabatt) * Anzahl) für das Jahr 1997.",
      hint: "JOIN Bestelldetails mit Bestellung über BestellNr, WHERE Bestelldatum LIKE '1997%', dann SUM.",
      solution: "SELECT SUM(bd.Einzelpreis * (1 - bd.Rabatt) * bd.Anzahl) AS Umsatz FROM Bestelldetails bd JOIN Bestellung b ON bd.BestellNr = b.BestellNr WHERE b.Bestelldatum LIKE '1997%';",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Liste die 3 Artikel mit dem höchsten Gesamtabsatz (SUM Anzahl), absteigend sortiert.",
      hint: "JOIN Artikel mit Bestelldetails, GROUP BY Artikelname, ORDER BY SUM(Anzahl) DESC, LIMIT 3.",
      solution: "SELECT a.Artikelname, SUM(bd.Anzahl) AS Gesamt FROM Artikel a JOIN Bestelldetails bd ON a.ArtikelNr = bd.ArtikelNr GROUP BY a.Artikelname ORDER BY Gesamt DESC LIMIT 3;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Welche Kategorien haben mindestens 2 Artikel? Zeige Kategoriename und Anzahl.",
      hint: "JOIN Kategorie mit Artikel, GROUP BY, HAVING COUNT(*) >= 2.",
      solution: "SELECT k.Kategoriename, COUNT(*) AS Anzahl FROM Kategorie k JOIN Artikel a ON k.KategorieNr = a.KategorieNr GROUP BY k.Kategoriename HAVING COUNT(*) >= 2;",
      check: "set"
    }
  ],

  cia: [
    {
      difficulty: 1,
      question: "Zeige alle Länder aus der Region 'Europa', geordnet nach Einwohnerzahl absteigend.",
      hint: "WHERE Region = 'Europa', ORDER BY Einwohner DESC.",
      solution: "SELECT Name, Einwohner FROM cia WHERE Region = 'Europa' ORDER BY Einwohner DESC;",
      check: "exact"
    },
    {
      difficulty: 1,
      question: "Wie viele Länder pro Region gibt es?",
      hint: "GROUP BY Region, COUNT(*).",
      solution: "SELECT Region, COUNT(*) AS Anzahl FROM cia GROUP BY Region;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige Region und Anzahl der Länder mit mehr als 10 Millionen Einwohnern.",
      hint: "Erst WHERE Einwohner > 10000000 filtern, DANN GROUP BY Region.",
      solution: "SELECT Region, COUNT(*) AS Anzahl FROM cia WHERE Einwohner > 10000000 GROUP BY Region;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Welche Regionen haben eine Gesamtbevölkerung von mindestens 100 Millionen?",
      hint: "GROUP BY Region, HAVING SUM(Einwohner) >= 100000000.",
      solution: "SELECT Region, SUM(Einwohner) AS Gesamt FROM cia GROUP BY Region HAVING SUM(Einwohner) >= 100000000;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Stelle Region, Gesamteinwohnerzahl und Gesamtfläche dar, nur für Regionen mit 'amerika' im Namen, geordnet nach Einwohnerzahl.",
      hint: "WHERE Region LIKE '%amerika%' (case-insensitive in SQLite per Default), GROUP BY, ORDER BY am Ende.",
      solution: "SELECT Region, SUM(Einwohner) AS Einwohner, SUM(Flaeche) AS Flaeche FROM cia WHERE Region LIKE '%amerika%' GROUP BY Region ORDER BY Einwohner;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Welches Land hat das höchste BIP pro Einwohner? Zeige Name und den berechneten Wert.",
      hint: "BIP / Einwohner berechnen, ORDER BY DESC, LIMIT 1.",
      solution: "SELECT Name, BIP * 1.0 / Einwohner AS ProKopf FROM cia ORDER BY ProKopf DESC LIMIT 1;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Zeige alle Länder, deren Fläche größer als der Durchschnitt aller Länder ist.",
      hint: "Subquery: WHERE Flaeche > (SELECT AVG(Flaeche) FROM cia).",
      solution: "SELECT Name, Flaeche FROM cia WHERE Flaeche > (SELECT AVG(Flaeche) FROM cia);",
      check: "set"
    }
  ],

  f1: [
    {
      difficulty: 1,
      question: "Zeige alle Saisons, in denen Michael Schumacher Fahrerweltmeister wurde.",
      hint: "Einfaches WHERE auf Fahrerweltmeister.",
      solution: "SELECT Saison FROM WMTitel WHERE Fahrerweltmeister = 'Michael Schumacher';",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Wie oft wurde jedes Team Konstrukteursweltmeister? Sortiere absteigend nach Häufigkeit.",
      hint: "GROUP BY KonstrukteursWM, COUNT(*), ORDER BY DESC.",
      solution: "SELECT KonstrukteursWM, COUNT(*) AS Titel FROM WMTitel GROUP BY KonstrukteursWM ORDER BY Titel DESC;",
      check: "exact"
    },
    {
      difficulty: 2,
      question: "Welche Fahrer wurden mehr als einmal Weltmeister? Zeige Name und Anzahl Titel.",
      hint: "GROUP BY Fahrerweltmeister, HAVING COUNT(*) > 1.",
      solution: "SELECT Fahrerweltmeister, COUNT(*) AS Titel FROM WMTitel GROUP BY Fahrerweltmeister HAVING COUNT(*) > 1;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige alle Saisons ab 1995 mit Team-Punkten von mindestens 200, geordnet nach Team-Punkten absteigend.",
      hint: "WHERE Saison >= 1995 AND Team_Punkte >= 200, ORDER BY am Ende.",
      solution: "SELECT Saison, KonstrukteursWM, Team_Punkte FROM WMTitel WHERE Saison >= 1995 AND Team_Punkte >= 200 ORDER BY Team_Punkte DESC;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Welcher Fahrer hat die höchste durchschnittliche WM-Punktzahl über alle seine Titelsaisons?",
      hint: "GROUP BY Fahrerweltmeister, AVG(WM_Punkte), ORDER BY DESC, LIMIT 1.",
      solution: "SELECT Fahrerweltmeister, AVG(WM_Punkte) AS Schnitt FROM WMTitel GROUP BY Fahrerweltmeister ORDER BY Schnitt DESC LIMIT 1;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Zeige alle Teams, die NIE Konstrukteursweltmeister mit mehr als 200 Team-Punkten wurden.",
      hint: "NOT IN mit Subquery: Teams, die in der Bedingung vorkommen, ausschließen.",
      solution: "SELECT DISTINCT KonstrukteursWM FROM WMTitel WHERE KonstrukteursWM NOT IN (SELECT KonstrukteursWM FROM WMTitel WHERE Team_Punkte > 200);",
      check: "set"
    }
  ],

  schule: [
    {
      difficulty: 1,
      question: "Zeige Nachname, Vorname aller Schüler aus Darmstadt.",
      hint: "WHERE Ort = 'Darmstadt' auf der Tabelle schueler.",
      solution: "SELECT Nachname, Vorname FROM schueler WHERE Ort = 'Darmstadt';",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Wie viele Kurse gibt es je Fach?",
      hint: "GROUP BY Fach auf der Tabelle Kurs.",
      solution: "SELECT Fach, COUNT(*) AS Anzahl FROM Kurs GROUP BY Fach;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige für jeden Schüler den Namen und die Anzahl belegter Kurse.",
      hint: "JOIN schueler mit belegt, GROUP BY Schüler.",
      solution: "SELECT s.Nachname, COUNT(*) AS Anzahl FROM schueler s JOIN belegt b ON s.SNr = b.SNr GROUP BY s.Nachname;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige Nachname und Punkte aller Schüler im Kurs 'IF-GK-1', absteigend nach Punkten sortiert.",
      hint: "JOIN schueler, belegt WHERE KursNr = 'IF-GK-1', ORDER BY am Ende.",
      solution: "SELECT s.Nachname, b.Punkte FROM schueler s JOIN belegt b ON s.SNr = b.SNr WHERE b.KursNr = 'IF-GK-1' ORDER BY b.Punkte DESC;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Welche Schüler haben in KEINEM Kurs mehr als 10 Punkte erreicht?",
      hint: "NOT IN oder NOT EXISTS: Schüler, die NICHT in der Menge 'Punkte > 10' vorkommen.",
      solution: "SELECT Nachname FROM schueler WHERE SNr NOT IN (SELECT SNr FROM belegt WHERE Punkte > 10);",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Berechne den Punkte-Durchschnitt je Kurs (Fach + Thema), nur für Kurse mit mindestens 2 Belegungen.",
      hint: "JOIN Kurs mit belegt, GROUP BY Kurs, HAVING COUNT(*) >= 2.",
      solution: "SELECT k.Fach, k.Thema, AVG(b.Punkte) AS Schnitt FROM Kurs k JOIN belegt b ON k.KursNr = b.KursNr GROUP BY k.KursNr HAVING COUNT(*) >= 2;",
      check: "set"
    }
  ],

  bibliothek: [
    {
      difficulty: 1,
      question: "Zeige Titel und Erscheinungsjahr aller Bücher aus dem Genre 'Krimi'.",
      hint: "Einfaches WHERE auf die Tabelle Buch.",
      solution: "SELECT Titel, Jahr FROM Buch WHERE Genre = 'Krimi';",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Wie viele Bücher gibt es je Genre?",
      hint: "GROUP BY Genre, COUNT(*).",
      solution: "SELECT Genre, COUNT(*) AS Anzahl FROM Buch GROUP BY Genre;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Gib für jedes Buch den Titel und den Namen des Autors aus.",
      hint: "JOIN Buch mit Autor über AutorNr.",
      solution: "SELECT b.Titel, a.Name FROM Buch b JOIN Autor a ON b.AutorNr = a.AutorNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Welche Bücher sind aktuell ausgeliehen (noch nicht zurückgegeben)?",
      hint: "Rueckgabedatum ist NULL, solange das Buch nicht zurückgegeben wurde. JOIN mit Buch für den Titel.",
      solution: "SELECT b.Titel, m.Name FROM Ausleihe au JOIN Buch b ON au.ISBN = b.ISBN JOIN Mitglied m ON au.MitgliedNr = m.MitgliedNr WHERE au.Rueckgabedatum IS NULL;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Welche Mitglieder haben noch NIE ein Buch ausgeliehen?",
      hint: "NOT IN oder NOT EXISTS: Mitglieder, die nicht in Ausleihe vorkommen.",
      solution: "SELECT Name FROM Mitglied WHERE MitgliedNr NOT IN (SELECT MitgliedNr FROM Ausleihe);",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Zeige pro Autor die Anzahl seiner Bücher, nur für Autoren mit mehr als einem Buch.",
      hint: "JOIN Autor mit Buch, GROUP BY Autor, HAVING COUNT(*) > 1.",
      solution: "SELECT a.Name, COUNT(*) AS Anzahl FROM Autor a JOIN Buch b ON a.AutorNr = b.AutorNr GROUP BY a.Name HAVING COUNT(*) > 1;",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Welches Buch wurde am häufigsten ausgeliehen? Zeige Titel und Anzahl.",
      hint: "JOIN Buch mit Ausleihe, GROUP BY Titel, ORDER BY COUNT(*) DESC, LIMIT 1.",
      solution: "SELECT b.Titel, COUNT(*) AS Anzahl FROM Buch b JOIN Ausleihe au ON b.ISBN = au.ISBN GROUP BY b.Titel ORDER BY Anzahl DESC LIMIT 1;",
      check: "exact"
    }
  ],

  kino: [
    {
      difficulty: 1,
      question: "Zeige Titel und Länge aller Filme, die länger als 150 Minuten dauern.",
      hint: "Einfaches WHERE auf die Tabelle Film.",
      solution: "SELECT Titel, Laenge FROM Film WHERE Laenge > 150;",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Wie viele Vorstellungen gibt es je Saal?",
      hint: "GROUP BY SaalNr auf der Tabelle Vorstellung.",
      solution: "SELECT SaalNr, COUNT(*) AS Anzahl FROM Vorstellung GROUP BY SaalNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige für jede Vorstellung den Filmtitel, den Saalnamen und die Uhrzeit.",
      hint: "Zwei JOINs: Vorstellung mit Film und mit Saal.",
      solution: "SELECT f.Titel, s.Name, v.Uhrzeit FROM Vorstellung v JOIN Film f ON v.FilmNr = f.FilmNr JOIN Saal s ON v.SaalNr = s.SaalNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Berechne den Gesamtumsatz (Summe aller Ticketpreise) je Film.",
      hint: "JOIN über 3 Tabellen: Ticket -> Vorstellung -> Film, dann GROUP BY Film.",
      solution: "SELECT f.Titel, SUM(t.Preis) AS Umsatz FROM Ticket t JOIN Vorstellung v ON t.VorstellungNr = v.VorstellungNr JOIN Film f ON v.FilmNr = f.FilmNr GROUP BY f.Titel;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Welche Vorstellungen haben noch KEIN einziges Ticket verkauft?",
      hint: "NOT IN oder NOT EXISTS auf VorstellungNr in der Ticket-Tabelle.",
      solution: "SELECT VorstellungNr FROM Vorstellung WHERE VorstellungNr NOT IN (SELECT VorstellungNr FROM Ticket);",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Zeige je Vorstellung die Anzahl verkaufter Tickets und die Auslastung in Prozent (verkaufte Tickets / Plätze im Saal * 100).",
      hint: "JOIN Ticket, Vorstellung, Saal. GROUP BY Vorstellung. Auslastung = COUNT(*) * 100.0 / Plaetze.",
      solution: "SELECT v.VorstellungNr, COUNT(t.TicketNr) AS Verkauft, s.Plaetze, COUNT(t.TicketNr) * 100.0 / s.Plaetze AS AuslastungProzent FROM Vorstellung v JOIN Saal s ON v.SaalNr = s.SaalNr LEFT JOIN Ticket t ON v.VorstellungNr = t.VorstellungNr GROUP BY v.VorstellungNr;",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Welches Genre hat den höchsten durchschnittlichen Ticketpreis?",
      hint: "JOIN über alle 3 Tabellen, GROUP BY Genre, AVG(Preis), ORDER BY DESC, LIMIT 1.",
      solution: "SELECT f.Genre, AVG(t.Preis) AS Schnitt FROM Ticket t JOIN Vorstellung v ON t.VorstellungNr = v.VorstellungNr JOIN Film f ON v.FilmNr = f.FilmNr GROUP BY f.Genre ORDER BY Schnitt DESC LIMIT 1;",
      check: "exact"
    }
  ],

  firma: [
    {
      difficulty: 1,
      question: "Zeige Nachname und Vorname aller Mitarbeiter mit einem Gehalt über 60000.",
      hint: "Einfaches WHERE auf die Tabelle Mitarbeiter.",
      solution: "SELECT Nachname, Vorname FROM Mitarbeiter WHERE Gehalt > 60000;",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Wie viele Mitarbeiter gibt es je Abteilung (AbteilungNr)?",
      hint: "GROUP BY AbteilungNr auf der Tabelle Mitarbeiter.",
      solution: "SELECT AbteilungNr, COUNT(*) AS Anzahl FROM Mitarbeiter GROUP BY AbteilungNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige für jeden Mitarbeiter den Nachnamen und den Namen seiner Abteilung.",
      hint: "JOIN zwischen Mitarbeiter und Abteilung über AbteilungNr.",
      solution: "SELECT m.Nachname, a.Name FROM Mitarbeiter m JOIN Abteilung a ON m.AbteilungNr = a.AbteilungNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Berechne das Durchschnittsgehalt je Abteilung, aber nur für Abteilungen mit mindestens 3 Mitarbeitern.",
      hint: "JOIN, GROUP BY Abteilungsname, HAVING COUNT(*) >= 3.",
      solution: "SELECT a.Name, AVG(m.Gehalt) AS Schnitt FROM Abteilung a JOIN Mitarbeiter m ON a.AbteilungNr = m.AbteilungNr GROUP BY a.Name HAVING COUNT(*) >= 3;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige für jeden Mitarbeiter mit Vorgesetztem den Nachnamen des Mitarbeiters und den Nachnamen seines Vorgesetzten.",
      hint: "Self-JOIN: Mitarbeiter zweimal verknüpfen, einmal über VorgesetzterNr = MitarbeiterNr.",
      solution: "SELECT m.Nachname AS Mitarbeiter, v.Nachname AS Vorgesetzter FROM Mitarbeiter m JOIN Mitarbeiter v ON m.VorgesetzterNr = v.MitarbeiterNr;",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Welche Mitarbeiter verdienen mehr als ihr direkter Vorgesetzter? Zeige den Nachnamen des Mitarbeiters.",
      hint: "Gleicher Self-JOIN wie zuvor, zusätzlich WHERE m.Gehalt > v.Gehalt.",
      solution: "SELECT m.Nachname FROM Mitarbeiter m JOIN Mitarbeiter v ON m.VorgesetzterNr = v.MitarbeiterNr WHERE m.Gehalt > v.Gehalt;",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Welche Abteilung hat das höchste Durchschnittsgehalt? Zeige den Abteilungsnamen und den Wert.",
      hint: "JOIN, GROUP BY Abteilungsname, AVG(Gehalt), ORDER BY DESC, LIMIT 1.",
      solution: "SELECT a.Name, AVG(m.Gehalt) AS Schnitt FROM Abteilung a JOIN Mitarbeiter m ON a.AbteilungNr = m.AbteilungNr GROUP BY a.Name ORDER BY Schnitt DESC LIMIT 1;",
      check: "exact"
    }
  ],

  krankenhaus: [
    {
      difficulty: 1,
      question: "Zeige den Namen aller Ärzte aus dem Fachbereich 'Kardiologie'.",
      hint: "Einfaches WHERE auf die Tabelle Arzt.",
      solution: "SELECT Name FROM Arzt WHERE Fachbereich = 'Kardiologie';",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Wie viele Behandlungen gibt es je Fachbereich?",
      hint: "JOIN Behandlung mit Arzt über ArztNr, dann GROUP BY Fachbereich.",
      solution: "SELECT a.Fachbereich, COUNT(*) AS Anzahl FROM Behandlung b JOIN Arzt a ON b.ArztNr = a.ArztNr GROUP BY a.Fachbereich;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige für jede Behandlung den Patientennamen, den Arztnamen und das Datum.",
      hint: "Zwei JOINs: Behandlung mit Patient und mit Arzt.",
      solution: "SELECT p.Name AS Patient, a.Name AS Arzt, b.Datum FROM Behandlung b JOIN Patient p ON b.PatientNr = p.PatientNr JOIN Arzt a ON b.ArztNr = a.ArztNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Berechne die Gesamtkosten aller Behandlungen je Patient.",
      hint: "JOIN Patient mit Behandlung, GROUP BY Patient, SUM(Kosten).",
      solution: "SELECT p.Name, SUM(b.Kosten) AS Gesamt FROM Patient p JOIN Behandlung b ON p.PatientNr = b.PatientNr GROUP BY p.Name;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Welche Patienten wurden noch nie behandelt?",
      hint: "NOT IN mit einer Subquery auf Behandlung.",
      solution: "SELECT Name FROM Patient WHERE PatientNr NOT IN (SELECT PatientNr FROM Behandlung);",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Welcher Arzt hat die meisten Behandlungen durchgeführt? Zeige den Namen und die Anzahl.",
      hint: "JOIN, GROUP BY Arztname, COUNT(*), ORDER BY DESC, LIMIT 1.",
      solution: "SELECT a.Name, COUNT(*) AS Anzahl FROM Behandlung b JOIN Arzt a ON b.ArztNr = a.ArztNr GROUP BY a.Name ORDER BY Anzahl DESC LIMIT 1;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Zeige alle Patienten, die von mehr als einem Arzt behandelt wurden.",
      hint: "JOIN, GROUP BY Patient, HAVING COUNT(DISTINCT ArztNr) > 1.",
      solution: "SELECT p.Name FROM Patient p JOIN Behandlung b ON p.PatientNr = b.PatientNr GROUP BY p.Name HAVING COUNT(DISTINCT b.ArztNr) > 1;",
      check: "set"
    }
  ],

  shop: [
    {
      difficulty: 1,
      question: "Zeige Name und Preis aller Produkte mit einem Preis unter 20 Euro.",
      hint: "Einfaches WHERE auf die Tabelle Produkt.",
      solution: "SELECT Name, Preis FROM Produkt WHERE Preis < 20;",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Wie viele Bestellungen gibt es je Status?",
      hint: "GROUP BY Status auf der Tabelle Bestellung.",
      solution: "SELECT Status, COUNT(*) AS Anzahl FROM Bestellung GROUP BY Status;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige für jeden Kunden den Namen und die Anzahl seiner Bestellungen.",
      hint: "JOIN Kunde mit Bestellung, dann GROUP BY Kunde.",
      solution: "SELECT k.Name, COUNT(*) AS Anzahl FROM Kunde k JOIN Bestellung b ON k.KundenNr = b.KundenNr GROUP BY k.Name;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Berechne den Gesamtwert (Anzahl * Einzelpreis) jeder Bestellung.",
      hint: "GROUP BY BestellNr auf der Tabelle Bestellposition, SUM(Anzahl * Einzelpreis).",
      solution: "SELECT BestellNr, SUM(Anzahl * Einzelpreis) AS Gesamt FROM Bestellposition GROUP BY BestellNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Welche Kunden haben noch nie eine Bestellung aufgegeben?",
      hint: "NOT IN mit einer Subquery auf Bestellung.",
      solution: "SELECT Name FROM Kunde WHERE KundenNr NOT IN (SELECT KundenNr FROM Bestellung);",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Welches Produkt wurde insgesamt am häufigsten bestellt (Summe der Anzahl über alle Bestellungen)? Zeige Name und Menge.",
      hint: "JOIN Produkt mit Bestellposition, GROUP BY Produktname, SUM(Anzahl), ORDER BY DESC, LIMIT 1.",
      solution: "SELECT p.Name, SUM(bp.Anzahl) AS Menge FROM Produkt p JOIN Bestellposition bp ON p.ProduktNr = bp.ProduktNr GROUP BY p.Name ORDER BY Menge DESC LIMIT 1;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Berechne den Umsatz je Kategorie, aber nur für Bestellungen, die NICHT retourniert wurden.",
      hint: "JOIN über Kategorie, Produkt, Bestellposition, Bestellung. WHERE Status <> 'retourniert', dann GROUP BY Kategorie.",
      solution: "SELECT k.Name, SUM(bp.Anzahl * bp.Einzelpreis) AS Umsatz FROM Kategorie k JOIN Produkt p ON k.KategorieNr = p.KategorieNr JOIN Bestellposition bp ON p.ProduktNr = bp.ProduktNr JOIN Bestellung b ON bp.BestellNr = b.BestellNr WHERE b.Status <> 'retourniert' GROUP BY k.Name;",
      check: "set"
    }
  ],

  liga: [
    {
      difficulty: 1,
      question: "Zeige Name und Tore aller Spieler mit mehr als 10 Toren.",
      hint: "Einfaches WHERE auf die Tabelle Spieler.",
      solution: "SELECT Name, Tore FROM Spieler WHERE Tore > 10;",
      check: "set"
    },
    {
      difficulty: 1,
      question: "Wie viele Spieler gibt es je Verein (VereinNr)?",
      hint: "GROUP BY VereinNr auf der Tabelle Spieler.",
      solution: "SELECT VereinNr, COUNT(*) AS Anzahl FROM Spieler GROUP BY VereinNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige für jedes Spiel den Namen des Heimvereins und des Gastvereins.",
      hint: "Self-JOIN: Verein zweimal verknüpfen, einmal über HeimVereinNr, einmal über GastVereinNr.",
      solution: "SELECT h.Name AS Heim, g.Name AS Gast FROM Spiel s JOIN Verein h ON s.HeimVereinNr = h.VereinNr JOIN Verein g ON s.GastVereinNr = g.VereinNr;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Zeige alle Spiele, die mit einem Heimsieg endeten (HeimTore > GastTore), mit dem Namen des Heimvereins.",
      hint: "JOIN Spiel mit Verein über HeimVereinNr, WHERE HeimTore > GastTore.",
      solution: "SELECT h.Name AS Heimverein, s.HeimTore, s.GastTore FROM Spiel s JOIN Verein h ON s.HeimVereinNr = h.VereinNr WHERE s.HeimTore > s.GastTore;",
      check: "set"
    },
    {
      difficulty: 2,
      question: "Berechne die Gesamtzahl der Tore, die jeder Verein als Heimmannschaft erzielt hat.",
      hint: "JOIN Verein mit Spiel über HeimVereinNr, GROUP BY Verein, SUM(HeimTore).",
      solution: "SELECT h.Name, SUM(s.HeimTore) AS Tore FROM Verein h JOIN Spiel s ON h.VereinNr = s.HeimVereinNr GROUP BY h.Name;",
      check: "set"
    },
    {
      difficulty: 3,
      question: "Welcher Verein hat die meisten Heimsiege? Zeige den Namen und die Anzahl.",
      hint: "JOIN, WHERE HeimTore > GastTore, GROUP BY Verein, ORDER BY DESC, LIMIT 1.",
      solution: "SELECT h.Name, COUNT(*) AS Heimsiege FROM Spiel s JOIN Verein h ON s.HeimVereinNr = h.VereinNr WHERE s.HeimTore > s.GastTore GROUP BY h.Name ORDER BY Heimsiege DESC LIMIT 1;",
      check: "exact"
    },
    {
      difficulty: 3,
      question: "Zeige pro Verein den Spieler mit den meisten Toren (Torschützenkönig).",
      hint: "Korrelierte Subquery: WHERE Tore = (SELECT MAX(Tore) FROM Spieler s2 WHERE s2.VereinNr = s.VereinNr).",
      solution: "SELECT v.Name AS Verein, s.Name AS Spieler, s.Tore FROM Spieler s JOIN Verein v ON s.VereinNr = v.VereinNr WHERE s.Tore = (SELECT MAX(s2.Tore) FROM Spieler s2 WHERE s2.VereinNr = s.VereinNr);",
      check: "set"
    }
  ]
};
