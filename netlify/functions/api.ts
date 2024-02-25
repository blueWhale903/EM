// YOUR_BASE_DIRECTORY/netlify/functions/api.ts

import express from "express";
import serverless from "serverless-http";
import router from "../../src/router";
const api = express();

api.use(express.json());
api.use("/", router());

export const handler = serverless(api);
