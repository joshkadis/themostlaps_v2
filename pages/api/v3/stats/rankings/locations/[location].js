import models from "lib/db/models";
import APIAthlete, { projection } from "lib/api/models/APIAthlete";

const { Athlete } = models();
const DEFAULT_PER_PAGE = 25;
const TYPES = ["allTime", "single"];
const LOCATIONS = ["prospectpark", "centralpark"];
/**
 * Get sort, skip, limit options from query
 *
 * @param {Object} query Request query object
 * @param {String} sortKey
 * @returns {Boolean}
 */

const getDbQueryOptions = (query, sortKey) => {
  const {
    per_page: limit = DEFAULT_PER_PAGE,
    order = "DESC",
    page = 1,
  } = query;

  const orderValue = order.toLowerCase() === "asc" ? 1 : -1;
  const sort = { [sortKey]: orderValue };
  const skipValue = Number.parseInt(page, 10);
  const skip = Number.isNaN(skipValue) ? 0 : (skipValue - 1) * limit;

  return {
    sort,
    limit,
    skip,
  };
};

/**
 * If a year and month (optional) are provided in query,
 * make sure they are able to be queried
 *
 * @param {Object} query Request query object
 * @returns {Boolean}
 */
const validateTimePeriod = ({ year = "", month = "" }) => {
  // Requires year, must be since 2010
  if (
    !year ||
    !(year.toString().match(/^\d+$/) && Number.parseInt(year, 10) >= 2010)
  ) {
    return false;
  }
  // month must be 1-12, leading 0 allowed for 01-09
  if (month && !month.toString().match(/^(0?[1-9]|1[0-2])$/)) {
    return false;
  }

  return true;
};

/**
 * Make sure a type query (allTime or single) is valid
 *
 * @param {Object} query Request query object
 * @returns {Boolean}
 */
const validateType = ({ type, year, month }) =>
  TYPES.includes(type) && !year && !month;

/**
 * Validate pagination params
 *
 * @param {Object} query Request query object
 * @returns {Boolean}
 */
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
 * Calculate ranking for a type like allTime or single (i.e. longest ride)
 *
 * @param {String} location Valid location
 * @param {[Athlete]} athleteDocs Athlete documents
 * @param {Object} query Other query options like year, month, etc
 * @returns {{ status: Number, ranking: Array }} Response status, ranking result
 */
async function rankingByType(query) {
  const sortKey = `stats.locations.${query.location}.${query.type}`;
  // Query will fetch all athletes with stats in this location
  // then sort by type like allTime, single. Queries are not time-limited
  const athleteDocs = await Athlete.find(
    { locations: query.location },
    projection,
    getDbQueryOptions(query, sortKey)
  );

  if (!athleteDocs?.length) {
    return { status: 200, ranking: [] };
  }
  return { status: 200, ranking: athleteDocs.map(APIAthlete) };
}

/**
 * Calculate ranking for a year and optional month
 *
 * @todo: Calculate and cache after an activity is imported
 *
 * @param {String} location Valid location
 * @param {[Athlete]} athleteDocs Athlete documents
 * @param {Object} query Other query options like year, month, etc
 * @returns {{ status: Number, ranking: Array }} Response status, ranking result
 */
async function rankingbyTimePeriod(query) {
  const { location, year, month = "" } = query;

  let queryKey;
  if (!month) {
    // year-only query
    queryKey = `stats.locations.${location}.byYear.${year}`;
  } else {
    // year and month query
    const queryMonth = Number.parseInt(month, 10) - 1;
    queryKey = `stats.locations.${location}.byMonth.${year}.${queryMonth}`;
  }

  const dbQuery = { locations: location, [queryKey]: { $gt: 0 } };

  const athleteDocs = await Athlete.find(
    dbQuery,
    projection,
    getDbQueryOptions(query, queryKey)
  );

  if (!athleteDocs?.length) {
    return { status: 200, ranking: [] };
  }
  return { status: 200, ranking: athleteDocs.map(APIAthlete) };
}

/**
 * Provide location-specific ranking for various parameters
 *
 * @param {Request} req
 * @param {Response} res
 * @returns void
 */
export default async function handler({ query = {} }, res) {
  try {
    if (!LOCATIONS.includes(query.location)) {
      res.status(404).json({ error: `Unknown location: ${location}` });
      return;
    }

    if (!validatePageParams(query)) {
      res
        .status(400)
        .json({ error: `Malformed query: ${JSON.stringify(query)}` });
      return;
    }

    let rankingResult;
    if (validateType(query)) {
      rankingResult = await rankingByType(query);
    } else if (validateTimePeriod(query)) {
      rankingResult = await rankingbyTimePeriod(query);
    } else {
      res
        .status(400)
        .json({ error: `Malformed query: ${JSON.stringify(query)}` });
      return;
    }

    /**
     * @todo: Calculate and cache after an activity is imported
     */
    const { status, ranking } = rankingResult;

    if (status === 400) {
      res
        .status(400)
        .json({ error: `Malformed query: ${JSON.stringify(query)}` });
      return;
    }

    res.status(200).json(ranking);
  } catch (error) {
    console.error(error.toString(), query);
    res.status(500).json({ error: "An error occurred" });
  }
}
