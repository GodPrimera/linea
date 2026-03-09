"use client";

import { useEffect } from "react";

// global-error replaces the root layout entirely, so it must include
// its own <html> and <body> tags.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#09090b", fontFamily: "sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>

            <p style={{ fontSize: "8rem", lineHeight: 1, color: "#27272a", margin: "0 0 1rem" }}>
              500
            </p>

            <h1
              style={{
                fontFamily: "Georgia, serif",
                fontSize: "1.875rem",
                fontWeight: 300,
                color: "#f4f4f5",
                margin: "0 0 0.75rem",
              }}
            >
              Critical error
            </h1>

            <p
              style={{
                fontSize: "0.875rem",
                color: "#71717a",
                lineHeight: 1.6,
                margin: "0 0 2rem",
              }}
            >
              The application encountered a critical error and couldn't recover.
              {error.digest && (
                <span style={{ display: "block", marginTop: "0.5rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#3f3f46" }}>
                  Error ID: {error.digest}
                </span>
              )}
            </p>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  background: "#f4f4f5",
                  color: "#09090b",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  color: "#71717a",
                  border: "1px solid #27272a",
                  textDecoration: "none",
                }}
              >
                Go home
              </a>
            </div>

          </div>
        </div>
      </body>
    </html>
  );
}
