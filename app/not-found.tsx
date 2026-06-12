import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "60px 16px", textAlign: "center", color: "var(--dim)", fontSize: 13.5 }}>
      <p style={{ margin: 0 }}>Nothing here — yet. That&apos;s usually where I come in.</p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          marginTop: 16,
          height: 36,
          padding: "0 16px",
          borderRadius: 9,
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
          textDecoration: "none",
        }}
      >
        Back to the workspace
      </Link>
    </div>
  );
}
