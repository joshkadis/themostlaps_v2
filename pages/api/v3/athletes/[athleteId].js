import models from "lib/db/models";
import APIAthlete, { projection } from "lib/api/models/APIAthlete";

const { Athlete } = models();

export default async function handler(req, res) {
  const { athleteId = "" } = req.query;

  if (!athleteId.toString().match(/^\d+$/)) {
    res
      .status(400)
      .json({ error: `Malformed athlete ID: ${req.query.athleteId}` });
    return;
  }

  const athleteDoc = await Athlete.findById(athleteId, projection);
  if (!athleteDoc) {
    res.status(404).json({ error: `Athlete ID not found: ${athleteId}` });
  }

  res.status(200).json(APIAthlete(athleteDoc));
}
