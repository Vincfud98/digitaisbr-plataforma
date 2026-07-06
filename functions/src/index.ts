import * as admin from "firebase-admin";
import { apiKeys } from "./api-keys";
import { webhooks } from "./webhooks";
import { storeApi } from "./store-api";
import { tokens } from "./tokens";

admin.initializeApp();

// API Key management
export const generateApiKey = apiKeys.generate;
export const rotateSecretKey = apiKeys.rotateSecret;
export const getApiKeys = apiKeys.get;

// Webhook endpoints
export const webhookIncoming = webhooks.incoming;
export const registerWebhook = webhooks.register;

// Public Store API
export const storeProducts = storeApi.products;
export const storeInfo = storeApi.info;

// Token management
export const createToken = tokens.create;
export const revokeToken = tokens.revoke;
export const listTokens = tokens.list;
