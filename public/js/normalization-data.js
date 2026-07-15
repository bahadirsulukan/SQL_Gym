/* ==========================================================================
   NORMALIZATION EXERCISES
   Jede Aufgabe gibt eine unnormalisierte Relation als Schema-Box (Spalte, Typ,
   Beschreibung, PK-Komponenten) - genau wie in echten Klausuraufgaben - plus
   die dafuer geltenden funktionalen Abhaengigkeiten und eine explizite
   Aufgabenstellung (task, a/b/c-Teilaufgaben wie in der Klausur). Der Nutzer
   baut in der interaktiven Zerlegung eigene Tabellen; normalization-engine.js
   prueft sie auf Verlustfreiheit, Abhaengigkeitserhaltung und erreichte
   Normalform je Tabelle - nicht nur eine einzige feste "Musterloesung".
   ========================================================================== */

const NORMALIZATION_EXERCISES = [
  {
    id: "restaurant",
    level: 1,
    title: "Restaurantreservierungen",
    intro: "Eine Reservierungsplattform speichert bisher alles in einer einzigen Tabelle 'RestaurantReservierung'.",
    task: `<p>a) Überprüfen Sie, ob die Relation der 1., 2. und 3. Normalform genügt. Falls Normalformen verletzt sind, führen Sie die Verletzungen bitte einzeln auf.</p>
<p>b) Normalisieren Sie die Relation vollständig.</p>`,
    attributes: [
      { key: "PID", label: "PersonenID", type: "INTEGER", description: "eindeutige PersonenID (PK-Komponente)" },
      { key: "RID", label: "RestaurantID", type: "INTEGER", description: "eindeutige RestaurantID (PK-Komponente)" },
      { key: "Nachname", label: "NachnamePerson", type: "VARCHAR(20)", description: "Nachname der reservierenden Person" },
      { key: "Telefon", label: "TelefonPerson", type: "VARCHAR(20)", description: "Telefonnummer der reservierenden Person" },
      { key: "RName", label: "RestaurantName", type: "VARCHAR(20)", description: "Name des Restaurants" },
      { key: "Datum", label: "Datum", type: "DATE", description: "Datum der Reservierung" },
      { key: "Uhrzeit", label: "abUhrzeit", type: "TIME", description: "Uhrzeit der Reservierung" },
      { key: "Anzahl", label: "AnzahlPersonen", type: "INTEGER", description: "Anzahl der Personen für die Reservierung" }
    ],
    keyAttrs: ["PID", "RID"],
    fds: [
      { lhs: ["PID"], rhs: ["Nachname", "Telefon"] },
      { lhs: ["RID"], rhs: ["RName"] },
      { lhs: ["PID", "RID"], rhs: ["Datum", "Uhrzeit", "Anzahl"] }
    ],
    hint: "Der Primärschlüssel ist {PersonenID, RestaurantID}. NachnamePerson/TelefonPerson hängen nur von PersonenID ab, RestaurantName nur von RestaurantID - beides sind Teilabhängigkeiten (2NF-Verletzung). Bilde drei Tabellen: Person, Restaurant, Reservierung.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Person", attrs: ["PID", "Nachname", "Telefon"], pk: ["PID"] },
        { name: "Restaurant", attrs: ["RID", "RName"], pk: ["RID"] },
        { name: "Reservierung", attrs: ["PID", "RID", "Datum", "Uhrzeit", "Anzahl"], pk: ["PID", "RID"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> PersonenID → NachnamePerson, TelefonPerson. RestaurantID → RestaurantName. {PersonenID,RestaurantID} → Datum, abUhrzeit, AnzahlPersonen.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> Nur {PersonenID,RestaurantID} bestimmt alle anderen Attribute, also ist das der einzige Schlüsselkandidat und wird Primärschlüssel.</p>
<p><strong>Schritt 3 - Normalisieren:</strong> NachnamePerson/TelefonPerson hängen nur vom Teil PersonenID ab, RestaurantName nur vom Teil RestaurantID - beides Teilabhängigkeiten (2NF-Verletzung). Also: Person(PersonenID, NachnamePerson, TelefonPerson), Restaurant(RestaurantID, RestaurantName) auslagern. Übrig bleibt Reservierung(PersonenID, RestaurantID, Datum, abUhrzeit, AnzahlPersonen) mit dem vollen Schlüssel. Alle drei Tabellen sind danach in BCNF, die Zerlegung ist verlustfrei (die Reservierung-Tabelle enthält den Originalschlüssel) und abhängigkeitserhaltend.</p>`
    }
  },

  {
    id: "bibliothek",
    level: 1,
    title: "Bibliotheksausleihe",
    intro: "Eine Stadtbibliothek speichert bisher alle Ausleihen in einer einzigen Tabelle 'Ausleihe'.",
    task: `<p>a) Überprüfen Sie, ob die Relation der 1., 2. und 3. Normalform genügt. Falls Normalformen verletzt sind, führen Sie die Verletzungen bitte einzeln auf.</p>
<p>b) Normalisieren Sie die Relation vollständig.</p>`,
    attributes: [
      { key: "ISBN", label: "ISBN", type: "VARCHAR(20)", description: "eindeutige ISBN des Buchs (PK-Komponente)" },
      { key: "LeserNr", label: "LeserNr", type: "INTEGER", description: "eindeutige Lesernummer (PK-Komponente)" },
      { key: "Titel", label: "Titel", type: "VARCHAR(50)", description: "Titel des Buchs" },
      { key: "Autor", label: "Autor", type: "VARCHAR(50)", description: "Autor des Buchs" },
      { key: "LeserName", label: "LeserName", type: "VARCHAR(50)", description: "Name der Leserin/des Lesers" },
      { key: "Ausleihdatum", label: "Ausleihdatum", type: "DATE", description: "Datum der Ausleihe" },
      { key: "Rueckgabedatum", label: "Rueckgabedatum", type: "DATE", description: "Rückgabedatum (NULL falls noch nicht zurückgegeben)" }
    ],
    keyAttrs: ["ISBN", "LeserNr"],
    fds: [
      { lhs: ["ISBN"], rhs: ["Titel", "Autor"] },
      { lhs: ["LeserNr"], rhs: ["LeserName"] },
      { lhs: ["ISBN", "LeserNr"], rhs: ["Ausleihdatum", "Rueckgabedatum"] }
    ],
    hint: "Der Primärschlüssel ist {ISBN, LeserNr} (vereinfachend: eine Leserin leiht ein Buch jeweils nur einmal gleichzeitig aus). Titel/Autor hängen nur von ISBN ab, LeserName nur von LeserNr - beides Teilabhängigkeiten (2NF-Verletzung). Bilde drei Tabellen: Buch, Leser, Ausleihe.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Buch", attrs: ["ISBN", "Titel", "Autor"], pk: ["ISBN"] },
        { name: "Leser", attrs: ["LeserNr", "LeserName"], pk: ["LeserNr"] },
        { name: "Ausleihe", attrs: ["ISBN", "LeserNr", "Ausleihdatum", "Rueckgabedatum"], pk: ["ISBN", "LeserNr"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> ISBN → Titel, Autor. LeserNr → LeserName. {ISBN,LeserNr} → Ausleihdatum, Rückgabedatum.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> Nur {ISBN,LeserNr} bestimmt alle anderen Attribute.</p>
<p><strong>Schritt 3 - Normalisieren:</strong> Titel/Autor hängen nur vom Teil ISBN ab, LeserName nur vom Teil LeserNr - beides Teilabhängigkeiten (2NF-Verletzung). Also: Buch(ISBN, Titel, Autor), Leser(LeserNr, LeserName) auslagern. Übrig bleibt Ausleihe(ISBN, LeserNr, Ausleihdatum, Rückgabedatum) mit dem vollen Schlüssel. Alle drei Tabellen sind danach in BCNF, verlustfrei und abhängigkeitserhaltend.</p>`
    }
  },

  {
    id: "hotelbuchung",
    level: 1,
    title: "Hotelbuchung",
    intro: "Ein Hotel speichert bisher alle Buchungen in einer einzigen Tabelle 'Buchung'.",
    task: `<p>a) Überprüfen Sie, ob die Relation der 1., 2. und 3. Normalform genügt. Falls Normalformen verletzt sind, führen Sie die Verletzungen bitte einzeln auf.</p>
<p>b) Normalisieren Sie die Relation vollständig.</p>`,
    attributes: [
      { key: "GastNr", label: "GastNr", type: "INTEGER", description: "eindeutige Gastnummer (PK-Komponente)" },
      { key: "ZimmerNr", label: "ZimmerNr", type: "INTEGER", description: "eindeutige Zimmernummer (PK-Komponente)" },
      { key: "GastName", label: "GastName", type: "VARCHAR(50)", description: "Name des Gastes" },
      { key: "Zimmertyp", label: "Zimmertyp", type: "VARCHAR(20)", description: "Typ des Zimmers (Einzel/Doppel/Suite)" },
      { key: "Anreise", label: "Anreise", type: "DATE", description: "Anreisedatum" },
      { key: "Abreise", label: "Abreise", type: "DATE", description: "Abreisedatum" },
      { key: "Preis", label: "Preis", type: "DECIMAL(7,2)", description: "Gesamtpreis dieser Buchung" }
    ],
    keyAttrs: ["GastNr", "ZimmerNr"],
    fds: [
      { lhs: ["GastNr"], rhs: ["GastName"] },
      { lhs: ["ZimmerNr"], rhs: ["Zimmertyp"] },
      { lhs: ["GastNr", "ZimmerNr"], rhs: ["Anreise", "Abreise", "Preis"] }
    ],
    hint: "Der Primärschlüssel ist {GastNr, ZimmerNr} (vereinfachend: ein Gast bucht ein Zimmer jeweils nur einmal gleichzeitig). GastName hängt nur von GastNr ab, Zimmertyp nur von ZimmerNr - beides Teilabhängigkeiten (2NF-Verletzung). Bilde drei Tabellen: Gast, Zimmer, Buchung.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Gast", attrs: ["GastNr", "GastName"], pk: ["GastNr"] },
        { name: "Zimmer", attrs: ["ZimmerNr", "Zimmertyp"], pk: ["ZimmerNr"] },
        { name: "Buchung", attrs: ["GastNr", "ZimmerNr", "Anreise", "Abreise", "Preis"], pk: ["GastNr", "ZimmerNr"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> GastNr → GastName. ZimmerNr → Zimmertyp. {GastNr,ZimmerNr} → Anreise, Abreise, Preis.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> Nur {GastNr,ZimmerNr} bestimmt alle anderen Attribute.</p>
<p><strong>Schritt 3 - Normalisieren:</strong> GastName hängt nur vom Teil GastNr ab, Zimmertyp nur vom Teil ZimmerNr - beides Teilabhängigkeiten (2NF-Verletzung). Also: Gast(GastNr, GastName), Zimmer(ZimmerNr, Zimmertyp) auslagern. Übrig bleibt Buchung(GastNr, ZimmerNr, Anreise, Abreise, Preis) mit dem vollen Schlüssel. Alle drei Tabellen sind danach in BCNF, verlustfrei und abhängigkeitserhaltend.</p>`
    }
  },

  {
    id: "autoverleih",
    level: 1,
    title: "Autoverleih",
    intro: "Ein Autoverleih speichert bisher alle Vermietungen in einer einzigen Tabelle 'Miete'.",
    task: `<p>a) Überprüfen Sie, ob die Relation der 1., 2. und 3. Normalform genügt. Falls Normalformen verletzt sind, führen Sie die Verletzungen bitte einzeln auf.</p>
<p>b) Normalisieren Sie die Relation vollständig.</p>`,
    attributes: [
      { key: "KundenNr", label: "KundenNr", type: "INTEGER", description: "eindeutige Kundennummer (PK-Komponente)" },
      { key: "FahrzeugNr", label: "FahrzeugNr", type: "INTEGER", description: "eindeutige Fahrzeugnummer (PK-Komponente)" },
      { key: "KundenName", label: "KundenName", type: "VARCHAR(50)", description: "Name des Kunden" },
      { key: "Fahrzeugmodell", label: "Fahrzeugmodell", type: "VARCHAR(30)", description: "Modell des Fahrzeugs" },
      { key: "Mietbeginn", label: "Mietbeginn", type: "DATE", description: "Beginn der Miete" },
      { key: "Mietende", label: "Mietende", type: "DATE", description: "Ende der Miete" },
      { key: "Gesamtpreis", label: "Gesamtpreis", type: "DECIMAL(7,2)", description: "Gesamtpreis dieser Miete" }
    ],
    keyAttrs: ["KundenNr", "FahrzeugNr"],
    fds: [
      { lhs: ["KundenNr"], rhs: ["KundenName"] },
      { lhs: ["FahrzeugNr"], rhs: ["Fahrzeugmodell"] },
      { lhs: ["KundenNr", "FahrzeugNr"], rhs: ["Mietbeginn", "Mietende", "Gesamtpreis"] }
    ],
    hint: "Der Primärschlüssel ist {KundenNr, FahrzeugNr} (vereinfachend: ein Kunde mietet ein Fahrzeug jeweils nur einmal gleichzeitig). KundenName hängt nur von KundenNr ab, Fahrzeugmodell nur von FahrzeugNr - beides Teilabhängigkeiten (2NF-Verletzung). Bilde drei Tabellen: Kunde, Fahrzeug, Miete.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Kunde", attrs: ["KundenNr", "KundenName"], pk: ["KundenNr"] },
        { name: "Fahrzeug", attrs: ["FahrzeugNr", "Fahrzeugmodell"], pk: ["FahrzeugNr"] },
        { name: "Miete", attrs: ["KundenNr", "FahrzeugNr", "Mietbeginn", "Mietende", "Gesamtpreis"], pk: ["KundenNr", "FahrzeugNr"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> KundenNr → KundenName. FahrzeugNr → Fahrzeugmodell. {KundenNr,FahrzeugNr} → Mietbeginn, Mietende, Gesamtpreis.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> Nur {KundenNr,FahrzeugNr} bestimmt alle anderen Attribute.</p>
<p><strong>Schritt 3 - Normalisieren:</strong> KundenName hängt nur vom Teil KundenNr ab, Fahrzeugmodell nur vom Teil FahrzeugNr - beides Teilabhängigkeiten (2NF-Verletzung). Also: Kunde(KundenNr, KundenName), Fahrzeug(FahrzeugNr, Fahrzeugmodell) auslagern. Übrig bleibt Miete(KundenNr, FahrzeugNr, Mietbeginn, Mietende, Gesamtpreis) mit dem vollen Schlüssel. Alle drei Tabellen sind danach in BCNF, verlustfrei und abhängigkeitserhaltend.</p>`
    }
  },

  {
    id: "mitarbeiterausweis",
    level: 1,
    title: "Mitarbeiterausweis",
    intro: "Die Personalabteilung speichert Stammdaten bisher in einer einzigen Tabelle 'Mitarbeiter'.",
    task: `<p>a) Bestimmen Sie den/die Schlüsselkandidaten der Relation.</p>
<p>b) Überprüfen Sie, ob die Relation der 2. und 3. Normalform genügt. Begründen Sie Ihre Antwort.</p>
<p>c) Ist die Relation in BCNF? Falls nicht, normalisieren Sie vollständig.</p>`,
    attributes: [
      { key: "MitarbeiterNr", label: "MitarbeiterNr", type: "INTEGER", description: "eindeutige Mitarbeiternummer (Primärschlüssel)" },
      { key: "Name", label: "Name", type: "VARCHAR(50)", description: "Name des Mitarbeiters" },
      { key: "Abteilung", label: "Abteilung", type: "VARCHAR(30)", description: "Abteilung des Mitarbeiters" },
      { key: "Ausweisnummer", label: "Ausweisnummer", type: "VARCHAR(20)", description: "Nummer des Firmenausweises" }
    ],
    keyAttrs: ["MitarbeiterNr"],
    fds: [
      { lhs: ["MitarbeiterNr"], rhs: ["Name", "Abteilung", "Ausweisnummer"] }
    ],
    hint: "Es gibt nur einen einzigen Schlüsselkandidaten: {MitarbeiterNr}. Ein einzelnes Attribut als Schlüssel kann per Definition keine Teilabhängigkeit (2NF-Verletzung) erzeugen, da es keine 'echte Teilmenge' des Schlüssels gibt. Prüfe, ob zwischen den Nicht-Schlüssel-Attributen selbst eine Abhängigkeit besteht (transitive Abhängigkeit) - falls nicht, ist die Tabelle schon fertig normalisiert.",
    goal: "Ziel dieser Aufgabe: nicht jede 0NF-Tabelle muss zerlegt werden. Prüfe bewusst nach, bevor du Tabellen anlegst - manchmal ist eine Relation schon in BCNF.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Mitarbeiter", attrs: ["MitarbeiterNr", "Name", "Abteilung", "Ausweisnummer"], pk: ["MitarbeiterNr"] }
      ],
      narrative: `<p><strong>Schlüsselkandidat:</strong> {MitarbeiterNr} ist der einzige Schlüsselkandidat - er bestimmt alle anderen Attribute direkt.</p>
<p><strong>2NF:</strong> Eine Teilabhängigkeit setzt voraus, dass ein Attribut nur von einem <em>echten Teil</em> des Schlüssels abhängt. Da der Schlüssel hier nur aus einem einzigen Attribut besteht, gibt es keinen "echten Teil" - 2NF ist damit automatisch erfüllt.</p>
<p><strong>3NF/BCNF:</strong> Es gibt keine Abhängigkeit zwischen den Nicht-Schlüssel-Attributen (Name, Abteilung, Ausweisnummer hängen nur von MitarbeiterNr ab, nicht voneinander) - also auch keine transitive Abhängigkeit. Die Relation ist damit bereits in BCNF, eine Zerlegung ist nicht nötig und würde hier auch keinen Vorteil bringen.</p>`
    }
  },

  {
    id: "personalvermittlung",
    level: 2,
    title: "Personalvermittlungsagentur",
    intro: "Eine Personalvermittlungsagentur möchte ihre Projektverwaltung von Excel in eine relationale Datenbank übertragen. Aktuell liegen alle Daten in der 0. Normalform (0NF) in einer einzigen Tabelle 'Daten' vor.",
    task: `<p>Dokumentieren Sie den Prozess der schrittweisen Überführung obiger 0NF in die 3NF anhand der aus der Vorlesung bekannten Vorgehensweise:</p>
<p>a) Alle vollen funktionalen Abhängigkeiten identifizieren.</p>
<p>b) Aus den Schlüsselkandidaten für die Tabelle(n) einen Primary Key auswählen.</p>
<p>c) Mit den vollen funktionalen Abhängigkeiten die einzelnen Normalisierungsschritte durchführen.</p>
<p>Nach welchem "Algorithmus" erzeugt dieser Prozess Foreign Keys?</p>`,
    attributes: [
      { key: "V", label: "Vorname", type: "VARCHAR(30)", description: "Vorname der Person" },
      { key: "N", label: "Nachname", type: "VARCHAR(30)", description: "Nachname der Person" },
      { key: "G", label: "GebDatum", type: "DATE", description: "Geburtsdatum der Person" },
      { key: "A", label: "Ausbildung", type: "VARCHAR(30)", description: "Ausbildung/Beruf der Person" },
      { key: "P", label: "PID", type: "INTEGER", description: "eindeutige Platzierungs-ID" },
      { key: "J", label: "Projekt", type: "VARCHAR(30)", description: "Name des Projekts" },
      { key: "E", label: "EUR/Stunde", type: "DECIMAL(6,2)", description: "Stundensatz in EUR für diese Platzierung" },
      { key: "M", label: "Min/Tag", type: "INTEGER", description: "Vorbereitungszeit in Minuten pro Tag, die das Projekt benötigt" }
    ],
    keyAttrs: ["V", "N", "G", "P"],
    fds: [
      { lhs: ["P"], rhs: ["J"] },
      { lhs: ["J"], rhs: ["M"] },
      { lhs: ["V", "N", "G"], rhs: ["A"] },
      { lhs: ["V", "N", "G", "P"], rhs: ["E"] }
    ],
    hint: "Schlüsselkandidat ist {Vorname,Nachname,GebDatum,PID}. Ausbildung hängt nur vom Personenteil ab, Projekt nur von PID - beides Teilabhängigkeiten (2NF). Aber Vorsicht: Min/Tag hängt nicht direkt von PID ab, sondern von Projekt - und Projekt selbst ist kein Schlüssel. Das ist eine zusätzliche transitive Abhängigkeit (3NF), die eine eigene, vierte Tabelle braucht.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF. Achtung: hier reichen 3 Tabellen nicht ganz - es braucht 4.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Person", attrs: ["V", "N", "G", "A"], pk: ["V", "N", "G"] },
        { name: "Platzierung", attrs: ["P", "J"], pk: ["P"] },
        { name: "ProjektInfo", attrs: ["J", "M"], pk: ["J"] },
        { name: "Einsatz", attrs: ["V", "N", "G", "P", "E"], pk: ["V", "N", "G", "P"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> PID → Projekt. Projekt → Min/Tag. {Vorname,Nachname,GebDatum} → Ausbildung. {Vorname,Nachname,GebDatum,PID} → EUR/Stunde.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> {Vorname,Nachname,GebDatum,PID} ist der einzige Schlüsselkandidat.</p>
<p><strong>Schritt 3 - 2NF (Teilabhängigkeiten entfernen):</strong> Ausbildung hängt nur vom Personenteil ab, Projekt nur von PID. Auslagern in Person(Vorname,Nachname,GebDatum,Ausbildung) und einen vorläufigen "Projekt"-Topf (PID,Projekt,Min/Tag). Übrig bleibt Einsatz(Vorname,Nachname,GebDatum,PID,EUR/Stunde) mit vollem Schlüssel.</p>
<p><strong>Schritt 4 - 3NF (transitive Abhängigkeiten entfernen):</strong> Im vorläufigen Projekt-Topf (PID,Projekt,Min/Tag) gilt PID → Projekt → Min/Tag - Min/Tag hängt nur transitiv über Projekt von PID ab, nicht direkt. Das ist eine 3NF-Verletzung: Projekt selbst ist kein Schlüssel dieser Tabelle. Also weiter aufteilen in Platzierung(PID,Projekt) und ProjektInfo(Projekt,Min/Tag). Ergebnis: 4 Tabellen, alle in BCNF, verlustfrei und abhängigkeitserhaltend.</p>
<p><strong>Foreign Keys:</strong> Der Zerlegungsalgorithmus erzeugt automatisch einen Foreign Key überall dort, wo die linke Seite einer FD (der "abgespaltene" Schlüssel) in der ursprünglichen Tabelle zurückbleibt - er verweist von der neuen Tabelle auf die Tabelle, in der dieses Attribut Primärschlüssel ist (Einsatz.PID → Platzierung.PID, Platzierung.Projekt → ProjektInfo.Projekt).</p>`
    }
  },

  {
    id: "seminaranmeldung",
    level: 2,
    title: "Seminaranmeldung",
    intro: "Eine Hochschule speichert bisher alle Seminaranmeldungen in einer einzigen Tabelle 'Anmeldung'.",
    task: `<p>Dokumentieren Sie den Prozess der schrittweisen Überführung dieser Relation in die 3NF anhand der bekannten Vorgehensweise:</p>
<p>a) Alle vollen funktionalen Abhängigkeiten identifizieren.</p>
<p>b) Aus den Schlüsselkandidaten einen Primary Key auswählen.</p>
<p>c) Mit den vollen funktionalen Abhängigkeiten die einzelnen Normalisierungsschritte durchführen.</p>`,
    attributes: [
      { key: "MatrikelNr", label: "MatrikelNr", type: "INTEGER", description: "eindeutige Matrikelnummer (PK-Komponente)" },
      { key: "SeminarNr", label: "SeminarNr", type: "INTEGER", description: "eindeutige Seminarnummer (PK-Komponente)" },
      { key: "StudentName", label: "StudentName", type: "VARCHAR(50)", description: "Name der Studentin/des Studenten" },
      { key: "SeminarTitel", label: "SeminarTitel", type: "VARCHAR(50)", description: "Titel des Seminars" },
      { key: "DozentName", label: "DozentName", type: "VARCHAR(50)", description: "Name der/des unterrichtenden Dozentin/Dozenten" },
      { key: "DozentBuero", label: "DozentBuero", type: "VARCHAR(20)", description: "Büronummer der/des Dozentin/Dozenten" },
      { key: "Note", label: "Note", type: "DECIMAL(2,1)", description: "Note in diesem Seminar" }
    ],
    keyAttrs: ["MatrikelNr", "SeminarNr"],
    fds: [
      { lhs: ["MatrikelNr"], rhs: ["StudentName"] },
      { lhs: ["SeminarNr"], rhs: ["SeminarTitel", "DozentName"] },
      { lhs: ["DozentName"], rhs: ["DozentBuero"] },
      { lhs: ["MatrikelNr", "SeminarNr"], rhs: ["Note"] }
    ],
    hint: "Schlüsselkandidat ist {MatrikelNr,SeminarNr}. StudentName hängt nur von MatrikelNr ab, SeminarTitel/DozentName nur von SeminarNr - beides Teilabhängigkeiten (2NF). Aber Vorsicht: DozentBuero hängt nicht direkt von SeminarNr ab, sondern von DozentName - eine zusätzliche transitive Abhängigkeit (3NF), die eine eigene, vierte Tabelle braucht.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF. Achtung: hier reichen 3 Tabellen nicht ganz - es braucht 4.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Student", attrs: ["MatrikelNr", "StudentName"], pk: ["MatrikelNr"] },
        { name: "Seminar", attrs: ["SeminarNr", "SeminarTitel", "DozentName"], pk: ["SeminarNr"] },
        { name: "Dozent", attrs: ["DozentName", "DozentBuero"], pk: ["DozentName"] },
        { name: "Anmeldung", attrs: ["MatrikelNr", "SeminarNr", "Note"], pk: ["MatrikelNr", "SeminarNr"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> MatrikelNr → StudentName. SeminarNr → SeminarTitel, DozentName. DozentName → DozentBuero. {MatrikelNr,SeminarNr} → Note.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> {MatrikelNr,SeminarNr} ist der einzige Schlüsselkandidat.</p>
<p><strong>Schritt 3 - 2NF (Teilabhängigkeiten entfernen):</strong> StudentName hängt nur vom Studentenanteil ab, SeminarTitel/DozentName nur von SeminarNr. Auslagern in Student(MatrikelNr,StudentName) und einen vorläufigen "Seminar"-Topf (SeminarNr,SeminarTitel,DozentName,DozentBuero). Übrig bleibt Anmeldung(MatrikelNr,SeminarNr,Note) mit vollem Schlüssel.</p>
<p><strong>Schritt 4 - 3NF (transitive Abhängigkeiten entfernen):</strong> Im vorläufigen Seminar-Topf gilt SeminarNr → DozentName → DozentBuero - DozentBuero hängt nur transitiv über DozentName von SeminarNr ab, nicht direkt. Das ist eine 3NF-Verletzung: DozentName selbst ist kein Schlüssel dieser Tabelle. Also weiter aufteilen in Seminar(SeminarNr,SeminarTitel,DozentName) und Dozent(DozentName,DozentBuero). Ergebnis: 4 Tabellen, alle in BCNF, verlustfrei und abhängigkeitserhaltend.</p>`
    }
  },

  {
    id: "projektstunden",
    level: 2,
    title: "Projektstunden",
    intro: "Eine Firma erfasst bisher alle geleisteten Projektstunden in einer einzigen Tabelle 'Erfassung' - pro Mitarbeiter, Projekt und Jahr ein Datensatz.",
    task: `<p>Dokumentieren Sie den Prozess der schrittweisen Überführung dieser Relation in die 3NF anhand der bekannten Vorgehensweise:</p>
<p>a) Alle vollen funktionalen Abhängigkeiten identifizieren.</p>
<p>b) Aus den Schlüsselkandidaten einen Primary Key auswählen.</p>
<p>c) Mit den vollen funktionalen Abhängigkeiten die einzelnen Normalisierungsschritte durchführen.</p>`,
    attributes: [
      { key: "MitarbeiterNr", label: "MitarbeiterNr", type: "INTEGER", description: "eindeutige Mitarbeiternummer (PK-Komponente)" },
      { key: "ProjektNr", label: "ProjektNr", type: "INTEGER", description: "eindeutige Projektnummer (PK-Komponente)" },
      { key: "Jahr", label: "Jahr", type: "INTEGER", description: "Erfassungsjahr (PK-Komponente)" },
      { key: "MitarbeiterName", label: "MitarbeiterName", type: "VARCHAR(50)", description: "Name des Mitarbeiters" },
      { key: "Projektname", label: "Projektname", type: "VARCHAR(50)", description: "Name des Projekts" },
      { key: "Stunden", label: "Stunden", type: "INTEGER", description: "geleistete Stunden in diesem Jahr auf diesem Projekt" }
    ],
    keyAttrs: ["MitarbeiterNr", "ProjektNr", "Jahr"],
    fds: [
      { lhs: ["MitarbeiterNr"], rhs: ["MitarbeiterName"] },
      { lhs: ["ProjektNr"], rhs: ["Projektname"] },
      { lhs: ["MitarbeiterNr", "ProjektNr", "Jahr"], rhs: ["Stunden"] }
    ],
    hint: "Der Primärschlüssel besteht hier aus drei Teilen: {MitarbeiterNr, ProjektNr, Jahr}. MitarbeiterName hängt nur vom Teil MitarbeiterNr ab, Projektname nur vom Teil ProjektNr - beides Teilabhängigkeiten (2NF-Verletzung), obwohl der Schlüssel diesmal drei statt zwei Komponenten hat. Bilde drei Tabellen: Mitarbeiter, Projekt, Erfassung.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Mitarbeiter", attrs: ["MitarbeiterNr", "MitarbeiterName"], pk: ["MitarbeiterNr"] },
        { name: "Projekt", attrs: ["ProjektNr", "Projektname"], pk: ["ProjektNr"] },
        { name: "Erfassung", attrs: ["MitarbeiterNr", "ProjektNr", "Jahr", "Stunden"], pk: ["MitarbeiterNr", "ProjektNr", "Jahr"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> MitarbeiterNr → MitarbeiterName. ProjektNr → Projektname. {MitarbeiterNr,ProjektNr,Jahr} → Stunden.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> Nur {MitarbeiterNr,ProjektNr,Jahr} bestimmt alle anderen Attribute - hier hat der Schlüssel also drei statt nur zwei Komponenten.</p>
<p><strong>Schritt 3 - Normalisieren:</strong> MitarbeiterName hängt nur vom Teil MitarbeiterNr ab, Projektname nur vom Teil ProjektNr - beides Teilabhängigkeiten (2NF-Verletzung), da beides jeweils nur ein Teil des dreiteiligen Schlüssels ist. Also: Mitarbeiter(MitarbeiterNr, MitarbeiterName), Projekt(ProjektNr, Projektname) auslagern. Übrig bleibt Erfassung(MitarbeiterNr, ProjektNr, Jahr, Stunden) mit dem vollen Schlüssel. Alle drei Tabellen sind danach in BCNF, verlustfrei und abhängigkeitserhaltend.</p>`
    }
  },

  {
    id: "kurswahl",
    level: 3,
    title: "Kurswahl (3NF vs. BCNF)",
    intro: "Eine Hochschule verwaltet, welche Dozentin welchen Kurs für welche Studentin unterrichtet. Regel der Schule: jede Dozentin unterrichtet genau einen Kurs (auch wenn ein Kurs mehrere Dozentinnen/Sektionen haben kann).",
    task: `<p>a) Bestimmen Sie alle Schlüsselkandidaten der Relation.</p>
<p>b) Prüfen Sie, ob die Relation in 3NF ist - begründen Sie warum bzw. warum nicht.</p>
<p>c) Prüfen Sie, ob die Relation in BCNF ist. Falls nicht, normalisieren Sie vollständig nach BCNF.</p>
<p>d) Ist Ihre Zerlegung abhängigkeitserhaltend? Was bedeutet das Ergebnis für die praktische Anwendung?</p>`,
    attributes: [
      { key: "S", label: "Student", type: "VARCHAR(30)", description: "Name der Studentin/des Studenten" },
      { key: "K", label: "Kurs", type: "VARCHAR(30)", description: "Name des Kurses" },
      { key: "D", label: "Dozentin", type: "VARCHAR(30)", description: "Name der unterrichtenden Dozentin" }
    ],
    keyAttrs: ["S", "K"],
    fds: [
      { lhs: ["S", "K"], rhs: ["D"] },
      { lhs: ["D"], rhs: ["K"] }
    ],
    hint: "Es gibt zwei Schlüsselkandidaten: {Student,Kurs} und {Student,Dozentin} (da Dozentin → Kurs gilt, kann man Kurs in der Kombination durch Dozentin ersetzen). Damit sind alle drei Attribute Schlüsselattribute - die Tabelle ist automatisch in 3NF. Für BCNF müsste man wegen Dozentin → Kurs trotzdem aufteilen: (Student,Dozentin) und (Dozentin,Kurs).",
    goal: "Ziel dieser Aufgabe: zerlege nach BCNF (Dozentin → Kurs ist die Verletzung). Prüfe danach im Ergebnis, was mit der Abhängigkeit {Student,Kurs} → Dozentin passiert - genau das ist die Erkenntnis dieser Aufgabe.",
    requireDependencyPreserving: false,
    solution: {
      tables: [
        { name: "Belegung", attrs: ["S", "D"], pk: ["S", "D"] },
        { name: "Kursleitung", attrs: ["D", "K"], pk: ["D"] }
      ],
      narrative: `<p><strong>Schlüsselkandidaten:</strong> {Student,Kurs} und {Student,Dozentin} - beide bestimmen alles. Damit sind Student, Kurs und Dozentin alle drei "prim" (Teil eines Schlüssels). Eine 3NF-Verletzung kann es per Definition nicht geben, wenn jedes Attribut prim ist - die Ausgangstabelle ist also bereits in 3NF!</p>
<p><strong>Trotzdem keine BCNF:</strong> Die Abhängigkeit Dozentin → Kurs hat als linke Seite keinen Schlüssel (Dozentin allein ist kein Schlüsselkandidat) - das verletzt BCNF, auch wenn 3NF wegen der Ausnahme für prime Attribute erfüllt ist.</p>
<p><strong>Zerlegung nach BCNF:</strong> Belegung(Student,Dozentin) und Kursleitung(Dozentin,Kurs) - beide Tabellen sind jetzt in BCNF und die Zerlegung ist verlustfrei (Dozentin bestimmt Kursleitung vollständig).</p>
<p><strong>Der Haken:</strong> Die ursprüngliche Regel {Student,Kurs} → Dozentin lässt sich in dieser BCNF-Zerlegung nicht mehr direkt prüfen, ohne beide Tabellen wieder zu verjoinen - die Zerlegung ist <em>nicht abhängigkeitserhaltend</em>. Das ist ein klassischer Zielkonflikt: BCNF ist theoretisch "sauberer", aber man verliert die Möglichkeit, die Regel per einfachem Constraint durchzusetzen. Deshalb bleibt man in der Praxis manchmal bewusst bei 3NF.</p>`
    }
  }
];
