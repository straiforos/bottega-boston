declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    MEDIA: R2Bucket;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    RESEND_API_KEY: string;
    RESEND_WEBHOOK_SECRET: string;
    CRON_SECRET: string;
    S3_ENDPOINT: string;
    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;
    R2_PUBLIC_BASE_URL: string;
    TURNSTILE_SECRET_KEY: string;
    TURNSTILE_SITE_KEY: string;
    /** Absolute origin used when the email cron runs without an HTTP request. */
    SITE_ORIGIN: string;
  }
}

type CloudflareEnv = Cloudflare.Env;

declare namespace NodeJS {
  interface ProcessEnv extends Partial<CloudflareEnv> {
    VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY?: string;
    VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID?: string;
  }
}
