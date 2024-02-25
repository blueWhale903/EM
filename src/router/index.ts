import express from "express";
import event from "./event";
import participant from "./participant";
const router = express.Router();

export default (): express.Router => {
  event(router);
  participant(router);
  return router;
};
