

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Informe nome e WhatsApp." },
        { status: 400 }
      );
    }

    // 1) pegar 1 código disponível (não usado e ainda não emitido)
    const { data: codeRow, error: pickErr } = await supabase
      .from("codes")
      .select("*")
      .eq("used", false)
      .is("issued_at", null)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (pickErr) {
      return NextResponse.json(
        { error: "Erro ao buscar código disponível.", details: pickErr.message },
        { status: 500 }
      );
    }

    if (!codeRow) {
      return NextResponse.json(
        { error: "Sem códigos disponíveis. Gere/adicione mais códigos." },
        { status: 400 }
      );
    }

    const now = new Date();
    const redeemUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 2) marcar como emitido (issued)
    const { data: updated, error: updErr } = await supabase
      .from("codes")
      .update({
        issued_at: now.toISOString(),
        redeem_until: redeemUntil.toISOString(),
        issued_to_name: name,
        issued_to_phone: phone,
      })
      .eq("id", codeRow.id)
      .eq("used", false)
      .is("issued_at", null)
      .select("code, issued_at, redeem_until, issued_to_name, issued_to_phone")
      .single();

    if (updErr) {
      return NextResponse.json(
        { error: "Erro ao emitir o código.", details: updErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ...updated });
  } catch (e) {
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}