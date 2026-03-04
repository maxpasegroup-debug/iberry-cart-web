type ErrorContext = {
  route?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

// Sentry-ready hook: replace this with @sentry/nextjs captureException when enabled.
export function captureServerError(error: unknown, context?: ErrorContext) {
  console.error("[iberrycart:error]", {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    sentryEnabled: Boolean(process.env.SENTRY_DSN),
  });
}
