const { Client, Environment } = require('square');

const squareClient = new Client({
  environment: Environment.Production,
  accessToken: process.env.SQUARE_PRODUCTION_ACCESS_TOKEN,
});

const paymentsApi = squareClient.paymentsApi;

module.exports = async (req, res) => {

  // Autorisation CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Méthode non autorisée'
    });
  }

  const {
    sourceId,
    verificationToken,
    amount,
    orderId
  } = req.body;

  if (!sourceId || !verificationToken || !amount || !orderId) {
    return res.status(400).json({
      success: false,
      error: 'Paramètres manquants'
    });
  }

  try {

    const response = await paymentsApi.createPayment({
      sourceId,
      verificationToken,
      idempotencyKey: orderId,

      amountMoney: {
        amount: Number(amount),
        currency: 'EUR',
      },
    });

    const payment = response.result.payment;

    console.log('Paiement Square OK');
    console.log(payment.id);

    return res.status(200).json({
      success: payment.status === 'COMPLETED',
      paymentId: payment.id,
      status: payment.status,
    });

  } catch (error) {

    console.error('Erreur Square :', error);

    return res.status(500).json({
      success: false,
      error: 'Erreur serveur Square'
    });
  }
};
