/**
 * Transform Athlete db doc
 */
export default APIAthlete = (athleteDoc) => ({
  id: athleteDoc.get("_id"),
  status: athleteDoc.get("status"),
  firstname: athleteDoc.get("athlete.firstname"),
  lastname: athleteDoc.get("athlete.lastname"),
  profile: athleteDoc.get("athlete.profile"),
  stats: athleteDoc.get("stats"),
});