import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const corsHandler = cors({ origin: true });

function generateKey(prefix: string, slug: string): string {
  const random = uuidv4().replace(/-/g, "").substring(0, 12);
  return `${prefix}_${slug}_${random}`;
}

export const apiKeys = {
  generate: functions.https.onRequest((req, res) => {
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

        const store = storeDoc.data()!;
        if (store.associadoId !== uid) {
          const userDoc = await admin.firestore().collection("users").doc(uid).get();
          const userData = userDoc.data();
          if (userData?.role !== "admin") {
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
      } catch (error: any) {
        console.error("Error generating API keys:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),

  rotateSecret: functions.https.onRequest((req, res) => {
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

        const keyData = keyDoc.data()!;
        if (keyData.associadoId !== uid) {
          const userDoc = await admin.firestore().collection("users").doc(uid).get();
          if (userDoc.data()?.role !== "admin") {
            res.status(403).json({ error: "Forbidden" });
            return;
          }
        }

        const storeDoc = await admin.firestore().collection("stores").doc(storeId).get();
        const slug = storeDoc.data()?.slug || "store";
        const newSecretKey = generateKey("dbr_secret", slug);

        await admin.firestore().collection("apiKeys").doc(storeId).update({
          secretKey: newSecretKey,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({
          secretKey: newSecretKey,
          message: "Secret key rotated successfully.",
        });
      } catch (error: any) {
        console.error("Error rotating secret:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),

  get: functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      if (req.method !== "GET") {
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
        const decoded = await admin.auth().verifyIdToken(token);
        const uid = decoded.uid;

        const storeId = req.query.storeId as string;
        if (!storeId) {
          res.status(400).json({ error: "storeId query param is required" });
          return;
        }

        const keyDoc = await admin.firestore().collection("apiKeys").doc(storeId).get();
        if (!keyDoc.exists) {
          res.json({ exists: false });
          return;
        }

        const keyData = keyDoc.data()!;
        if (keyData.associadoId !== uid) {
          const userDoc = await admin.firestore().collection("users").doc(uid).get();
          if (userDoc.data()?.role !== "admin") {
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
      } catch (error: any) {
        console.error("Error getting API keys:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),
};
