import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export const MONO = "var(--font-stack-mono)";
export const SERIF = "var(--font-stack-serif)";

/** Product-branded card shell every fragment sits in. */
export function FCard({
  w,
  accent,
  name,
  children,
}: {
  w: number;
  accent: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: `min(100%, ${w}px)`,
        background: "var(--surface)",
        border: "1px solid var(--border2)",
        borderRadius: 14,
        boxShadow: "0 12px 32px -14px rgba(3,8,18,.4)",
        overflow: "hidden",
        textAlign: "left",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface2)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            background: accent,
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 10,
            fontWeight: 800,
            fontFamily: MONO,
          }}
        >
          {name.charAt(0)}
        </span>
        <span style={{ fontWeight: 700, fontSize: 12.5 }}>{name}</span>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>{children}</div>
    </div>
  );
}

export function FLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: ".07em",
        textTransform: "uppercase",
        color: "var(--faint)",
        margin: "10px 0 5px",
      }}
    >
      {children}
    </div>
  );
}

export function FInput({
  accent,
  error,
  styleX,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  accent: string;
  error?: boolean;
  styleX?: CSSProperties;
}) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: 38,
        borderRadius: 9,
        border: `1.5px solid ${error ? "#ff7a6b" : "var(--border2)"}`,
        background: "var(--surface2)",
        padding: "0 12px",
        fontSize: 13.5,
        outline: "none",
        ...styleX,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = accent || "var(--accent)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? "#ff7a6b" : "var(--border2)";
      }}
    />
  );
}

export function FButton({
  label,
  onClick,
  accent,
  full,
  small,
  disabled,
  styleX,
}: {
  label: ReactNode;
  onClick: () => void;
  accent: string;
  full?: boolean;
  small?: boolean;
  disabled?: boolean;
  styleX?: CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!!disabled}
      style={{
        width: full ? "100%" : "auto",
        height: small ? 32 : 40,
        padding: small ? "0 13px" : "0 18px",
        border: "none",
        borderRadius: 9,
        background: accent,
        color: "#fff",
        fontWeight: 700,
        fontSize: small ? 12.5 : 13.5,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: `0 8px 18px -8px ${accent}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...styleX,
      }}
    >
      {label}
    </button>
  );
}

export function FGhostButton({
  label,
  onClick,
  small,
}: {
  label: ReactNode;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: small ? 32 : 40,
        padding: small ? "0 13px" : "0 16px",
        borderRadius: 9,
        border: "1.5px solid var(--border2)",
        background: "transparent",
        color: "var(--dim)",
        fontWeight: 600,
        fontSize: small ? 12.5 : 13.5,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function FLink({
  label,
  onClick,
  accent,
}: {
  label: ReactNode;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        margin: "10px auto 0",
        border: "none",
        background: "transparent",
        color: accent,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export function FSeg({
  opts,
  cur,
  onPick,
  accent,
}: {
  opts: string[];
  cur: string;
  onPick: (value: string) => void;
  accent: string;
}) {
  return (
    <div
      role="tablist"
      style={{
        display: "inline-flex",
        gap: 2,
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: 9,
        padding: 2,
      }}
    >
      {opts.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={o === cur}
          onClick={() => onPick(o)}
          style={{
            border: "none",
            cursor: "pointer",
            borderRadius: 7,
            padding: "4px 11px",
            fontSize: 11.5,
            fontWeight: 700,
            fontFamily: MONO,
            background: o === cur ? accent : "transparent",
            color: o === cur ? "#fff" : "var(--dim)",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function FToggle({
  on,
  onClick,
  accent,
  label,
}: {
  on: boolean;
  onClick: () => void;
  accent: string;
  label?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={!!on}
      aria-label={label || "toggle"}
      onClick={onClick}
      style={{
        width: 40,
        height: 23,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        position: "relative",
        background: on ? accent : "var(--border2)",
        transition: "background .2s",
        flex: "0 0 auto",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2.5,
          left: on ? 19.5 : 2.5,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .2s cubic-bezier(.3,1.4,.5,1)",
          boxShadow: "0 1px 3px rgba(0,0,0,.3)",
        }}
      />
    </button>
  );
}

export function FDone({
  accent,
  title,
  sub,
  resetLabel,
  onReset,
}: {
  accent: string;
  title: string;
  sub: string;
  resetLabel?: string;
  onReset?: () => void;
}) {
  const rm = useReducedMotion();
  return (
    <div
      style={{
        textAlign: "center",
        padding: "14px 6px 6px",
        animation: rm ? "none" : "popIn .3s cubic-bezier(.3,1.3,.5,1)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: `${accent}1e`,
          border: `2px solid ${accent}`,
          color: accent,
          display: "grid",
          placeItems: "center",
          fontSize: 24,
          fontWeight: 800,
          margin: "0 auto 12px",
        }}
      >
        ✓
      </div>
      <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 4, textWrap: "pretty" }}>
        {sub}
      </div>
      {onReset && resetLabel ? (
        <FLink label={resetLabel} onClick={onReset} accent={accent} />
      ) : null}
    </div>
  );
}
