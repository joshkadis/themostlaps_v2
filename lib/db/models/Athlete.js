import mongoose from "mongoose";
const { model, Schema, Mixed } = mongoose;

function Athlete() {
  const athleteSchema = new Schema(
    {
      _id: Number,
      access_token: { type: String, required: true, unique: true },
      refresh_token: { type: String, default: "" },
      expires_at: { type: Number, default: 0 },
      token_type: { type: String, required: true },
      athlete: {
        firstname: String,
        lastname: String,
        profile: String,
        email: String,
        id: { type: Number, required: true },
        created_at: { type: Date, required: false },
      },
      status: { type: String, required: true, default: "ingesting" },
      last_updated: String, // middleware updates this on each save
      created: { type: String, required: true },
      last_refreshed: { type: Number, required: true },
      stats: { type: Mixed, required: true, default: {} },
      stats_version: String,
      legacyStats: Mixed,
      preferences: {
        notifications: {
          monthly: { type: Boolean, default: true },
        },
      },
      app_version: String, // 'v1' if created before Apr 2020 migration
      locations: [String],
      migration: {
        athleteStats: Boolean,
        ingestcentralpark: Boolean,
        recalculateStats: Boolean,
      },
      summit: { type: Boolean, default: true },
    },
    {
      autoIndex: false,
    }
  );

  athleteSchema.pre("save", () => {
    // @todo Differentiate stats update from profile update
    this.set({
      last_updated: new Date().toISOString(),
    });
  });

  return model("Athlete", athleteSchema);
}

export default Athlete;
