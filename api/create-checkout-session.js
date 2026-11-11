const { Stripe } = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define your product plans and prices directly in code!
// Whenever you change the price here, Stripe Checkout updates automatically.
const PLANS = {
  starter: {
    name: "LeadHarvest Starter Credit Pack (1,000 Verified Leads)",
    description: "1,000 Verified Malaysian B2B Business Records with Direct WhatsApp Links (CSV/Excel)",
    unit_amount: 4900, // RM 49.00 (in sen)
  },
  pro: {
    name: "LeadHarvest Pro Growth Pack (3,000 Verified Leads)",
    description: "3,000 Verified Malaysian B2B Business Records + Nationwide Coverage (CSV/Excel)",
    unit_amount: 11900, // RM 119.00 (in sen)
  },
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const mode = "payment";
    const domain = process.env.DOMAIN || "https://leadharvestmy.com";
    const selectedTier = req.body?.planTier === "pro" ? PLANS.pro : PLANS.starter;

    const sessionParams = {
      ui_mode: "hosted_page",
      mode,
      payment_method_types: ["card", "fpx"], // Credit/Debit Card + Malaysian FPX Online Banking
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: false,
      },
      automatic_tax: {
        enabled: false,
      },
      allow_promotion_codes: false,
      submit_type: "auto",
      integration_identifier: "hosted_web_0001",
      origin_context: "web",
      customer_email: req.body?.customerEmail || undefined,
      invoice_creation: {
        enabled: true, // Automatically generates official Stripe PDF Invoice
      },
      success_url: `${domain}/?success=true&plan=${req.body?.planTier || "starter"}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/?canceled=true`,
      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: selectedTier.name,
              description: selectedTier.description,
            },
            unit_amount: selectedTier.unit_amount,
          },
          quantity: 1,
        },
      ],
    };

    if (mode === "subscription") {
      sessionParams.payment_method_collection = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.redirect(303, session.url);
  } catch (err) {
    console.error("Stripe Checkout Session Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
