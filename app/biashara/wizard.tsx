import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import { z } from "zod";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { colors, radii, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { BusinessStructure } from "@/types";
import { createBusinessPlan } from "@/utils/businessRoadmap";
import { trustNotice } from "@/utils/copy";

const structureOptions: { value: BusinessStructure; label: string }[] = [
  { value: "freelancer", label: "Freelancer" },
  { value: "sole_trader", label: "Sole trader" },
  { value: "business_name", label: "Business name" },
  { value: "limited_company", label: "Limited company" },
  { value: "partnership", label: "Partnership" },
  { value: "ngo", label: "NGO" }
];

const schema = z.object({
  businessName: z.string().min(2, "Enter the business name or working name"),
  ownerName: z.string().min(2, "Enter owner name"),
  businessIdea: z.string().min(3, "Describe what you are starting"),
  ownership: z.enum(["alone", "partners"]),
  preferredStructure: z.enum(["sole_trader", "business_name", "limited_company", "partnership", "ngo", "freelancer"]),
  hasNida: z.boolean(),
  hasTin: z.boolean(),
  hasAddress: z.boolean(),
  needsPhysicalLocation: z.boolean(),
  industry: z.string().min(2, "Enter your industry"),
  expectsEmployees: z.boolean(),
  needsLicence: z.boolean(),
  needsEfd: z.boolean(),
  needsTaxReminders: z.boolean(),
  city: z.string().min(2, "Enter region or city")
});

type FormValues = z.infer<typeof schema>;

export default function BusinessWizardScreen() {
  const language = useAppStore((state) => state.language);
  const addBusinessPlan = useAppStore((state) => state.addBusinessPlan);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      businessIdea: "",
      ownership: "alone",
      preferredStructure: "business_name",
      hasNida: false,
      hasTin: false,
      hasAddress: false,
      needsPhysicalLocation: false,
      industry: "",
      expectsEmployees: false,
      needsLicence: true,
      needsEfd: false,
      needsTaxReminders: true,
      city: ""
    }
  });

  function onSubmit(values: FormValues) {
    const plan = createBusinessPlan(values, values.businessName, values.ownerName);
    addBusinessPlan(plan);
    router.replace({ pathname: "/biashara/roadmap", params: { planId: plan.id } });
  }

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "Business setup wizard" : "Business setup wizard"}
        subtitle={language === "sw" ? "Jibu maswali haya kupata roadmap yako." : "Answer these questions to get your roadmap."}
      />
      <InfoBanner title="Before you start" body={trustNotice} tone="warning" />

      <AppCard>
        <Controller
          control={control}
          name="businessName"
          render={({ field: { onChange, value } }) => (
            <TextField label="Business name / working name" value={value} onChangeText={onChange} error={errors.businessName?.message} />
          )}
        />
        <Controller
          control={control}
          name="ownerName"
          render={({ field: { onChange, value } }) => (
            <TextField label="Owner name" value={value} onChangeText={onChange} error={errors.ownerName?.message} />
          )}
        />
        <Controller
          control={control}
          name="businessIdea"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="What business are you starting?"
              value={value}
              onChangeText={onChange}
              multiline
              error={errors.businessIdea?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="industry"
          render={({ field: { onChange, value } }) => (
            <TextField label="Industry" placeholder="Food, retail, consultancy, online services..." value={value} onChangeText={onChange} error={errors.industry?.message} />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, value } }) => (
            <TextField label="Region/city" placeholder="Dar es Salaam, Arusha, Mwanza..." value={value} onChangeText={onChange} error={errors.city?.message} />
          )}
        />
      </AppCard>

      <AppCard>
        <Controller
          control={control}
          name="ownership"
          render={({ field: { onChange, value } }) => (
            <ChoiceGroup
              label="Are you alone or with partners?"
              value={value}
              options={[
                { label: "Alone", value: "alone" },
                { label: "With partners", value: "partners" }
              ]}
              onChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="preferredStructure"
          render={({ field: { onChange, value } }) => (
            <ChoiceGroup label="Preferred business structure" value={value} options={structureOptions} onChange={onChange} />
          )}
        />
      </AppCard>

      <AppCard>
        <Controller control={control} name="hasNida" render={({ field }) => <BooleanChoice label="Do you already have NIDA/NIN?" value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="hasTin" render={({ field }) => <BooleanChoice label="Do you already have TIN?" value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="hasAddress" render={({ field }) => <BooleanChoice label="Do you have a business address?" value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="needsPhysicalLocation" render={({ field }) => <BooleanChoice label="Do you need a shop or office?" value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="expectsEmployees" render={({ field }) => <BooleanChoice label="Do you expect employees?" value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="needsLicence" render={({ field }) => <BooleanChoice label="Will you need a business licence?" value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="needsEfd" render={({ field }) => <BooleanChoice label="Will you need EFD/VFD?" value={field.value} onChange={field.onChange} />} />
        <Controller control={control} name="needsTaxReminders" render={({ field }) => <BooleanChoice label="Do you need tax reminders?" value={field.value} onChange={field.onChange} />} />
      </AppCard>

      <AppButton title="Generate Business Roadmap" icon="map-outline" onPress={handleSubmit(onSubmit)} />
    </Screen>
  );
}

type ChoiceOption<T extends string> = {
  label: string;
  value: T;
};

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.choiceWrapper}>
      <AppText variant="small" style={styles.choiceLabel}>
        {label}
      </AppText>
      <View style={styles.choiceGrid}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={[styles.choice, value === option.value && styles.choiceActive]}
          >
            <AppText variant="small" color={value === option.value ? colors.surface : colors.text} style={styles.choiceText}>
              {option.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function BooleanChoice({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.booleanRow}>
      <AppText variant="small" style={styles.booleanLabel}>
        {label}
      </AppText>
      <View style={styles.booleanChoices}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(true)}
          style={[styles.booleanChip, value && styles.choiceActive]}
        >
          <AppText variant="small" color={value ? colors.surface : colors.text} style={styles.choiceText}>
            Yes
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange(false)}
          style={[styles.booleanChip, !value && styles.choiceActive]}
        >
          <AppText variant="small" color={!value ? colors.surface : colors.text} style={styles.choiceText}>
            No
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  choiceWrapper: {
    gap: spacing.sm
  },
  choiceLabel: {
    fontWeight: "800"
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill
  },
  choiceActive: {
    backgroundColor: colors.green,
    borderColor: colors.green
  },
  choiceText: {
    fontWeight: "800"
  },
  booleanRow: {
    gap: spacing.sm
  },
  booleanLabel: {
    fontWeight: "800"
  },
  booleanChoices: {
    flexDirection: "row",
    gap: spacing.sm
  },
  booleanChip: {
    minWidth: 78,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill
  }
});
