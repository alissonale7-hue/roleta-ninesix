"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Senha incorreta.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial" }}>
      <div style={{ width: 360, padding: 20, border: "1px solid #ccc", borderRadius: 10 }}>
        <h1>Login Admin</h1>
        <p>Digite a senha para acessar o painel.</p>

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", padding: 10, marginTop: 12, background: "black", color: "white", borderRadius: 6 }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}