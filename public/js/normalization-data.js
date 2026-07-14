/* ==========================================================================
   NORMALIZATION EXERCISES
   Each exercise gives an unnormalized (0NF/1NF) relation with sample data and
   a set of functional dependencies (the "business rules"). The user builds a
   decomposition in the interactive editor; normalization-engine.js checks it
   for losslessness, dependency preservation and the normal form reached by
   each resulting table - not just a single fixed "model answer" string.
   ========================================================================== */

const NORMALIZATION_EXERCISES = [
  {
    id: "restaurant",
    level: 1,
    title: "Restaurantreservierungen",
    intro: "Eine Reservierungsplattform speichert bisher alles in einer einzigen Tabelle. Ein Datensatz beschreibt: diese Person hat an diesem Datum/dieser Uhrzeit für so viele Personen in diesem Restaurant reserviert.",
    attributes: [
      { key: "PID", label: "PersonenID" },
      { key: "RID", label: "RestaurantID" },
      { key: "Nachname", label: "Nachname" },
      { key: "Telefon", label: "Telefon" },
      { key: "RName", label: "RestaurantName" },
      { key: "Datum", label: "Datum" },
      { key: "Uhrzeit", label: "Uhrzeit" },
      { key: "Anzahl", label: "AnzahlPersonen" }
    ],
    keyAttrs: ["PID", "RID"],
    sampleRows: [
      ["1", "10", "Yilmaz", "0176-111", "Trattoria Roma", "2026-05-01", "19:00", "4"],
      ["1", "12", "Yilmaz", "0176-111", "Sushi Sano", "2026-05-03", "20:00", "2"],
      ["2", "10", "Schmidt", "0170-222", "Trattoria Roma", "2026-05-02", "18:30", "3"],
      ["2", "11", "Schmidt", "0170-222", "Burger Bahn", "2026-05-04", "12:00", "5"],
      ["3", "11", "Klein", "0160-333", "Burger Bahn", "2026-05-05", "13:00", "2"]
    ],
    fds: [
      { lhs: ["PID"], rhs: ["Nachname", "Telefon"] },
      { lhs: ["RID"], rhs: ["RName"] },
      { lhs: ["PID", "RID"], rhs: ["Datum", "Uhrzeit", "Anzahl"] }
    ],
    hint: "Der Primärschlüssel ist {PersonenID, RestaurantID}. Nachname/Telefon hängen nur von PersonenID ab, RestaurantName nur von RestaurantID - beides sind Teilabhängigkeiten (2NF-Verletzung). Bilde drei Tabellen: Person, Restaurant, Reservierung.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Person", attrs: ["PID", "Nachname", "Telefon"], pk: ["PID"] },
        { name: "Restaurant", attrs: ["RID", "RName"], pk: ["RID"] },
        { name: "Reservierung", attrs: ["PID", "RID", "Datum", "Uhrzeit", "Anzahl"], pk: ["PID", "RID"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> PID → Nachname, Telefon. RID → RName. {PID,RID} → Datum, Uhrzeit, Anzahl.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> Nur {PID,RID} bestimmt alle anderen Attribute, also ist das der einzige Schlüsselkandidat und wird Primärschlüssel.</p>
<p><strong>Schritt 3 - Normalisieren:</strong> Nachname/Telefon hängen nur vom Teil PID ab, RName nur vom Teil RID - beides Teilabhängigkeiten (2NF-Verletzung). Also: Person(PID, Nachname, Telefon), Restaurant(RID, RName) auslagern. Übrig bleibt Reservierung(PID, RID, Datum, Uhrzeit, Anzahl) mit dem vollen Schlüssel. Alle drei Tabellen sind danach in BCNF, die Zerlegung ist verlustfrei (die Reservierung-Tabelle enthält den Originalschlüssel) und abhängigkeitserhaltend.</p>`
    }
  },

  {
    id: "personalvermittlung",
    level: 2,
    title: "Personalvermittlung",
    intro: "Eine Agentur vermittelt Personal an Projekte. Ein Datensatz beschreibt: diese Person mit dieser Ausbildung ist auf dieser Platzierung für dieses Projekt zu diesem Stundensatz eingesetzt, das Projekt braucht so viele Minuten Vorbereitung pro Tag.",
    attributes: [
      { key: "V", label: "Vorname" },
      { key: "N", label: "Nachname" },
      { key: "G", label: "Geburtsdatum" },
      { key: "A", label: "Ausbildung" },
      { key: "P", label: "PlatzierungsID" },
      { key: "J", label: "Projekt" },
      { key: "E", label: "EURProStunde" },
      { key: "M", label: "MinProTag" }
    ],
    keyAttrs: ["V", "N", "G", "P"],
    sampleRows: [
      ["Mara", "Vogt", "1990-02-10", "Kamerafrau", "1", "Herbstshow", "140", "30"],
      ["Jonas", "Reiter", "1988-07-04", "Toningenieur", "2", "Herbstshow", "120", "30"],
      ["Mara", "Vogt", "1990-02-10", "Kamerafrau", "3", "Winterspecial", "160", "45"],
      ["Lea", "Bruck", "1995-11-23", "Regisseurin", "4", "Winterspecial", "200", "45"],
      ["Lea", "Bruck", "1995-11-23", "Regisseurin", "5", "Sommerspecial", "210", "20"]
    ],
    fds: [
      { lhs: ["P"], rhs: ["J"] },
      { lhs: ["J"], rhs: ["M"] },
      { lhs: ["V", "N", "G"], rhs: ["A"] },
      { lhs: ["V", "N", "G", "P"], rhs: ["E"] }
    ],
    hint: "Schlüsselkandidat ist {Vorname,Nachname,Geburtsdatum,PlatzierungsID}. Ausbildung hängt nur vom Personenteil ab, Projekt nur von PlatzierungsID - beides Teilabhängigkeiten (2NF). Aber Vorsicht: MinProTag hängt nicht direkt von PlatzierungsID ab, sondern von Projekt - und Projekt selbst ist kein Schlüssel. Das ist eine zusätzliche transitive Abhängigkeit (3NF), die eine eigene, vierte Tabelle braucht.",
    goal: "Ziel: verlustfrei, abhängigkeitserhaltend, jede Tabelle in BCNF. Achtung: hier reichen 3 Tabellen nicht ganz - es braucht 4.",
    requireDependencyPreserving: true,
    solution: {
      tables: [
        { name: "Person", attrs: ["V", "N", "G", "A"], pk: ["V", "N", "G"] },
        { name: "Platzierung", attrs: ["P", "J"], pk: ["P"] },
        { name: "ProjektInfo", attrs: ["J", "M"], pk: ["J"] },
        { name: "Einsatz", attrs: ["V", "N", "G", "P", "E"], pk: ["V", "N", "G", "P"] }
      ],
      narrative: `<p><strong>Schritt 1 - volle funktionale Abhängigkeiten:</strong> PlatzierungsID → Projekt. Projekt → MinProTag. {Vorname,Nachname,Geburtsdatum} → Ausbildung. {Vorname,Nachname,Geburtsdatum,PlatzierungsID} → EURProStunde.</p>
<p><strong>Schritt 2 - Schlüsselkandidat:</strong> {Vorname,Nachname,Geburtsdatum,PlatzierungsID} ist der einzige Schlüsselkandidat.</p>
<p><strong>Schritt 3 - 2NF (Teilabhängigkeiten entfernen):</strong> Ausbildung hängt nur vom Personenteil ab, Projekt nur von PlatzierungsID. Auslagern in Person(V,N,G,A) und einen vorläufigen "Projekt"-Topf (P,J,M). Übrig bleibt Einsatz(V,N,G,P,E) mit vollem Schlüssel.</p>
<p><strong>Schritt 4 - 3NF (transitive Abhängigkeiten entfernen):</strong> Im vorläufigen Projekt-Topf (P,J,M) gilt P → J → M - MinProTag hängt nur transitiv über Projekt von PlatzierungsID ab, nicht direkt. Das ist eine 3NF-Verletzung: J selbst ist kein Schlüssel dieser Tabelle. Also weiter aufteilen in Platzierung(P,J) und ProjektInfo(J,M). Ergebnis: 4 Tabellen, alle in BCNF, verlustfrei und abhängigkeitserhaltend.</p>`
    }
  },

  {
    id: "kurswahl",
    level: 3,
    title: "Kurswahl (3NF vs. BCNF)",
    intro: "Eine Hochschule verwaltet, welche Dozentin welchen Kurs für welche Studentin unterrichtet. Regel der Schule: jede Dozentin unterrichtet genau einen Kurs (auch wenn ein Kurs mehrere Dozentinnen/Sektionen haben kann).",
    attributes: [
      { key: "S", label: "Student" },
      { key: "K", label: "Kurs" },
      { key: "D", label: "Dozentin" }
    ],
    keyAttrs: ["S", "K"],
    sampleRows: [
      ["Anna", "Datenbanken", "Döhring"],
      ["Bilal", "Datenbanken", "Döhring"],
      ["Anna", "Statistik", "Krause"],
      ["Cem", "Datenbanken", "Fischer"],
      ["Cem", "Statistik", "Krause"]
    ],
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
