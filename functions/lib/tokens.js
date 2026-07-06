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
exports.tokens = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
exports.tokens = {
    create: functions.https.onRequest((req, res) => {
        corsHandler(req, res, async () => {
            var _a;
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
                const idToken = authHeader.split("Bearer ")[1];
                const decoded = await admin.auth().verifyIdToken(idToken);
                const uid = decoded.uid;
                const { storeId, name } = req.body;
                if (!storeId || !name) {
                    res.status(400).json({ error: "storeId and name are required" });
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
                    if (((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
                        res.status(403).json({ error: "Forbidden" });
                        return;
                    }
                }
                const tokenValue = `dbr_tok_${(0, uuid_1.v4)().replace(/-/g, "")}`;
                const doc = await admin.firestore().collection("tokens").add({
                    storeId,
                    associadoId: store.associadoId,
                    name,
                    token: tokenValue,
                    active: true,
                    lastUsed: null,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                res.json({
                    id: doc.id,
                    name,
                    token: tokenValue,
                    message: "Token created. Store it safely — it won't be shown again.",
                });
            }
            catch (error) {
                console.error("Error creating token:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
    revoke: functions.https.onRequest((req, res) => {
        corsHandler(req, res, async () => {
            var _a;
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
                const idToken = authHeader.split("Bearer ")[1];
                const decoded = await admin.auth().verifyIdToken(idToken);
                const uid = decoded.uid;
                const { tokenId } = req.body;
                if (!tokenId) {
                    res.status(400).json({ error: "tokenId is required" });
                    return;
                }
                const tokenDoc = await admin.firestore().collection("tokens").doc(tokenId).get();
                if (!tokenDoc.exists) {
                    res.status(404).json({ error: "Token not found" });
                    return;
                }
                const tokenData = tokenDoc.data();
                if (tokenData.associadoId !== uid) {
                    const userDoc = await admin.firestore().collection("users").doc(uid).get();
                    if (((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
                        res.status(403).json({ error: "Forbidden" });
                        return;
                    }
                }
                await admin.firestore().collection("tokens").doc(tokenId).update({
                    active: false,
                    revokedAt: admin.firestore.FieldValue.serverTimestamp(),
                    revokedBy: uid,
                });
                res.json({ message: "Token revoked successfully" });
            }
            catch (error) {
                console.error("Error revoking token:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
    list: functions.https.onRequest((req, res) => {
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
                const idToken = authHeader.split("Bearer ")[1];
                const decoded = await admin.auth().verifyIdToken(idToken);
                const uid = decoded.uid;
                const storeId = req.query.storeId;
                if (!storeId) {
                    res.status(400).json({ error: "storeId query param is required" });
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
                    if (((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
                        res.status(403).json({ error: "Forbidden" });
                        return;
                    }
                }
                const snapshot = await admin.firestore()
                    .collection("tokens")
                    .where("storeId", "==", storeId)
                    .orderBy("createdAt", "desc")
                    .get();
                const tokensList = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        active: data.active,
                        lastUsed: data.lastUsed,
                        createdAt: data.createdAt,
                        revokedAt: data.revokedAt || null,
                    };
                });
                res.json({ tokens: tokensList });
            }
            catch (error) {
                console.error("Error listing tokens:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
};
//# sourceMappingURL=tokens.js.map