import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import Stripe from "stripe";
import { ENV } from "./env";
import { getDb } from "../db";
import { reportRequests } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./notification";
import { sendSMSNotification } from "../sms";

const stripe = new Stripe(ENV.stripeSecretKey || "", {
  apiVersion: "2025-11-17.clover",
});

const app = express();

// Stripe webhook route - MUST be before express.json() middleware
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, ENV.stripeWebhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send("Webhook signature verification failed");
  }

  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log("[Webhook] Received event:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const requestId = session.metadata?.request_id;
      
      if (requestId) {
        try {
          const db = await getDb();
          if (db) {
            await db.update(reportRequests)
              .set({
                paymentStatus: "paid",
                amountPaid: session.amount_total || 19900,
                stripePaymentIntentId: session.payment_intent as string,
              })
              .where(eq(reportRequests.id, parseInt(requestId)));

            const [request] = await db.select().from(reportRequests).where(eq(reportRequests.id, parseInt(requestId)));
            
            if (request) {
              try {
                await notifyOwner({
                  title: "💰 New PAID Storm Report Request",
                  content: `
**New Paid Report Request Received**

**Customer Details:**
- Name: ${request.fullName}
- Email: ${request.email}
- Phone: ${request.phone}

**Property:**
- Address: ${request.address}
- City/State/ZIP: ${request.cityStateZip}
- Roof Age: ${request.roofAge || "Not specified"}

**Payment:**
- Amount: $${((session.amount_total || 19900) / 100).toFixed(2)}
- Payment ID: ${session.payment_intent}

**Status:** Paid - Ready for Scheduling
                  `.trim(),
                });
              } catch (notifyError) {
                console.error("[Webhook] Failed to send owner notification:", notifyError);
              }

              try {
                await sendSMSNotification({
                  customerName: request.fullName,
                  customerPhone: request.phone,
                  address: `${request.address}, ${request.cityStateZip}`,
                  isPaid: true,
                  amount: session.amount_total || 19900,
                });
              } catch (smsError) {
                console.error("[Webhook] Failed to send SMS notification:", smsError);
              }
            }
          }
        } catch (dbError) {
          console.error("[Webhook] Database operation failed:", dbError);
        }
      }
      break;
    }
    default:
      console.log(`[Webhook] Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// OAuth routes
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// IMPORTANT: Export for Vercel
export default app;

// Only start server in development
if (process.env.NODE_ENV === "development") {
  (async () => {
    const { createServer } = await import("http");
    const { setupVite } = await import("./vite");
    
    const server = createServer(app);
    await setupVite(app, server);
    
    const port = parseInt(process.env.PORT || "3000");
    server.listen(port, () => {
      console.log(`Dev server running on http://localhost:${port}/`);
    });
  })();
}
