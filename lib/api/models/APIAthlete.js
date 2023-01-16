export const projection =
  "_id athlete.firstname athlete.lastname athlete.profile stats summit";
/**
 * Transform Athlete db doc
 */
const APIAthlete = (athleteDoc) => ({
  id: athleteDoc.get("_id"),
  status: athleteDoc.get("status"),
  firstname: athleteDoc.get("athlete.firstname"),
  lastname: athleteDoc.get("athlete.lastname"),
  profile: athleteDoc.get("athlete.profile"),
  stats: athleteDoc.get("stats"),
  summit: athleteDoc.get("summit"),
});

export default APIAthlete;
