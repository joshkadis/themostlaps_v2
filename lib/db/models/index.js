import AthleteModel from "./Athlete";

// Set as global before export to prevent errors
// during hot reloading in dev mode
global.models = global.models || {};

if (!global.models.Athlete) {
  global.models.Athlete = AthleteModel();
}

const models = () => global.models;

export default models;
