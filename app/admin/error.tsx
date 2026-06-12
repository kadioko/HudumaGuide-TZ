import { ErrorBoundaryProps } from "expo-router";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export default function AdminErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <RouteErrorBoundary title="Admin screen could not load" error={error} retry={retry} />;
}
