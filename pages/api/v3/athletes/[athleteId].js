import models from "lib/db/models";
import APIAthlete, { projection } from "lib/api/models/APIAthlete";

const { Athlete } = models();

/**
 * Handle single-athlete request by ID
 *
 * @param {Request} req
 * @param {Response} res
 * @returns void
 */
export default async function handler({ query = {} }, res) {
  const { athleteId = "" } = query;

  if (!athleteId.toString().match(/^\d+$/)) {
    res.status(400).json({ error: `Malformed athlete ID: ${query.athleteId}` });
    return;
  }

  try {
    const athleteDoc = await Athlete.findById(athleteId, projection);
    if (!athleteDoc) {
      res.status(404).json({ error: `Athlete ID not found: ${athleteId}` });
    }

    res.status(200).json(APIAthlete(athleteDoc));
  } catch (error) {
    console.error(error.toString(), query);
    res.status(500).json({ error: "An error occurred" });
  }
}
