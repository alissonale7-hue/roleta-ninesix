"use client";

import { useState } from "react";

const prizes = [
  { label: "5% de Desconto", weight: 60 },
  { label: "Frete Grátis", weight: 20 },
  { label: "10% de Desconto", weight: 12 },
  { label: "Smartwatch", weight: 6 },
  { label: "12x Sem Juros", weight: 2 },
];

function pickPrize() {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  const rand = Math.random() * total;
  let cumulative = 0;
  for (const prize of prizes) {
    cumulative += prize.weight;
    if (rand <= cumulative) return prize.label;
  }
  return prizes[0].label;
}

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSpin() {
    if (!name || !phone || !code) {
      alert("Preencha nome, WhatsApp e código.");
      return;
    }

    setLoading(true);

    // Sorteia o prêmio (só será confirmado se o backend validar o código)
    const prize = pickPrize();

    const response = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        code,
        prize,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data?.error || "Erro ao validar o código.");
      setLoading(false);
      return;
    }

    setResult(prize);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-yellow-400 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-2">Roleta Premiada</h1>
      <p className="mb-8 text-center">Compras acima de R$300</p>

      <div className="w-full max-w-sm bg-zinc-900 border border-yellow-500 rounded-xl p-6 flex flex-col gap-3">
        <input
          className="p-3 rounded bg-black border border-yellow-500"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="p-3 rounded bg-black border border-yellow-500"
          placeholder="Seu WhatsApp"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="p-3 rounded bg-black border border-yellow-500"
          placeholder="Seu código"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />

        <button
          onClick={handleSpin}
          disabled={loading}
          className="mt-2 p-3 rounded bg-yellow-500 text-black font-bold disabled:opacity-50"
        >
          {loading ? "Validando..." : "Girar Roleta"}
        </button>

        {result && (
          <div className="mt-4 text-center text-xl font-semibold">
            🎉 Você ganhou: {result}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-zinc-400 text-center max-w-sm">
        Observação: o giro só é confirmado após validação do código.
      </p>
    </div>
  );
}