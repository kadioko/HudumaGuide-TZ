import { ErrorBoundaryProps } from "expo-router";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export default function TabsErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <RouteErrorBoundary title="Tab could not load" error={error} retry={retry} />;
}
