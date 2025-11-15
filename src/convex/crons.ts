import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check and expire trials every 6 hours
crons.interval(
  "expire trials",
  { hours: 6 },
  internal.trial.expireTrials,
  {}
);

export default crons;
