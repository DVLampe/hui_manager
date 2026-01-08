import { Logtail } from "@logtail/node";

let logger;

const environment = process.env.NODE_ENV || 'development';

// This logger is for the Node.js environment only.
if (process.env.LOGTAIL_SOURCE_TOKEN && process.env.LOGTAIL_INGEST_HOST) {
  const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
    endpoint: `https://${process.env.LOGTAIL_INGEST_HOST}`,
  });

  // Wrap the logger to add environment context automatically
  logger = {
    info: (message, context = {}) => logtail.info(message, { ...context, environment }),
    warn: (message, context = {}) => logtail.warn(message, { ...context, environment }),
    error: (message, context = {}) => logtail.error(message, { ...context, environment }),
  };
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
