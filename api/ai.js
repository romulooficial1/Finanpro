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
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      input: `
Você é a IA financeira do FinanPro.
Responda em português claro, curto e útil.

Dados do usuário:
${JSON.stringify(financialData || {})}

Pergunta:
${message}
      `
    })
  });

  const data = await r.json();

  if (!r.ok) {
    return res.status(500).json({ error: data.error?.message || "Erro na OpenAI" });
  }

  res.status(200).json({
    reply: data.output_text || "Não consegui responder agora."
  });
}
