export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const accessToken = process.env.MPACCESSTOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error: "Token do Mercado Pago não configurado"
      });
    }

    const { uid, email } = req.body || {};

if (!uid) {
  return res.status(400).json({
    error: "UID do usuário não enviado"
  });
}

const preference = {
  external_reference: uid,
  metadata: {
    uid,
    email: email || ""
  },
      items: [
        {
          title: "FinanPro Premium",
          quantity: 1,
          currency_id: "BRL",
          unit_price: 9.9
        }
      ],
      back_urls: {
        success: "https://finanpro-five.vercel.app/?premium=success",
        failure: "https://finanpro-five.vercel.app/?premium=failure",
        pending: "https://finanpro-five.vercel.app/?premium=pending"
      },
      auto_return: "approved"
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      init_point: data.init_point,
      id: data.id
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erro ao criar pagamento",
      details: error.message
    });
  }
}
