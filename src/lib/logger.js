import { Logtail } from "@logtail/js";
import { Logtail as LogtailNode } from "@logtail/node";

let logger;

if (typeof window === "undefined") {
  // Backend (Node.js) environment
  if (!process.env.LOGTAIL_SOURCE_TOKEN) {
    console.warn("LOGTAIL_SOURCE_TOKEN is not set. Logs will not be sent to Logtail.");
    // Create a dummy logger that does nothing
    logger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };
  } else {
    logger = new LogtailNode(process.env.LOGTAIL_SOURCE_TOKEN);
  }
} else {
  // Frontend (browser) environment
  if (!process.env.NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN) {
    console.warn("NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN is not set. Logs will not be sent to Logtail.");
    // Create a dummy logger that does nothing
    logger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };
  } else {
    logger = new Logtail(process.env.NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN);
  }
}

export default logger;
