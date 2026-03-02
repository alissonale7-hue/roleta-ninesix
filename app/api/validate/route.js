import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const code = String(body.code || "").trim().toUpperCase();
    const prize = String(body.prize || "").trim();

    if (!name || !phone || !code || !prize) {
      return NextResponse.json(
        { error: "Dados incompletos (nome, whatsapp, código e prêmio)." },
        { status: 400 }
      );
    }

    // 1) Buscar código
    const { data: codeData, error: codeError } = await supabase
      .from("codes")
      .select("code, used")
      .eq("code", code)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }

    if (codeData.used) {
      return NextResponse.json({ error: "Código já utilizado." }, { status: 400 });
    }

    // 2) Inserir em spins PRIMEIRO (se falhar, não gasta o código)
    const { error: spinError } = await supabase.from("spins").insert([
      {
        name,
        phone,
        code,
        prize,
        ip: req.headers.get("x-forwarded-for") || null,
        user_agent: req.headers.get("user-agent") || null,
      },
    ]);

    if (spinError) {
      return NextResponse.json(
        { error: "Erro ao salvar o giro (spins).", details: spinError.message },
        { status: 500 }
      );
    }

    // 3) Marcar código como usado SÓ depois do insert
    const { error: updError } = await supabase
      .from("codes")
      .update({
        used: true,
        used_at: new Date().toISOString(),
        used_by_phone: phone,
      })
      .eq("code", code);

    if (updError) {
      // Se falhar aqui, pelo menos o spin já ficou gravado
      return NextResponse.json(
        { error: "Spin salvo, mas falhou ao marcar código como usado.", details: updError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro inesperado no servidor." },
      { status: 500 }
    );
  }
}