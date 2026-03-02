"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CodeGenerator() {
  const [count, setCount] = useState(100);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/admin/generate-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert((data?.error || "Erro") + (data?.details ? "\n" + data.details : ""));
      setLoading(false);
      return;
    }

    alert(`✅ Gerados ${data.created} códigos`);
    setLoading(false);
    router.refresh(); // atualiza métricas do admin
  }

  return (
    <div style={{ marginTop: 20, border: "1px solid #ddd", borderRadius: 10, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Gerar códigos</h3>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="number"
          value={count}
          min={1}
          max={1000}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ padding: 10, width: 140 }}
        />
        <button
          onClick={generate}
          disabled={loading}
          style={{ padding: "10px 14px", background: "black", color: "white", borderRadius: 8 }}
        >
          {loading ? "Gerando..." : "Gerar"}
        </button>

        <button
          onClick={() => setCount(100)}
          disabled={loading}
          style={{ padding: "10px 14px", borderRadius: 8 }}
        >
          100
        </button>
      </div>

      <p style={{ marginBottom: 0, marginTop: 10, fontSize: 12, color: "#555" }}>
        Dica: use 100 por lote. Se estiver vendendo muito, gere 300 ou 500.
      </p>
    </div>
  );
}