"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "sans-serif", background: "#f8fafc" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#0f172a", marginBottom: "0.5rem" }}>Something went wrong!</h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>An unexpected application error occurred.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.375rem",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontWeight: 500
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
