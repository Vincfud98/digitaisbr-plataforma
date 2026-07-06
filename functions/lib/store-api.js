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
exports.storeApi = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
async function validateApiKey(apiKey) {
    const snapshot = await admin.firestore()
        .collection("apiKeys")
        .where("apiKey", "==", apiKey)
        .where("active", "==", true)
        .limit(1)
        .get();
    if (snapshot.empty)
        return { valid: false };
    const data = snapshot.docs[0].data();
    await admin.firestore().collection("apiKeys").doc(snapshot.docs[0].id).update({
        lastUsed: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { valid: true, storeId: data.storeId };
}
exports.storeApi = {
    products: functions.https.onRequest((req, res) => {
        corsHandler(req, res, async () => {
            if (req.method !== "GET") {
                res.status(405).json({ error: "Method not allowed" });
                return;
            }
            try {
                const apiKey = req.headers["x-api-key"] || req.query.apiKey;
                if (!apiKey) {
                    res.status(401).json({ error: "API key required (x-api-key header or apiKey query param)" });
                    return;
                }
                const auth = await validateApiKey(apiKey);
                if (!auth.valid) {
                    res.status(401).json({ error: "Invalid or inactive API key" });
                    return;
                }
                const storeDoc = await admin.firestore().collection("stores").doc(auth.storeId).get();
                if (!storeDoc.exists) {
                    res.status(404).json({ error: "Store not found" });
                    return;
                }
                const store = storeDoc.data();
                const productIds = store.productIds || [];
                if (productIds.length === 0) {
                    res.json({ products: [], total: 0 });
                    return;
                }
                const batches = [];
                for (let i = 0; i < productIds.length; i += 10) {
                    batches.push(productIds.slice(i, i + 10));
                }
                const products = [];
                for (const batch of batches) {
                    const snapshot = await admin.firestore()
                        .collection("products")
                        .where(admin.firestore.FieldPath.documentId(), "in", batch)
                        .get();
                    snapshot.forEach((doc) => {
                        const p = doc.data();
                        if (p.status === "ativo") {
                            products.push({
                                id: doc.id,
                                name: p.name,
                                description: p.description,
                                price: p.price,
                                image: p.image,
                                category: p.categoryId,
                                stock: p.stock,
                                sku: p.sku,
                                checkoutUrl: p.checkoutUrl,
                            });
                        }
                    });
                }
                const page = parseInt(req.query.page) || 1;
                const limit = Math.min(parseInt(req.query.limit) || 20, 50);
                const start = (page - 1) * limit;
                const paginated = products.slice(start, start + limit);
                res.json({
                    products: paginated,
                    total: products.length,
                    page,
                    limit,
                    pages: Math.ceil(products.length / limit),
                });
            }
            catch (error) {
                console.error("Store API products error:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
    info: functions.https.onRequest((req, res) => {
        corsHandler(req, res, async () => {
            var _a, _b, _c, _d, _e;
            if (req.method !== "GET") {
                res.status(405).json({ error: "Method not allowed" });
                return;
            }
            try {
                const slug = req.query.slug;
                const apiKey = req.headers["x-api-key"] || req.query.apiKey;
                let storeData = null;
                let storeId = "";
                if (apiKey) {
                    const auth = await validateApiKey(apiKey);
                    if (!auth.valid) {
                        res.status(401).json({ error: "Invalid API key" });
                        return;
                    }
                    const doc = await admin.firestore().collection("stores").doc(auth.storeId).get();
                    if (doc.exists) {
                        storeData = doc.data();
                        storeId = doc.id;
                    }
                }
                else if (slug) {
                    const snapshot = await admin.firestore()
                        .collection("stores")
                        .where("slug", "==", slug)
                        .where("active", "==", true)
                        .limit(1)
                        .get();
                    if (!snapshot.empty) {
                        storeData = snapshot.docs[0].data();
                        storeId = snapshot.docs[0].id;
                    }
                }
                else {
                    res.status(400).json({ error: "slug query param or x-api-key header required" });
                    return;
                }
                if (!storeData) {
                    res.status(404).json({ error: "Store not found" });
                    return;
                }
                await admin.firestore().collection("stores").doc(storeId).update({
                    totalViews: admin.firestore.FieldValue.increment(1),
                });
                res.json({
                    id: storeId,
                    name: storeData.name,
                    slug: storeData.slug,
                    active: storeData.active,
                    config: {
                        primaryColor: (_a = storeData.config) === null || _a === void 0 ? void 0 : _a.primaryColor,
                        bannerUrl: (_b = storeData.config) === null || _b === void 0 ? void 0 : _b.bannerUrl,
                        logoUrl: (_c = storeData.config) === null || _c === void 0 ? void 0 : _c.logoUrl,
                        description: (_d = storeData.config) === null || _d === void 0 ? void 0 : _d.description,
                        showWhatsapp: (_e = storeData.config) === null || _e === void 0 ? void 0 : _e.showWhatsapp,
                    },
                    totalProducts: (storeData.productIds || []).length,
                });
            }
            catch (error) {
                console.error("Store API info error:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }),
};
//# sourceMappingURL=store-api.js.map