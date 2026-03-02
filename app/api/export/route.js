import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data } = await supabase.from("spins").select("*");

  const csv = [
    ["Nome", "WhatsApp", "Código", "Prêmio", "Data"],
    ...data.map((s) => [
      s.name,
      s.phone,
      s.code,
      s.prize,
      s.created_at,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="relatorio.csv"',
    },
  });
}