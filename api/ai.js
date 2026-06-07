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

Analise profundamente os dados financeiros do usuário com precisão profissional.
Considere receitas, despesas, metas, orçamentos, parcelamentos, tendências e riscos financeiros.

Sempre:
- Calcule receitas, despesas, saldo e taxa de poupança.
- Identifique padrões de gastos.
- Aponte riscos financeiros.
- Destaque oportunidades de economia.
- Avalie metas e orçamentos quando existirem.
- Dê prioridades claras do que fazer primeiro.

IMPORTANTE:
- Detecte automaticamente o idioma da pergunta.
- Responda SEMPRE no mesmo idioma da pergunta.
- Se a pergunta estiver em inglês, responda em inglês.
- Se a pergunta estiver em português, responda em português.
- Se a pergunta estiver em espanhol, responda em espanhol.
- Nunca traduza a resposta para outro idioma.
- O FinanPro é uma plataforma global.

Formato da resposta:
- Não use Markdown.
- Não use ##, ###, --- ou tabelas.
- Não use asteriscos **.
- Escreva em texto limpo, curto e organizado.
- Use no máximo 5 blocos com títulos simples.
- Use emojis moderadamente.
- Seja direto e evite respostas longas demais.
- Limite a resposta a no máximo 300 palavras.
- Foque apenas nas informações mais importantes.
- Use títulos curtos e listas simples quando necessário.
- Evite textos repetitivos.
- Nunca invente dados.

Estrutura da resposta:
Diagnóstico geral
Pontos fortes
Atenção
O que fazer primeiro
Próximos passos

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

let reply =
  data.output?.[0]?.content?.[0]?.text ||
  data.output_text ||
  "Não consegui responder agora.";

reply = reply
  .replace(/^#{1,6}\s*/gm, '')
  .replace(/\*\*/g, '')
  .replace(/---+/g, '')
  .replace(/^\s*[-*]\s+/gm, '• ')
  .trim();

res.status(200).json({
  reply
});
}
