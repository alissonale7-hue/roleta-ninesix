"use client";
import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [validUntil, setValidUntil] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setResult(null);
    setReceiptId(null);
    setValidUntil(null);

    if (!name.trim() || !phone.trim() || !code.trim()) {
      setError("Preencha nome, WhatsApp e código.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          code: code.trim().toUpperCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Erro ao validar código.");
        setLoading(false);
        return;
      }

      setResult(`🎉 Você ganhou: ${data.prize}`);
      setReceiptId(data.receipt_id);
      setValidUntil(data.valid_until);

      setLoading(false);
    } catch (err) {
      setError("Erro ao comunicar com o servidor.");
      setLoading(false);
    }
  }

  function handleSendWhatsApp() {
    if (!result || !receiptId || !validUntil) return;

    const validDate = new Date(validUntil).toLocaleDateString("pt-BR");
    const prizeText = result.replace("🎉 Você ganhou: ", "");
    const codeText = code.trim().toUpperCase();

    const text =
      "Comprovante Nine Six Premium\n" +
      `Resgate: ${receiptId}\n` +
      `Prêmio: ${prizeText}\n` +
      `Código: ${codeText}\n` +
      `Válido até: ${validDate}`;

    const url =
      "https://wa.me/5547992469958?text=" + encodeURIComponent(text);

    window.location.href = url;
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>Resgate de Benefício</h1>

        <input
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        <input
          placeholder="Seu WhatsApp"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={input}
        />

        <input
          placeholder="Seu código"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={input}
        />

        <button onClick={handleSubmit} disabled={loading} style={button}>
          {loading ? "Validando..." : "Confirmar benefício"}
        </button>

        {error && <div style={errorStyle}>{error}</div>}

        {result && <div style={successStyle}>{result}</div>}

        {result && receiptId && validUntil && (
          <button
            onClick={handleSendWhatsApp}
            style={{ ...button, background: "#222", color: "#f5c542", marginTop: 12 }}
          >
            Enviar comprovante no WhatsApp
          </button>
        )}

        <p style={obs}>
          O benefício só é confirmado após validação do código.
        </p>
      </div>
    </div>
  );
}

const container: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0b0b0b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: "#111",
  padding: 24,
  borderRadius: 16,
  border: "1px solid #f5c54255",
  textAlign: "center",
};

const title: React.CSSProperties = {
  color: "#f5c542",
  marginBottom: 20,
  fontSize: 28,
  fontWeight: 800,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#0b0b0b",
  color: "#f5c542",
  outline: "none",
};

const button: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "none",
  background: "#f5c542",
  fontWeight: 800,
  cursor: "pointer",
  color: "#111",
  marginTop: 4,
};

const errorStyle: React.CSSProperties = {
  marginTop: 12,
  color: "#ff6b6b",
  fontWeight: 700,
};

const successStyle: React.CSSProperties = {
  marginTop: 12,
  color: "#7CFF7C",
  fontWeight: 800,
};

const obs: React.CSSProperties = {
  marginTop: 16,
  fontSize: 12,
  color: "#bfa24b",
};