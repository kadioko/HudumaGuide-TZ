import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { Screen } from "@/components/Screen";

type RouteErrorBoundaryProps = {
  error: Error;
  retry: () => void;
  title: string;
};

export function RouteErrorBoundary({ error, retry, title }: RouteErrorBoundaryProps) {
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
