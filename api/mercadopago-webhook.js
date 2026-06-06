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

    return res.status(200).json({
      ok: true,
      premiumLiberado: true,
      uid
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erro no webhook Mercado Pago",
      details: error.message
    });
  }
}
