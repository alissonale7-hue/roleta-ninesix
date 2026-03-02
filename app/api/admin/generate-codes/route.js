import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function makeCode(len = 8) {
  // 8 chars hex = 4 bytes; aqui vamos gerar mais e cortar
  return crypto.randomBytes(16).toString("hex").slice(0, len).toUpperCase();
}

export async function POST(req) {
  try {
    const body = await req.json();
    const count = Math.min(Math.max(Number(body?.count || 100), 1), 1000); // 1..1000

    // gerar lista
    const rows = Array.from({ length: count }, () => ({ code: makeCode(8) }));

    // inserir (se colidir unique, pode falhar; para simplicidade, geramos “suficiente”)
    const { error } = await supabase.from("codes").insert(rows);

    if (error) {
      return NextResponse.json(
        { error: "Falha ao gerar códigos", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, created: count });
  } catch {
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 });
  }
}