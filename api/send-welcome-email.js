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
          <div style="margin:0;padding:0;background:#f3f7f4;font-family:Arial,Helvetica,sans-serif;color:#17211c;">
            <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
              
              <div style="background:linear-gradient(135deg,#166534,#0f766e);border-radius:18px 18px 0 0;padding:34px 28px;text-align:center;color:white;">
                <div style="width:58px;height:58px;border-radius:16px;background:rgba(255,255,255,0.16);display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;margin-bottom:14px;">
                  FP
                </div>
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:900;">
                  Bem-vindo ao FinanPro 🎉
                </h1>
                <p style="margin:10px 0 0;color:rgba(255,255,255,0.86);font-size:15px;line-height:1.6;">
                  Sua nova central financeira inteligente já está pronta para uso.
                </p>
              </div>

              <div style="background:#ffffff;border:1px solid #dce4dc;border-top:0;border-radius:0 0 18px 18px;padding:30px 28px;box-shadow:0 18px 45px rgba(23,33,28,0.08);">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                  Olá, <strong>${userName}</strong>!
                </p>

                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#2d3d35;">
                  Sua conta foi criada com sucesso. Agora você pode organizar suas receitas, despesas, metas, dívidas e acompanhar sua vida financeira em um só lugar.
                </p>

                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:18px;margin:22px 0;">
                  <p style="margin:0 0 10px;font-weight:800;color:#166534;font-size:15px;">
                    Com o FinanPro você pode:
                  </p>
                  <ul style="margin:0;padding-left:20px;color:#2d3d35;font-size:14px;line-height:1.8;">
                    <li>Controlar entradas e saídas com clareza</li>
                    <li>Acompanhar metas financeiras</li>
                    <li>Organizar dívidas e orçamentos</li>
                    <li>Visualizar relatórios e gráficos</li>
                    <li>Usar IA financeira para receber insights</li>
                  </ul>
                </div>

                <div style="text-align:center;margin:28px 0 22px;">
                  <a href="https://finanpro-five.vercel.app/" style="display:inline-block;background:#166534;color:white;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:900;font-size:15px;">
                    Acessar minha conta
                  </a>
                </div>

                <p style="margin:0;color:#66736b;font-size:13px;line-height:1.6;text-align:center;">
                  Obrigado por fazer parte do FinanPro. Estamos felizes em ter você aqui. 💚
                </p>

                <div style="height:1px;background:#e8f0e8;margin:24px 0;"></div>

                <p style="margin:0;color:#8a958d;font-size:12px;line-height:1.6;text-align:center;">
                  Este e-mail foi enviado automaticamente após a criação da sua conta.<br>
                  Equipe FinanPro
                </p>
              </div>

            </div>
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
