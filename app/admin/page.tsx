import DashboardCharts from "./DashboardCharts";
import CodeGenerator from "./CodeGenerator";
import { createClient } from "@supabase/supabase-js";

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: spinsData } = await supabase
    .from("spins")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: codesData } = await supabase.from("codes").select("*");

  const spins = spinsData ?? [];
  const codes = codesData ?? [];

  const totalCodes = codes.length;
  const usedCodes = codes.filter((c: any) => c.used).length;
  const availableCodes = totalCodes - usedCodes;

  const prizesCount: Record<string, number> = {};
  spins.forEach((s: any) => {
    const key = s.prize || "Sem prêmio";
    prizesCount[key] = (prizesCount[key] || 0) + 1;
  });

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1 style={{ marginTop: 0 }}>Painel Administrativo</h1>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 14 }}>
        <Card title="Total de giros" value={spins.length} />
        <Card title="Códigos disponíveis" value={availableCodes} />
        <Card title="Códigos usados" value={usedCodes} />
        <Card
          title="Taxa de uso"
          value={totalCodes ? ((usedCodes / totalCodes) * 100).toFixed(1) + "%" : "0%"}
        />
      </div>

      <CodeGenerator />
      <DashboardCharts prizesCount={prizesCount} />

      <h2 style={{ marginTop: 30 }}>Últimos giros</h2>
      <div style={{ overflowX: "auto" }}>
        <table border={1} cellPadding={8} style={{ width: "100%", marginTop: 10 }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>WhatsApp</th>
              <th>Código</th>
              <th>Prêmio</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {spins.map((s: any) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.phone}</td>
                <td>{s.code}</td>
                <td>{s.prize}</td>
                <td>{s.created_at ? new Date(s.created_at).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        minWidth: 180,
        background: "white",
      }}
    >
      <div style={{ fontSize: 12, color: "#555" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}