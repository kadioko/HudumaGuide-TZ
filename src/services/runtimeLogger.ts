type RuntimeLogContext = Record<string, string | number | boolean | undefined>;

export type RuntimeIssueLog = {
  scope: string;
  message: string;
  context: RuntimeLogContext;
  createdAt: string;
};

const runtimeIssues: RuntimeIssueLog[] = [];
const maxRuntimeIssues = 50;

export function reportRuntimeIssue(scope: string, error: unknown, context: RuntimeLogContext = {}) {
  const message = error instanceof Error ? error.message : String(error);
  const issue = {
    scope,
    message,
    context,
    createdAt: new Date().toISOString()
  };

  runtimeIssues.unshift(issue);
  runtimeIssues.splice(maxRuntimeIssues);

  if (__DEV__) {
    console.warn(`[${scope}] ${message}`, context);
  }

  const endpoint = process.env.EXPO_PUBLIC_RUNTIME_LOG_ENDPOINT;
  if (endpoint) {
    void fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(issue)
    }).catch(() => undefined);
  }
}

export function getRuntimeIssueLog() {
  return [...runtimeIssues];
}
