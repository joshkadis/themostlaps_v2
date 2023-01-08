import models from "lib/db/models";
import APIAthlete from "lib/api/models/APIAthlete";

const { Athlete } = models();
const DEFAULT_PER_PAGE = "25";
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

  const { location = "", type = "" } = query;
  if (!LOCATIONS.includes(location)) {
    return { status: 404 };
  }

  let sort = {};
  if (type) {
    sort = { [`stats.locations.${location}.${type}`]: -1 };
  }

  // @todo skip and limit, transform into APIAthlete
  const athleteDocs = await Athlete.find(
    { locations: location },
    `_id athlete.firstname athlete.lastname athlete.profile stats.locations.${location}.${type}`,
    { sort }
  );
  if (!athleteDocs?.length) {
    return { status: 200, ranking: [] };
  }
}

export default rankingForLocation;
