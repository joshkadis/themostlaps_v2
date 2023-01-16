import models from "lib/db/models";
import APIAthlete, { projection } from "lib/api/models/APIAthlete";

const { Athlete } = models();

export default async function handler({ query = {} }, res) {
  const { ids = "" } = query;

  if (!ids) {
    res.status(400).json({ error: "Missing required parameter `ids`" });
    return;
  }

  try {
    const athleteDocs = await Athlete.find({ _id: ids.split(",") }, projection);
    res.status(200).json(athleteDocs.map(APIAthlete));
  } catch (error) {
    console.error(error.toString(), query);
    res.status(500).json({ error: "An error occurred" });
  }
}
