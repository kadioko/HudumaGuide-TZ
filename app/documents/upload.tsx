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
import { documentFolders, documentTypeSuggestions } from "@/data/documentFolders";
import { scheduleLocalReminder } from "@/services/reminderService";
import { useAppStore } from "@/store/useAppStore";
import { DocumentFolder, Reminder } from "@/types";

const dateField = z
  .string()
  .optional()
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), "Use YYYY-MM-DD format");

const schema = z.object({
  title: z.string().min(2, "Enter a document title"),
  documentType: z.string().min(2, "Choose or enter a document type"),
  folder: z.enum(documentFolders as [DocumentFolder, ...DocumentFolder[]]),
  expiresOn: dateField,
  reminderOn: dateField,
  fileName: z.string().optional(),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function UploadDocumentScreen() {
  const language = useAppStore((state) => state.language);
  const addDocument = useAppStore((state) => state.addDocument);
  const addReminder = useAppStore((state) => state.addReminder);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      documentType: "NIDA/NIN",
      folder: "Personal Documents",
      expiresOn: "",
      reminderOn: "",
      fileName: "",
      notes: ""
    }
  });

  async function onSubmit(values: FormValues) {
    const now = new Date().toISOString();
    const document = {
      id: `document-${Date.now()}`,
      title: values.title,
      documentType: values.documentType,
      folder: values.folder,
      expiresOn: values.expiresOn || undefined,
      reminderOn: values.reminderOn || undefined,
      notes: values.notes || undefined,
      fileName: values.fileName || undefined,
      createdAt: now,
      updatedAt: now
    };

    addDocument(document);

    if (values.reminderOn) {
      const reminder: Reminder = {
        id: `reminder-${Date.now()}`,
        title: `Document reminder: ${values.title}`,
        category: "document",
        date: values.reminderOn,
        repeat: "none",
        notes: values.expiresOn ? `Expires on ${values.expiresOn}` : values.notes,
        notificationEnabled: true,
        linkedDocumentId: document.id,
        createdAt: now
      };
      addReminder(reminder);
      await scheduleLocalReminder(reminder);
    }

    router.replace("/(tabs)/documents");
  }

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "Add document record" : "Add document record"}
        subtitle={
          language === "sw"
            ? "Hifadhi taarifa muhimu bila kupakia file bado."
            : "Save important metadata without uploading the file yet."
        }
      />
      <InfoBanner
        title="Security note"
        body="For now, store metadata only. Real file upload should require Supabase Auth, private Storage, and RLS before launch."
        tone="warning"
      />

      <AppCard>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextField label="Title" placeholder="NIDA copy, passport, business licence..." value={value} onChangeText={onChange} error={errors.title?.message} />
          )}
        />

        <Controller
          control={control}
          name="documentType"
          render={({ field: { onChange, value } }) => (
            <ChoiceGroup label="Document type" value={value} options={documentTypeSuggestions} onChange={onChange} />
          )}
        />

        <Controller
          control={control}
          name="folder"
          render={({ field: { onChange, value } }) => (
            <ChoiceGroup label="Folder" value={value} options={documentFolders} onChange={onChange} />
          )}
        />
      </AppCard>

      <AppCard>
        <Controller
          control={control}
          name="expiresOn"
          render={({ field: { onChange, value } }) => (
            <TextField label="Expiry date" placeholder="2026-12-31" value={value} onChangeText={onChange} error={errors.expiresOn?.message} />
          )}
        />
        <Controller
          control={control}
          name="reminderOn"
          render={({ field: { onChange, value } }) => (
            <TextField label="Reminder date" placeholder="2026-11-30" value={value} onChangeText={onChange} error={errors.reminderOn?.message} />
          )}
        />
        <Controller
          control={control}
          name="fileName"
          render={({ field: { onChange, value } }) => (
            <TextField label="File reference" placeholder="Optional filename or storage reference" value={value} onChangeText={onChange} />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <TextField label="Notes" placeholder="Where it is kept, application reference, family member..." value={value} onChangeText={onChange} multiline />
          )}
        />
      </AppCard>

      <AppButton title="Save document record" icon="save-outline" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </Screen>
  );
}

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: readonly T[];
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
            key={option}
            accessibilityRole="button"
            accessibilityLabel={option}
            onPress={() => onChange(option)}
            style={[styles.choice, value === option && styles.choiceActive]}
          >
            <AppText variant="small" color={value === option ? colors.surface : colors.text} style={styles.choiceText}>
              {option}
            </AppText>
          </Pressable>
        ))}
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
  }
});
