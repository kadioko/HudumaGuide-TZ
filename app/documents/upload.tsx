import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
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
import { isSupabaseConfigured } from "@/lib/supabase";
import { captureDocumentImage, pickDocumentFile, PickedDocumentFile, uploadDocumentFile } from "@/services/documentStorageService";
import { scheduleLocalReminder } from "@/services/reminderService";
import { useAppStore } from "@/store/useAppStore";
import { DocumentFolder, Reminder } from "@/types";
import { createClientId } from "@/utils/ids";

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
  const businessPlans = useAppStore((state) => state.businessPlans);
  const userProfile = useAppStore((state) => state.userProfile);
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
  const [linkedBusinessPlanId, setLinkedBusinessPlanId] = useState<string | undefined>();
  const [pickedFile, setPickedFile] = useState<PickedDocumentFile | undefined>();
  const [uploadError, setUploadError] = useState<string | undefined>();

  async function chooseFile() {
    setUploadError(undefined);
    try {
      const file = await pickDocumentFile();
      if (file) {
        setPickedFile(file);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to pick file.");
    }
  }

  async function captureFile() {
    setUploadError(undefined);
    try {
      const file = await captureDocumentImage();
      if (file) {
        setPickedFile(file);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to capture document image.");
    }
  }

  async function onSubmit(values: FormValues) {
    const now = new Date().toISOString();
    const documentId = createClientId("document");
    let storagePath = values.fileName || undefined;

    if (pickedFile) {
      if (!isSupabaseConfigured || !userProfile) {
        setUploadError("Sign in with Supabase before uploading private document files.");
        return;
      }

      try {
        storagePath = await uploadDocumentFile(pickedFile, userProfile.id, documentId);
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Document file upload failed.");
        return;
      }
    }

    const document = {
      id: documentId,
      title: values.title,
      documentType: values.documentType,
      folder: values.folder,
      expiresOn: values.expiresOn || undefined,
      reminderOn: values.reminderOn || undefined,
      notes: values.notes || undefined,
      fileName: storagePath,
      mimeType: pickedFile?.mimeType,
      linkedBusinessPlanId,
      createdAt: now,
      updatedAt: now
    };

    addDocument(document);

    if (values.reminderOn) {
      const reminder: Reminder = {
        id: createClientId("reminder"),
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
            ? "Hifadhi taarifa muhimu na pakia file kwa usalama ukiwa umeingia."
            : "Save important metadata and upload a private file when signed in."
        }
      />
      <InfoBanner
        title="Security note"
        body="Metadata is available offline. File upload requires sign-in and private Supabase Storage; file contents are not used for analytics."
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
        {businessPlans.length ? (
          <ChoiceGroup
            label="Linked business profile"
            value={linkedBusinessPlanId ?? "none"}
            options={["none", ...businessPlans.map((plan) => plan.id)]}
            getLabel={(value) => businessPlans.find((plan) => plan.id === value)?.businessName ?? "None"}
            onChange={(value) => setLinkedBusinessPlanId(value === "none" ? undefined : value)}
          />
        ) : null}
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
        <AppButton title={pickedFile ? "Change selected file" : "Pick file to upload"} icon="attach-outline" variant="secondary" onPress={chooseFile} />
        <AppButton title="Capture with camera" icon="camera-outline" variant="secondary" onPress={captureFile} />
        {pickedFile ? (
          <InfoBanner
            title="Selected file"
            body={`${pickedFile.name}${pickedFile.size ? ` (${Math.round(pickedFile.size / 1024)} KB)` : ""}`}
          />
        ) : null}
        {uploadError ? <InfoBanner title="Upload issue" body={uploadError} tone="warning" /> : null}
        <Controller
          control={control}
          name="fileName"
          render={({ field: { onChange, value } }) => (
            <TextField label="Manual file reference" placeholder="Optional filename or storage reference" value={value} onChangeText={onChange} />
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
  getLabel,
  onChange
}: {
  label: string;
  value: T;
  options: readonly T[];
  getLabel?: (value: T) => string;
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
              {getLabel ? getLabel(option) : option}
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
