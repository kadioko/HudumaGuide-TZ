import { ErrorBoundaryProps } from "expo-router";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export default function ServiceErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <RouteErrorBoundary title="Service guide could not load" error={error} retry={retry} />;
}
