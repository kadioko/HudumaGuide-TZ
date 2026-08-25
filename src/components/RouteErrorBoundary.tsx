import { ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";
import { reportRuntimeIssue } from "@/services/runtimeLogger";

type RouteErrorBoundaryProps = {
  error: Error;
  retry: () => void;
  title: string;
};

export function RouteErrorBoundary({ error, retry, title }: RouteErrorBoundaryProps) {
  useEffect(() => {
    reportRuntimeIssue("route-error-boundary", error, { title });
  }, [error, title]);

  return (
    <Screen>
      <AppCard>
        <AppText variant="title">{title}</AppText>
        <AppText muted>{error.message}</AppText>
        <AppButton title="Try again" icon="refresh-outline" onPress={retry} />
      </AppCard>
    </Screen>
  );
}

/**
 * Expo Router resolves error boundaries from a named `ErrorBoundary` export on
 * the route (or layout) module itself. A default export from a separate file is
 * just another route, so boundaries must be created with this helper and
 * re-exported as `ErrorBoundary` from the module they should protect.
 */
export function createRouteErrorBoundary(title: string) {
  function BoundRouteErrorBoundary({ error, retry }: ErrorBoundaryProps) {
    return <RouteErrorBoundary title={title} error={error} retry={retry} />;
  }

  BoundRouteErrorBoundary.displayName = `ErrorBoundary(${title})`;
  return BoundRouteErrorBoundary;
}
