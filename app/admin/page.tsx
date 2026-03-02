import { createClient } from "@supabase/supabase-js";

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: spins = [] } = await supabase
    .from("spins")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: codes = [] } = await supabase.from("codes").select("*");

  const totalCodes = codes.length;
  const usedCodes = codes.filter((c: any) => c.used).length;
  const availableCodes = totalCodes - usedCodes;

  const prizesCount: Record<string, number> = {};
  spins.forEach((s: any) => {
    prizesCount[s.prize] = (prizesCount[s.prize] || 0) + 1;
  });

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>Painel Administrativo</h1>

      {/* DASHBOARD */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 20 }}>
        <Card title="Total de Giros" value={spins.length} />
        <Card title="Códigos Disponíveis" value={availableCodes} />
        <Card title="Códigos Usados" value={usedCodes} />
        <Card
          title="Taxa de Uso"
          value={totalCodes ? ((usedCodes / totalCodes) * 100).toFixed(1) + "%" : "0%"}
        />
      </div>

      {/* EXPORT */}
      <div style={{ marginTop: 20 }}>
        <a
          href="/api/export"
          style={{
            padding: 10,
            background: "black",
            color: "white",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Exportar CSV
        </a>
      </div>

      {/* GRÁFICO SIMPLES */}
      <h2 style={{ marginTop: 40 }}>Prêmios Distribuídos</h2>
      <ul>
        {Object.entries(prizesCount).map(([prize, count]) => (
          <li key={prize}>
            {prize}: {count}
          </li>
        ))}
      </ul>

      {/* TABELA */}
      <h2 style={{ marginTop: 40 }}>Últimos Giros</h2>

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
              <td>{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 20,
        borderRadius: 10,
        minWidth: 180,
      }}
    >
      <div style={{ fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}