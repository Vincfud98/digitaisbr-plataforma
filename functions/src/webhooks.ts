import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

export const webhooks = {
  incoming: functions.https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const pathParts = req.path.split("/").filter(Boolean);
      const storeSlug = pathParts[pathParts.length - 1];

      if (!storeSlug) {
        res.status(400).json({ error: "Store slug is required in URL path" });
        return;
      }

      const apiKeyHeader = req.headers["x-api-key"] as string;
      if (!apiKeyHeader) {
        res.status(401).json({ error: "x-api-key header is required" });
        return;
      }

      const keysSnapshot = await admin.firestore()
        .collection("apiKeys")
        .where("apiKey", "==", apiKeyHeader)
        .where("active", "==", true)
        .limit(1)
        .get();

      if (keysSnapshot.empty) {
        res.status(401).json({ error: "Invalid or inactive API key" });
        return;
      }

      const { event, data } = req.body;
      if (!event) {
        res.status(400).json({ error: "event field is required" });
        return;
      }

      const validEvents = [
        "sale.created", "sale.approved", "sale.cancelled", "sale.refunded",
        "product.updated", "product.stock_low",
        "store.updated", "store.activated", "store.deactivated",
        "payout.requested", "payout.approved", "payout.completed",
      ];

      if (!validEvents.includes(event)) {
        res.status(400).json({ error: `Invalid event. Valid events: ${validEvents.join(", ")}` });
        return;
      }

      await admin.firestore().collection("webhookLogs").add({
        storeSlug,
        event,
        data: data || {},
        apiKey: apiKeyHeader.substring(0, 15) + "...",
        status: "received",
        ip: req.ip,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const subscribersSnapshot = await admin.firestore()
        .collection("webhookSubscriptions")
        .where("storeSlug", "==", storeSlug)
        .where("events", "array-contains", event)
        .where("active", "==", true)
        .get();

      const deliveries: Promise<any>[] = [];
      subscribersSnapshot.forEach((doc) => {
        const sub = doc.data();
        deliveries.push(
          fetch(sub.callbackUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Secret": sub.secret || "",
              "X-Event": event,
            },
            body: JSON.stringify({ event, data, storeSlug, timestamp: new Date().toISOString() }),
          })
            .then((r) => ({ url: sub.callbackUrl, status: r.status }))
            .catch((err) => ({ url: sub.callbackUrl, error: err.message }))
        );
      });

      const results = await Promise.allSettled(deliveries);

      res.json({
        received: true,
        event,
        deliveries: results.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }),

  register: functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
          res.status(401).json({ error: "Unauthorized" });
          return;
        }

        const token = authHeader.split("Bearer ")[1];
        await admin.auth().verifyIdToken(token);

        const { storeSlug, callbackUrl, events, secret } = req.body;

        if (!storeSlug || !callbackUrl || !events?.length) {
          res.status(400).json({ error: "storeSlug, callbackUrl, and events are required" });
          return;
        }

        const doc = await admin.firestore().collection("webhookSubscriptions").add({
          storeSlug,
          callbackUrl,
          events,
          secret: secret || "",
          active: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({
          id: doc.id,
          message: "Webhook subscription created",
          storeSlug,
          callbackUrl,
          events,
        });
      } catch (error: any) {
        console.error("Error registering webhook:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),
};
