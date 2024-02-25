import express from "express";

import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  getEvent,
} from "../controllers/event";

export default (router: express.Router) => {
  router.post("/api/v1/events/create", createEvent);
  router.put("/api/v1/events/:id", updateEvent);
  router.get("/api/v1/events", getEvents);
  router.delete("/api/v1/events/:id", deleteEvent);
  router.get("/api/v1/events/:id", getEvent);
};
