import express from "express";

import {
  createManyParticipants,
  createParticipant,
  deleteParticipant,
  getParticipant,
  getParticipants,
  updateParticipant,
} from "../controllers/participant";

export default (router: express.Router) => {
  router.post("/api/v1/events/:id/participants", createManyParticipants);
  router.post("/api/v1/events/:id/participant", createParticipant);
  router.get("/api/v1/events/:id/participants", getParticipants);
  router.get("/api/v1/events/:eventId/participants/:studentId", getParticipant);
  router.put(
    "/api/v1/events/:eventId/participants/:studentId",
    updateParticipant
  );
  router.delete(
    "/api/v1/events/:eventId/participants/:studentId",
    deleteParticipant
  );
};
