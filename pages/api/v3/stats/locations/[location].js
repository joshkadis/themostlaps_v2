import rankingForLocation from "lib/api/rankingForLocation";

export default async function handler({ query }, res) {
  const { status, ranking } = await rankingForLocation(query);

  if (status === 404) {
    res.status(404).json({ error: `Unknown location: ${location}` });
    return;
  }
  if (status === 400) {
    res
      .status(400)
      .json({ error: `Malformed query: ${JSON.stringify(query)}` });
    return;
  }

  res.status(200).json(ranking);
}
