import dbConnect from "../../../../lib/db/dbConnect";
import Athlete from "../../../../lib/db/Athlete";

export default async function handler(req, res) {
  await dbConnect();
  const athlete = await Athlete.findById(541773);
  console.log("hi");
  res.json(athlete.toJSON());
}
