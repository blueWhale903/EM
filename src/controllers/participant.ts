import express from "express";
import { db } from "../db";
import { extractDataFromSheetRes } from "../helpers/sheet";
import z from "zod";

const participantSchema = z.object({
  name: z.string().min(1, "Invalid Name"),
  studentId: z.string().min(1, "Invalid Student Id"),
  faculty: z.string().min(1, "Invalid faculty"),
});
const participantsSchema = z.array(participantSchema);

const PartialParticipantSchema = z
  .object({
    name: z.string().min(1),
    studentId: z.string().min(1, "Invalid Student Id"),
    faculty: z.string().min(1, "Invalid faculty"),
    eventId: z.string().min(1, "Invalid Event Id"),
  })
  .partial()
  .refine(
    ({ name, studentId, faculty, eventId }) =>
      !name || !studentId || !faculty || !eventId,
    { message: "One of the fields must be defined" }
  );

export const createManyParticipants = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { sheetId, sheetTitle, range } = req.body;
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetTitle}&range=${range}`;
    const data = await fetch(url)
      .then((res) => {
        if (res.status != 200) {
          return null;
        }
        return res.text();
      })
      .then((res) => {
        if (!res) return null;
        let data = JSON.parse(res.substring(47).slice(0, -2));
        return data;
      });

    if (!data) {
      return res.status(400).json({ message: "Sheet Not Found" });
    }

    const extractedData = extractDataFromSheetRes(data, id);
    if (!participantsSchema.parse(extractedData)) {
      return res.status(400);
    }

    const participants = await db.participant.createMany({
      data: extractedData,
      skipDuplicates: true,
    });

    return res.status(200).json(participants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const createParticipant = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = participantSchema.safeParse(req.body);

    if (result.success == false) {
      return res.status(400).json({ message: result.error });
    } else {
      const { id } = req.params;
      const data = result.data;

      const newParticipant = await db.participant.create({
        data: {
          name: data.name,
          studentId: data.studentId,
          faculty: data.faculty,
          eventId: id,
        },
      });
      return res.status(200).json(newParticipant);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getParticipants = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const { query } = req.query;

    const data = await db.participant.findMany({
      where: {
        eventId: id,
        OR: [
          { name: { contains: query.toString(), mode: "insensitive" } },
          { studentId: { contains: query.toString(), mode: "insensitive" } },
        ],
      },
    });

    const length = data.length;

    return res.status(200).json({ count: length, participants: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getParticipant = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { eventId, studentId } = req.params;
    const data = await db.participant.findUnique({
      where: {
        participantId: {
          eventId: eventId,
          studentId: studentId,
        },
      },
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateParticipant = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const result = PartialParticipantSchema.safeParse(req.body);

    if (result.success == false) {
      return res.status(400).json({ message: result.error });
    } else {
      const data = result.data;
      const { eventId, studentId } = req.params;
      const updatedParticipant = await db.participant.update({
        where: {
          participantId: { eventId: eventId, studentId: studentId },
        },
        data: data,
      });
      return res.status(200).json(updatedParticipant);
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteParticipant = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { eventId, studentId } = req.params;

    const deletedParticipant = await db.participant.delete({
      where: {
        participantId: { eventId: eventId, studentId: studentId },
      },
    });

    return res.status(200).json(deletedParticipant);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
