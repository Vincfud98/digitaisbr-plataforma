import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

async function validateApiKey(apiKey: string): Promise<{ valid: boolean; storeId?: string }> {
  const snapshot = await admin.firestore()
    .collection("apiKeys")
    .where("apiKey", "==", apiKey)
    .where("active", "==", true)
    .limit(1)
    .get();

  if (snapshot.empty) return { valid: false };

  const data = snapshot.docs[0].data();

  await admin.firestore().collection("apiKeys").doc(snapshot.docs[0].id).update({
    lastUsed: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { valid: true, storeId: data.storeId };
}

export const storeApi = {
  products: functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      try {
        const apiKey = req.headers["x-api-key"] as string || req.query.apiKey as string;
        if (!apiKey) {
          res.status(401).json({ error: "API key required (x-api-key header or apiKey query param)" });
          return;
        }

        const auth = await validateApiKey(apiKey);
        if (!auth.valid) {
          res.status(401).json({ error: "Invalid or inactive API key" });
          return;
        }

        const storeDoc = await admin.firestore().collection("stores").doc(auth.storeId!).get();
        if (!storeDoc.exists) {
          res.status(404).json({ error: "Store not found" });
          return;
        }

        const store = storeDoc.data()!;
        const productIds = store.productIds || [];

        if (productIds.length === 0) {
          res.json({ products: [], total: 0 });
          return;
        }

        const batches: string[][] = [];
        for (let i = 0; i < productIds.length; i += 10) {
          batches.push(productIds.slice(i, i + 10));
        }

        const products: any[] = [];
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

        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
        const start = (page - 1) * limit;
        const paginated = products.slice(start, start + limit);

        res.json({
          products: paginated,
          total: products.length,
          page,
          limit,
          pages: Math.ceil(products.length / limit),
        });
      } catch (error: any) {
        console.error("Store API products error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),

  info: functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
      }

      try {
        const slug = req.query.slug as string;
        const apiKey = req.headers["x-api-key"] as string || req.query.apiKey as string;

        let storeData: any = null;
        let storeId: string = "";

        if (apiKey) {
          const auth = await validateApiKey(apiKey);
          if (!auth.valid) {
            res.status(401).json({ error: "Invalid API key" });
            return;
          }
          const doc = await admin.firestore().collection("stores").doc(auth.storeId!).get();
          if (doc.exists) {
            storeData = doc.data();
            storeId = doc.id;
          }
        } else if (slug) {
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
        } else {
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
            primaryColor: storeData.config?.primaryColor,
            bannerUrl: storeData.config?.bannerUrl,
            logoUrl: storeData.config?.logoUrl,
            description: storeData.config?.description,
            showWhatsapp: storeData.config?.showWhatsapp,
          },
          totalProducts: (storeData.productIds || []).length,
        });
      } catch (error: any) {
        console.error("Store API info error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),
};
