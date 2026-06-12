import type { ReactNode } from "react";
import type { FragmentMeta } from "@/lib/content";
import { MONO } from "@/components/fragments/ui";

const KW =
  /\b(const|let|var|function|return|if|else|for|while|export|import|from|default|class|extends|new|await|async|type|interface|of|in|null|true|false|void|useState|useRef|useMemo)\b/g;
const STR = /(`[^`]*`|'[^']*'|"[^"]*")/g;

/** The design's own tiny highlighter — keywords, strings, comments. */
function highlight(line: string, accent: string): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;
  let code = line;
  let comment: string | null = null;
  const ci = line.indexOf("//");
  if (ci >= 0) {
    code = line.slice(0, ci);
    comment = line.slice(ci);
  }
  const pushPlain = (txt: string) => {
    let l2 = 0;
    let mm: RegExpExecArray | null;
    KW.lastIndex = 0;
    while ((mm = KW.exec(txt))) {
      if (mm.index > l2) out.push(txt.slice(l2, mm.index));
      out.push(
        <span key={key++} style={{ color: "#c9a6ff" }}>
          {mm[0]}
        </span>,
      );
      l2 = mm.index + mm[0].length;
    }
    if (l2 < txt.length) out.push(txt.slice(l2));
  };
  let last = 0;
  let m: RegExpExecArray | null;
  STR.lastIndex = 0;
  while ((m = STR.exec(code))) {
    if (m.index > last) pushPlain(code.slice(last, m.index));
    out.push(
      <span key={key++} style={{ color: accent }}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) pushPlain(code.slice(last));
  if (comment)
    out.push(
      <span key={key++} style={{ color: "#5e6b84", fontStyle: "italic" }}>
        {comment}
      </span>,
    );
  return out;
}

export function CodeView({ frag }: { frag: FragmentMeta }) {
  const code = frag.code;
  const lines = code.src.replace(/\n+$/, "").split("\n");
  return (
    <div style={{ background: "#0b0f1a", fontFamily: MONO }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "9px 14px",
          borderBottom: "1px solid rgba(151,173,214,.12)",
          background: "#0e1322",
        }}
      >
        <span aria-hidden="true" style={{ display: "flex", gap: 6 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </span>
        <span style={{ fontSize: 11.5, color: "#aeb9d4", marginLeft: 4 }}>{code.file}</span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 600,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: frag.accent,
            border: `1px solid color-mix(in srgb, ${frag.accent} 40%, transparent)`,
            borderRadius: 5,
            padding: "2px 7px",
          }}
        >
          {code.lang}
        </span>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "14px 6px 16px 0",
          overflowX: "auto",
          fontSize: 12.5,
          lineHeight: 1.65,
          color: "#cdd6ea",
        }}
      >
        {lines.map((ln, i) => (
          <div key={i} style={{ display: "flex", whiteSpace: "pre" }}>
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: 44,
                textAlign: "right",
                paddingRight: 16,
                color: "#3c4660",
                flex: "0 0 auto",
              }}
            >
              {i + 1}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>{highlight(ln, frag.accent)}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}
