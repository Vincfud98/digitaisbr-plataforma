import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

const corsHandler = cors({ origin: true });

export const tokens = {
  create: functions.https.onRequest((req, res) => {
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

        const store = storeDoc.data()!;
        if (store.associadoId !== uid) {
          const userDoc = await admin.firestore().collection("users").doc(uid).get();
          if (userDoc.data()?.role !== "admin") {
            res.status(403).json({ error: "Forbidden" });
            return;
          }
        }

        const tokenValue = `dbr_tok_${uuidv4().replace(/-/g, "")}`;

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
      } catch (error: any) {
        console.error("Error creating token:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),

  revoke: functions.https.onRequest((req, res) => {
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

        const tokenData = tokenDoc.data()!;
        if (tokenData.associadoId !== uid) {
          const userDoc = await admin.firestore().collection("users").doc(uid).get();
          if (userDoc.data()?.role !== "admin") {
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
      } catch (error: any) {
        console.error("Error revoking token:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),

  list: functions.https.onRequest((req, res) => {
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

        const idToken = authHeader.split("Bearer ")[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        const uid = decoded.uid;

        const storeId = req.query.storeId as string;
        if (!storeId) {
          res.status(400).json({ error: "storeId query param is required" });
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
          if (userDoc.data()?.role !== "admin") {
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
      } catch (error: any) {
        console.error("Error listing tokens:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }),
};
