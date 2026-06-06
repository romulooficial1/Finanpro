export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const apiKey = process.env.RESENDAPIKEY;
    const { name, email } = req.body || {};

    if (!apiKey) {
      return res.status(500).json({ error: "RESENDAPIKEY não configurada" });
    }

    if (!email) {
      return res.status(400).json({ error: "E-mail não enviado" });
    }

    const userName = name || "usuário";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "FinanPro <onboarding@resend.dev>",
        to: email,
        subject: "Bem-vindo ao FinanPro 🎉",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px;color:#17211c">
            <h1 style="color:#166534">Bem-vindo ao FinanPro 🎉</h1>
            <p>Olá, <strong>${userName}</strong>!</p>
            <p>Sua conta foi criada com sucesso.</p>
            <p>Agora você pode organizar receitas, despesas, metas, dívidas e acompanhar sua vida financeira em um só lugar.</p>
            <a href="https://finanpro-five.vercel.app/" style="display:inline-block;background:#166534;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
              Acessar FinanPro
            </a>
            <p style="margin-top:24px;color:#66736b;font-size:13px">Equipe FinanPro</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao enviar e-mail de boas-vindas",
      details: error.message
    });
  }
}
