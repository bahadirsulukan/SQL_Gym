/* ==========================================================================
   NORMALIZATION EXERCISES
   Jede Aufgabe gibt eine unnormalisierte Relation als Schema-Box (Spalte, Typ,
   Beschreibung, PK-Komponenten) - genau wie in echten Klausuraufgaben - plus
   die dafuer geltenden funktionalen Abhaengigkeiten. Der Nutzer baut in der
   interaktiven Zerlegung eigene Tabellen; normalization-engine.js prueft sie
   auf Verlustfreiheit, Abhaengigkeitserhaltung und erreichte Normalform je
   Tabelle - nicht nur eine einzige feste "Musterloesung"-Zeichenkette.
   ========================================================================== */

const NORMALIZATION_EXERCISES = [
  {
    id: "restaurant",
    level: 1,
    title: "Restaurantreservierungen",
    intro: "Eine Reservierungsplattform speichert bisher alles in einer einzigen Tabelle 'RestaurantReservierung'.",
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
    id: "personalvermittlung",
    level: 2,
    title: "Personalvermittlungsagentur",
    intro: "Eine Personalvermittlungsagentur möchte ihre Projektverwaltung von Excel in eine relationale Datenbank übertragen. Aktuell liegen alle Daten in der 0. Normalform (0NF) in einer einzigen Tabelle 'Daten' vor.",
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
    id: "kurswahl",
    level: 3,
    title: "Kurswahl (3NF vs. BCNF)",
    intro: "Eine Hochschule verwaltet, welche Dozentin welchen Kurs für welche Studentin unterrichtet. Regel der Schule: jede Dozentin unterrichtet genau einen Kurs (auch wenn ein Kurs mehrere Dozentinnen/Sektionen haben kann).",
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
