// A simple logger that sends logs to our API proxy route.
// This avoids bundling the Logtail package on the client.

const sendLog = (level, message, context = {}) => {
  // We don't want to log during server-side rendering
  if (typeof window === 'undefined') {
    return;
  }

  fetch('/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      level,
      message,
      context,
    }),
  }).catch(console.error); // Log fetch errors to the console
};

const logger = {
  info: (message, context) => sendLog('info', message, context),
  warn: (message, context) => sendLog('warn', message, context),
  error: (message, context) => sendLog('error', message, context),
};

export default logger;
