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
exports.apiKeys = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
function generateKey(prefix, slug) {
    const random = (0, uuid_1.v4)().replace(/-/g, "").substring(0, 12);
    return `${prefix}_${slug}_${random}`;
}
exports.apiKeys = {
    generate: functions.https.onRequest((req, res) => {
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
                const decoded = await admin.auth().verifyIdToken(token);
                const uid = decoded.uid;
                const { storeId } = req.body;
                if (!storeId) {
                    res.status(400).json({ error: "storeId is required" });
                    return;
                }
                const storeDoc = await admin.firestore().collection("stores").doc(storeId).get();
                if (!storeDoc.exists) {
                    res.status(404).json({ error: "Store not found" });
                    return;
                }
                const store = storeDoc.data();
                if (store.associadoId !== uid) {
                    const userDoc = await admin.firestore().collection("users").doc(uid).get();
                    const userData = userDoc.data();
                    if ((userData === null || userData === void 0 ? void 0 : userData.role) !== "admin") {
                        res.status(403).json({ error: "Forbidden" });
                        return;
                    }
                }
                const apiKey = generateKey("dbr_live", store.slug);
                const secretKey = generateKey("dbr_secret", store.slug);
                const webhookUrl = `https://us-central1-digitaisbr-plataforma.cloudfunctions.net/webhookIncoming/${store.slug}`;
                await admin.firestore().collection("apiKeys").doc(storeId).set({
                    storeId,
                    associadoId: store.associadoId,
                    apiKey,
                    secretKeyHash: admin.firestore.FieldValue.delete(),
                    secretKey,
                    webhookUrl,
                    active: true,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                res.json({
                    apiKey,
                    secretKey,
                    webhookUrl,
                    message: "API keys generated successfully. Store your secret key safely.",
                });
            }
            catch (error) {
                console.error("Error generating API keys:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
    rotateSecret: functions.https.onRequest((req, res) => {
        corsHandler(req, res, async () => {
            var _a, _b;
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
                const decoded = await admin.auth().verifyIdToken(token);
                const uid = decoded.uid;
                const { storeId } = req.body;
                if (!storeId) {
                    res.status(400).json({ error: "storeId is required" });
                    return;
                }
                const keyDoc = await admin.firestore().collection("apiKeys").doc(storeId).get();
                if (!keyDoc.exists) {
                    res.status(404).json({ error: "API keys not found. Generate keys first." });
                    return;
                }
                const keyData = keyDoc.data();
                if (keyData.associadoId !== uid) {
                    const userDoc = await admin.firestore().collection("users").doc(uid).get();
                    if (((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
                        res.status(403).json({ error: "Forbidden" });
                        return;
                    }
                }
                const storeDoc = await admin.firestore().collection("stores").doc(storeId).get();
                const slug = ((_b = storeDoc.data()) === null || _b === void 0 ? void 0 : _b.slug) || "store";
                const newSecretKey = generateKey("dbr_secret", slug);
                await admin.firestore().collection("apiKeys").doc(storeId).update({
                    secretKey: newSecretKey,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                res.json({
                    secretKey: newSecretKey,
                    message: "Secret key rotated successfully.",
                });
            }
            catch (error) {
                console.error("Error rotating secret:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
    get: functions.https.onRequest((req, res) => {
        corsHandler(req, res, async () => {
            var _a;
            if (req.method !== "GET") {
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
                const decoded = await admin.auth().verifyIdToken(token);
                const uid = decoded.uid;
                const storeId = req.query.storeId;
                if (!storeId) {
                    res.status(400).json({ error: "storeId query param is required" });
                    return;
                }
                const keyDoc = await admin.firestore().collection("apiKeys").doc(storeId).get();
                if (!keyDoc.exists) {
                    res.json({ exists: false });
                    return;
                }
                const keyData = keyDoc.data();
                if (keyData.associadoId !== uid) {
                    const userDoc = await admin.firestore().collection("users").doc(uid).get();
                    if (((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
                        res.status(403).json({ error: "Forbidden" });
                        return;
                    }
                }
                res.json({
                    exists: true,
                    apiKey: keyData.apiKey,
                    secretKey: keyData.secretKey.substring(0, 12) + "••••••••••••",
                    webhookUrl: keyData.webhookUrl,
                    active: keyData.active,
                    createdAt: keyData.createdAt,
                });
            }
            catch (error) {
                console.error("Error getting API keys:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
};
//# sourceMappingURL=api-keys.js.map