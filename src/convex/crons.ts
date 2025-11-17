import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Check and expire trials every 6 hours
// Type assertion to avoid excessive type depth error
const expireTrialsRef = (internal as any).trial.expireTrials;
crons.interval(
  "expire trials",
  { hours: 6 },
  expireTrialsRef,
  {}
);

export default crons;