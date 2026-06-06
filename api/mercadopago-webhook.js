import admin from "firebase-admin";

function getFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const serviceAccount = JSON.parse(
    process.env.FIREBASESERVICEACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return admin;
}

async function enviarEmailPremium({ email, name }) {
  try {
    const apiKey = process.env.RESENDAPIKEY;

    if (!apiKey || !email) return;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "FinanPro <onboarding@resend.dev>",
        to: email,
        subject: "Seu FinanPro Premium foi ativado 🚀",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:24px;color:#17211c">
            <h1 style="color:#166534">Premium ativado com sucesso 🚀</h1>
            <p>Olá, <strong>${name || "usuário"}</strong>!</p>
            <p>Seu pagamento foi aprovado e o seu acesso ao <strong>FinanPro Premium</strong> já está liberado.</p>
            <p>Agora você pode aproveitar todos os recursos premium para organizar melhor sua vida financeira.</p>
            <a href="https://finanpro-five.vercel.app/" style="display:inline-block;background:#166534;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">
              Acessar FinanPro
            </a>
            <p style="margin-top:24px;color:#66736b;font-size:13px">Obrigado por apoiar o FinanPro 💚</p>
          </div>
        `
      })
    });
  } catch (error) {
    console.warn("Erro ao enviar e-mail premium:", error.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const accessToken = process.env.MPACCESSTOKEN;

    const paymentId =
      req.body?.data?.id ||
      req.body?.id ||
      req.query?.id;

    if (!paymentId) {
      return res.status(200).json({ ok: true, message: "Sem paymentId" });
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const payment = await paymentResponse.json();

    if (!paymentResponse.ok) {
      return res.status(400).json(payment);
    }

    if (payment.status !== "approved") {
      return res.status(200).json({
        ok: true,
        status: payment.status
      });
    }

    const uid =
      payment.external_reference ||
      payment.metadata?.uid;

    const email = payment.metadata?.email || payment.payer?.email || "";

    if (!uid) {
      return res.status(400).json({
        error: "UID não encontrado no pagamento"
      });
    }

    const firebase = getFirebaseAdmin();
    const db = firebase.firestore();

    const userName = email ? email.split("@")[0] : "usuário";

    await db.collection("users").doc(uid).set(
      {
        premium: true,
        plan: "premium",
        subscription: {
          plan: "premium",
          status: "active",
          source: "cloud",
          provider: "mercadopago",
          mercadoPagoPaymentId: String(paymentId),
          email,
          amount: payment.transaction_amount || 9.9,
          currency: payment.currency_id || "BRL",
          verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      { merge: true }
    );

    await enviarEmailPremium({
      email,
      name: userName
    });

    return res.status(200).json({
      ok: true,
      premiumLiberado: true,
      emailEnviado: Boolean(email),
      uid
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erro no webhook Mercado Pago",
      details: error.message
    });
  }
}
