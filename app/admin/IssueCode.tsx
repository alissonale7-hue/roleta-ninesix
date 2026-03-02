

"use client";
import { useState } from "react";

export default function IssueCode() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [redeemUntil, setRedeemUntil] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function issue() {
    setError(null);
    setIssuedCode(null);
    setRedeemUntil(null);

    if (!name.trim() || !phone.trim()) {
      setError("Preencha nome e WhatsApp.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/issue-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao emitir código.");
        setLoading(false);
        return;
      }

      setIssuedCode(data.code);
      setRedeemUntil(data.redeem_until);
      setLoading(false);
    } catch {
      setError("Falha ao comunicar com o servidor.");
      setLoading(false);
    }
  }

  function copy() {
    if (!issuedCode) return;
    navigator.clipboard.writeText(issuedCode);
  }

  return (
    <div
      style={{
        marginTop: 18,
        padding: 16,
        border: "1px solid #ddd",
        borderRadius: 12,
        background: "white",
        maxWidth: 520,
      }}
    >
      <h2 style={{ marginTop: 0 }}>Emitir código (1 clique)</h2>

      <input
        placeholder="Nome do cliente"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={input}
      />

      <input
        placeholder="WhatsApp do cliente"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={input}
      />

      <button onClick={issue} disabled={loading} style={btn}>
        {loading ? "Emitindo..." : "Emitir próximo código"}
      </button>

      {error && <div style={{ marginTop: 10, color: "#b00020", fontWeight: 700 }}>{error}</div>}

      {issuedCode && redeemUntil && (
        <div style={{ marginTop: 14, borderTop: "1px solid #eee", paddingTop: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Código: {issuedCode}</div>
          <div style={{ marginTop: 6 }}>
            Resgatar até:{" "}
            <b>{new Date(redeemUntil).toLocaleString("pt-BR")}</b>
          </div>

          <button onClick={copy} style={{ ...btn, marginTop: 10 }}>
            Copiar código
          </button>

          <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
            Dica: cole esse código na conversa do WhatsApp junto do link do resgate.
          </div>
        </div>
      )}
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ccc",
  marginBottom: 10,
};

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  background: "#111",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};