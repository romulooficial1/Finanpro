export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { message, financialData } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "Mensagem vazia" });
  }

  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAIAPIKEY}`
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      input: `
Você é a IA Financeira Premium do FinanPro.

Analise profundamente os dados financeiros do usuário.

Sempre:
- Calcule receitas, despesas, saldo e taxa de poupança.
- Identifique padrões de gastos.
- Aponte riscos financeiros.
- Destaque oportunidades de economia.
- Avalie metas e orçamentos quando existirem.
- Dê prioridades claras do que fazer primeiro.
- Responda no mesmo idioma da pergunta do usuário.
- Use títulos e listas quando necessário.
- Nunca invente dados.

Estrutura da resposta:
1. Diagnóstico geral
2. Pontos fortes
3. Pontos de atenção
4. Prioridade de ação
5. Próximos passos

Dados do usuário:
${JSON.stringify(financialData || {})}

Pergunta:
${message}
      `
    })
  });

  const data = await r.json();

if (!r.ok) {
  return res.status(r.status).json({
    error: data.error?.message || "Erro na OpenAI",
    details: data
  });
}

const reply =
  data.output?.[0]?.content?.[0]?.text ||
  data.output_text ||
  "Não consegui responder agora.";

res.status(200).json({
  reply
});
}
