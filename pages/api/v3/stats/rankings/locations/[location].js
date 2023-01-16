import models from "lib/db/models";
import APIAthlete, { projection } from "lib/api/models/APIAthlete";

const { Athlete } = models();
const DEFAULT_PER_PAGE = 25;
const TYPES = ["allTime", "single"];
const LOCATIONS = ["prospectpark", "centralpark"];

const validateTimePeriod = ({ year = "", month = "" }) => {
  // Requiires year, must be since 2010
  if (
    !year ||
    !(year?.toString().match(/^\d+$/) && Number.parseInt(year, 10) >= 2010)
  ) {
    return false;
  }
  // month must be 1-12, leading 0 allowed for 01-09
  if (month && !month.toString().match(/^(0?[1-9]|1[0-2])$/)) {
    return false;
  }

  return false;
};

// Cannot filter allTime or single by year or month
const validateType = ({ type, year, month }) =>
  !type || (TYPES.includes(type) && !year && !month);

const validatePageParams = ({ page = "", per_page = "" }) => {
  if (!page || page.match(/^\d+$/)) {
    return true;
  }

  if (!per_page || per_page.match(/^\d+$/)) {
    return true;
  }
  return false;
};

/**
 * Validate location and query, and calculate ranking
 *
 * @todo: Calculate and cache after an activity is imported
 *
 * @param {String} location Valid location
 * @param {[Athlete]} athleteDocs Athlete documents
 * @param {Object} query Other query options like year, month, etc
 * @returns {{ status: Number, ranking: Array }} Response status, ranking result
 */
async function rankingForLocation(query) {
  const queryIsValid = validateType(query) || validateTimePeriod(query);
  if (!queryIsValid || !validatePageParams(query)) {
    return { status: 400 };
  }

  const {
    location = "",
    type = "allTime",
    per_page: limit = DEFAULT_PER_PAGE,
    order = "DESC",
    page = 1,
  } = query;

  if (!LOCATIONS.includes(location)) {
    return { status: 404 };
  }

  const orderValue = order.toLowerCase() === "asc" ? 1 : -1;
  const sort = { [`stats.locations.${location}.${type}`]: orderValue };
  const skipValue = Number.parseInt(page, 10);
  const skip = Number.isNaN(skipValue) ? 0 : (skipValue - 1) * limit;

  // @todo skip and limit, transform into APIAthlete
  const athleteDocs = await Athlete.find({ locations: location }, projection, {
    sort,
    limit,
    skip,
  });
  if (!athleteDocs?.length) {
    return { status: 200, ranking: [] };
  }
  return { status: 200, ranking: athleteDocs.map(APIAthlete) };
}

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
