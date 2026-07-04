/* ==========================================================================
   SQL EDITOR
   CodeMirror 6 wrapper: SQL syntax highlighting, line numbers, Mod-Enter to run.
   Exposed on window.SqlEditor so the classic (non-module) db-page.js can use it.
   ========================================================================== */

import { EditorView, basicSetup } from "codemirror";
import { EditorState, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { sql, SQLite } from "@codemirror/lang-sql";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#d9a441", fontWeight: "600" },
  { tag: [tags.name, tags.propertyName], color: "#e9ebee" },
  { tag: [tags.string, tags.special(tags.string)], color: "#4fbf9c" },
  { tag: tags.number, color: "#e0654f" },
  { tag: tags.comment, color: "#626c7d", fontStyle: "italic" },
  { tag: tags.operator, color: "#9aa3b2" },
  { tag: tags.punctuation, color: "#9aa3b2" }
]);

const theme = EditorView.theme({
  "&": {
    color: "#e9ebee",
    backgroundColor: "transparent",
    fontSize: "14.5px"
  },
  ".cm-content": {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    padding: "16px",
    caretColor: "#d9a441"
  },
  ".cm-scroller": { lineHeight: "1.6" },
  "&.cm-focused": { outline: "none" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "#626c7d",
    border: "none"
  },
  ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.03)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "#9aa3b2" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(217,164,65,0.2) !important"
  },
  ".cm-cursor": { borderLeftColor: "#d9a441" }
}, { dark: true });

function createSqlEditor(container, { onRun, doc = "" } = {}) {
  const runKeymap = Prec.highest(keymap.of([
    {
      key: "Mod-Enter",
      run: () => { if (onRun) onRun(); return true; }
    }
  ]));

  const view = new EditorView({
    parent: container,
    state: EditorState.create({
      doc,
      extensions: [
        basicSetup,
        runKeymap,
        sql({ dialect: SQLite }),
        syntaxHighlighting(highlightStyle),
        theme,
        EditorView.lineWrapping
      ]
    })
  });

  return {
    getValue: () => view.state.doc.toString(),
    setValue: (text) => view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: text }
    }),
    focus: () => view.focus()
  };
}

window.SqlEditor = { createSqlEditor };
