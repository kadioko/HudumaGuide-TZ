import { ErrorBoundaryProps } from "expo-router";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export default function AuthErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <RouteErrorBoundary title="Account screen could not load" error={error} retry={retry} />;
}
