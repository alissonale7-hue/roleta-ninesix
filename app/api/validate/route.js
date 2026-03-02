import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function makeReceiptId() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `NSX-${yyyy}-${rand}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    const code = String(body?.code || "").trim().toUpperCase();

    // IP e UA (opcional)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const user_agent = req.headers.get("user-agent") || null;

    if (!name || !phone || !code) {
      return NextResponse.json(
        { error: "Preencha nome, WhatsApp e código." },
        { status: 400 }
      );
    }

    // 1) buscar código
    const { data: codeRow, error: codeErr } = await supabase
      .from("codes")
      .select("*")
      .eq("code", code)
      .single();

    if (codeErr || !codeRow) {
      return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }

    if (codeRow.used) {
      return NextResponse.json(
        { error: "Esse código já foi usado." },
        { status: 400 }
      );
    }

    // 2) checar se foi emitido por você (issued_at e redeem_until)
    if (!codeRow.issued_at || !codeRow.redeem_until) {
      return NextResponse.json(
        { error: "Código ainda não foi liberado. Solicite um novo código." },
        { status: 400 }
      );
    }

    const now = new Date();
    const redeemUntil = new Date(codeRow.redeem_until);

    if (now > redeemUntil) {
      return NextResponse.json(
        { error: "Código expirado (7 dias). Solicite um novo código." },
        { status: 400 }
      );
    }

    // 3) sortear prêmio (use sua lógica atual aqui)
    // Se você já tem pesos no backend, mantém.
    // Se não tiver, comece simples (depois refinamos para pesos exatos):
    const prizes = [
      "5% desconto",
      "Frete grátis",
      "10% desconto",
      "Smartwatch",
      "12x sem juros",
    ];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];

    // 4) validade do cupom: 30 dias a partir do resgate
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 5) gerar comprovante
    const receipt_id = makeReceiptId();

    // 6) inserir resgate em spins
    const { data: spinInserted, error: spinErr } = await supabase
      .from("spins")
      .insert([
        {
          name,
          phone,
          code,
          prize,
          receipt_id,
          valid_until: validUntil.toISOString(),
          ip,
          user_agent,
        },
      ])
      .select("*")
      .single();

    if (spinErr) {
      return NextResponse.json(
        { error: "Erro ao salvar o resgate.", details: spinErr.message },
        { status: 500 }
      );
    }

    // 7) marcar code como usado
    const { error: usedErr } = await supabase
      .from("codes")
      .update({
        used: true,
        used_by_phone: phone,
        used_at: now.toISOString(),
      })
      .eq("code", code)
      .eq("used", false);

    if (usedErr) {
      return NextResponse.json(
        { error: "Erro ao marcar o código como usado.", details: usedErr.message },
        { status: 500 }
      );
    }

    // 8) retornar para o front montar comprovante
    return NextResponse.json({
      success: true,
      prize,
      receipt_id,
      valid_until: validUntil.toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro inesperado." },
      { status: 500 }
    );
  }
}