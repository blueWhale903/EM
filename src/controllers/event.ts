import { db } from "../db";
import express from "express";
import z from "zod";

const EventSchema = z.object({
  organizer: z.string().min(1),
  name: z.string().min(1),
  desc: z.string(),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
});

export const getEvents = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let { query, limit, page } = req.query;

    if (!query) {
      query = "";
    }
    if (!page) page = "1";

    if (!limit) {
      const events = await db.event.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query.toString(),
                mode: "insensitive",
              },
            },
            {
              desc: {
                contains: query.toString(),
                mode: "insensitive",
              },
            },
          ],
        },
      });
      const length = events.length;

      return res.status(200).json({ count: length, events: events });
    } else {
      const skip = Number(limit) * (Number(page) - 1);
      const events = await db.event.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query.toString(),
                mode: "insensitive",
              },
            },
            {
              desc: {
                contains: query.toString(),
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: { dateFrom: "desc" },
        take: Number(limit),
        skip: skip,
      });
      const length = events.length;

      return res.status(200).json({ count: length, events: events });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getEvent = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const event = await db.event.findUnique({
      where: { id: id },
    });
    return res.status(200).json(event);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = EventSchema.safeParse(req.body);

    if (result.success == false) {
      return res.status(400).json({ error: result.error });
    } else {
      const data = result.data;
      const newEvent = await db.event.create({
        data: {
          organizer: data.organizer,
          name: data.name,
          desc: data.desc,
          dateFrom: data.dateFrom,
          dateTo: data.dateTo,
        },
      });
      return res.status(200).json(newEvent).end();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateEvent = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    console.log(req.body);
    const result = EventSchema.safeParse(req.body);

    if (result.success == false) {
      return res.status(400).json({ message: result.error });
    } else {
      const { id } = req.params;
      const data = result.data;
      const updatedEvent = await db.event.update({
        where: { id: id },
        data: data,
      });
      return res.status(200).json(updatedEvent);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    await db.participant.deleteMany({
      where: { eventId: id },
    });

    const deletedEvent = await db.event.delete({
      where: { id: id },
    });

    return res.json(deletedEvent);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};
