import { Logtail } from "@logtail/node";

let logger;

// This logger is for the Node.js environment only.
if (process.env.LOGTAIL_SOURCE_TOKEN && process.env.LOGTAIL_INGEST_HOST) {
  logger = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
    endpoint: `https://${process.env.LOGTAIL_INGEST_HOST}`,
  });
} else {
  console.warn("LOGTAIL_SOURCE_TOKEN is not set. Logs will not be sent to Logtail.");
  // Create a dummy logger that does nothing
  logger = {
    info: () => {},
    warn: () => {},
    error: () => {},
  };
}

export default logger;
