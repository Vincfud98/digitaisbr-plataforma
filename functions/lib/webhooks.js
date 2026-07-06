"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooks = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
exports.webhooks = {
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
            const apiKeyHeader = req.headers["x-api-key"];
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
            const deliveries = [];
            subscribersSnapshot.forEach((doc) => {
                const sub = doc.data();
                deliveries.push(fetch(sub.callbackUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Webhook-Secret": sub.secret || "",
                        "X-Event": event,
                    },
                    body: JSON.stringify({ event, data, storeSlug, timestamp: new Date().toISOString() }),
                })
                    .then((r) => ({ url: sub.callbackUrl, status: r.status }))
                    .catch((err) => ({ url: sub.callbackUrl, error: err.message })));
            });
            const results = await Promise.allSettled(deliveries);
            res.json({
                received: true,
                event,
                deliveries: results.length,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
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
                if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                const token = authHeader.split("Bearer ")[1];
                await admin.auth().verifyIdToken(token);
                const { storeSlug, callbackUrl, events, secret } = req.body;
                if (!storeSlug || !callbackUrl || !(events === null || events === void 0 ? void 0 : events.length)) {
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
            }
            catch (error) {
                console.error("Error registering webhook:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
};
//# sourceMappingURL=webhooks.js.map