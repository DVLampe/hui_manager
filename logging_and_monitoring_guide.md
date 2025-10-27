# Guide to Logging and Monitoring in Next.js

This guide provides an overview of how to add logging and monitoring to your Next.js application. We'll cover the key concepts, recommend some excellent and affordable tools, and help you get started with implementation.

## Understanding Logging and Monitoring

**Logging** is the practice of recording events, errors, and other important information that occurs while your application is running. It's crucial for debugging issues and understanding how your application behaves.

**Monitoring** is the process of collecting and analyzing data about your application's performance and health. This includes tracking metrics like response times, error rates, and resource usage.

In a Next.js application, it's helpful to think about two types of logging:

1.  **Frontend (Client-Side) Logging:** This captures events that happen in the user's browser. It's useful for understanding user behavior, tracking UI interactions, and debugging frontend-specific issues.

2.  **Backend (Server-Side) Logging:** This captures events that happen on the server, such as in your API routes or during server-side rendering (SSR). It's essential for monitoring the health of your backend, diagnosing server errors, and tracking business logic.

## Recommended Tools

Here are some of the best ready-made and inexpensive solutions for logging and monitoring in a Next.js application. All of these services have generous free tiers that are perfect for getting started.

| Tool | Best For | Free Tier | Key Features |
| :--- | :--- | :--- | :--- |
| **Vercel Analytics & Logs** | Simplicity and seamless integration with Vercel hosting | Analytics: 5,000 events/month<br/>Logs: 100 MB/day | - Zero-config setup for projects on Vercel<br/>- Real-time log streaming<br/>- Web Vitals and audience analytics |
| **Logtail** | Dedicated logging with a great user interface | 1 GB/month with 3-day retention | - Easy integration with Next.js<br/>- Structured logging<br/>- SQL-based log querying |
| **Sentry** | Error monitoring and performance tracking | 5,000 errors/month | - Detailed error reports with stack traces<br/>- Performance monitoring (transactions, Web Vitals)<br/>- Release health tracking |
| **Better Stack** | All-in-one logging, monitoring, and status pages | 1 GB/month with 3-day retention | - Similar to Logtail, but with more features<br/>- Uptime monitoring and incident management<br/>- Public status pages |

## Which Tool Should You Choose?

-   If your application is hosted on **Vercel**, starting with **Vercel Analytics & Logs** is the easiest option. It requires no code changes to get started.
-   If you need more advanced logging features, such as structured logging and complex querying, **Logtail** or **Better Stack** are excellent choices.
-   If your primary goal is to track and debug errors, **Sentry** is the industry standard and provides powerful tools for error analysis.

Please review these options and let me know which tool you'd like to integrate into your application. Once you've decided, I can guide you through the implementation steps.

## How to Get Your Logtail Source Token

To connect your application to Logtail, you need a "Source Token." Here’s how to get one:

1.  **Register for a Logtail Account:**
    *   Go to the [Logtail website](https://logtail.com/) and sign up for a free account. You can usually sign up with your Google, GitHub, or email account.

2.  **Navigate to the Logs Section and Create a Source:**
    *   After logging in, you might land on the "Uptime" dashboard. Look for a navigation menu on the left side of the screen.
    *   Click on **"Logs"** in the menu to switch to the logging product.
    *   Once you are in the "Logs" section, look for a button that says **"Add source"** or **"Create source."**
    *   Give your source a name (e.g., "Hui Manager App").
    *   Select **"JavaScript"** as the platform.

3.  **Copy the Source Token and Ingesting Host:**
    *   Once the source is created, Logtail will display a **Source Token** and an **Ingesting host** (e.g., `in.logtail.com`).
    *   Copy both of these values.

4.  **Add the Token to Your `.env` File:**
    *   Open the `.env` file in your project.
    *   Paste the token you copied into the `LOGTAIL_SOURCE_TOKEN` and `NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN` variables, like this:

    ```env
    # From the Better Stack "Source" page
    LOGTAIL_SOURCE_TOKEN="your-copied-source-token-here"
    NEXT_PUBLIC_LOGTAIL_SOURCE_TOKEN="your-copied-source-token-here"
    LOGTAIL_INGEST_HOST="your-copied-ingesting-host-here" # e.g., in.logtail.com
    ```

5.  **Restart Your Application:**
    *   Stop your Next.js development server if it's running.
    *   Start it again (`npm run dev`). This is important so that your application loads the new token from the `.env` file.

That's it! Your application will now be able to send logs to your Logtail dashboard.

## How to Set Up Uptime Monitoring

Better Stack also provides a ready-made uptime monitoring service to alert you if your application goes down. Here’s how to set it up:

1.  **Navigate to the Uptime Section:**
    *   In your Better Stack dashboard, look for a navigation menu on the left side of the screen.
    *   Click on **"Uptime"** to switch to the monitoring product.

2.  **Create a Monitor (for your Deployed Website):**
    *   **Important:** Uptime monitoring only works for publicly accessible URLs, not for `localhost`. You can set this up once your website is live on the internet.
    *   Click the **"Create monitor"** button.
    *   In the **"URL to monitor"** field, enter the full public URL for your health check endpoint. For example: `https://your-website-domain.com/api/health`.
    *   Give the monitor a name (e.g., "Hui Manager App").

3.  **Configure Alerts (Optional):**
    *   You can configure how and when you want to receive alerts (e.g., by email if the site is down for more than 1 minute).

4.  **Save the Monitor:**
    *   Click **"Save changes."**

Better Stack will now check your application every few minutes. You can see the status, response time, and any downtime incidents in the Uptime dashboard.
