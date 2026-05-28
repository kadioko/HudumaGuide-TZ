import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Share, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";
import { BusinessCostEstimate, BusinessStructure, BusinessWizardAnswers } from "@/types";
import { getBusinessCostItems } from "@/utils/businessCompliance";
import { generateBusinessRoadmap } from "@/utils/businessRoadmap";
import { legalTaxNotice, pick } from "@/utils/copy";

const ownershipOptions: BusinessWizardAnswers["ownership"][] = ["alone", "partners"];
const structureOptions: BusinessStructure[] = ["freelancer", "sole_trader", "business_name", "limited_company", "partnership", "ngo"];

export default function BusinessProfileScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const language = useAppStore((state) => state.language);
  const plans = useAppStore((state) => state.businessPlans);
  const reminders = useAppStore((state) => state.reminders);
  const documents = useAppStore((state) => state.userDocuments);
  const updateBusinessPlan = useAppStore((state) => state.updateBusinessPlan);
  const plan = plans.find((item) => item.id === planId) ?? plans[0];
  const [costLabel, setCostLabel] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [costNotes, setCostNotes] = useState("");
  const [businessName, setBusinessName] = useState(plan?.businessName ?? "");
  const [ownerName, setOwnerName] = useState(plan?.ownerName ?? "");
  const [industry, setIndustry] = useState(plan?.industry ?? "");
  const [city, setCity] = useState(plan?.city ?? "");
  const [draftAnswers, setDraftAnswers] = useState<BusinessWizardAnswers | undefined>(plan?.answers);

  if (!plan) {
    return (
      <Screen>
        <AppCard>
          <AppText variant="h2">No business profile</AppText>
        </AppCard>
      </Screen>
    );
  }

  const costItems = getBusinessCostItems(plan);
  const linkedReminderCount = reminders.filter((reminder) => reminder.linkedBusinessPlanId === plan.id).length;
  const linkedDocuments = documents.filter((document) => document.linkedBusinessPlanId === plan.id);
  const costEstimates = plan.costEstimates ?? [];
  const totalCost = costEstimates.reduce((sum, item) => {
    const value = Number((item.amount ?? "").replace(/[^0-9.]/g, ""));
    return Number.isNaN(value) ? sum : sum + value;
  }, 0);
  const totalCostLabel = totalCost ? `TZS ${totalCost.toLocaleString("en-US")}` : "No estimate yet";

  function updateStatus(field: "registrationStatus" | "tinStatus" | "licenceStatus", value: string) {
    updateBusinessPlan({ ...plan, [field]: value });
  }

  function saveBusinessBasics() {
    updateBusinessPlan({
      ...plan,
      businessName: businessName || plan.businessName,
      ownerName: ownerName || plan.ownerName,
      industry: industry || plan.industry,
      city: city || plan.city
    });
    Alert.alert("Business profile", "Business profile updated.");
  }

  function addCostEstimate() {
    if (!costLabel.trim()) {
      Alert.alert("Cost estimate", "Add a label first.");
      return;
    }

    const estimate: BusinessCostEstimate = {
      id: `cost-${Date.now()}`,
      label: costLabel,
      amount: costAmount || undefined,
      notes: costNotes || undefined,
      officialFee: false
    };

    updateBusinessPlan({ ...plan, costEstimates: [estimate, ...costEstimates] });
    setCostLabel("");
    setCostAmount("");
    setCostNotes("");
  }

  function updateDraftAnswer<K extends keyof BusinessWizardAnswers>(key: K, value: BusinessWizardAnswers[K]) {
    setDraftAnswers((current) => (current ? { ...current, [key]: value } : current));
  }

  function saveWizardAssumptions() {
    if (!draftAnswers) {
      return;
    }

    const nextRoadmap = generateBusinessRoadmap(draftAnswers);
    const nextStepIds = new Set(nextRoadmap.map((step) => step.id));
    updateBusinessPlan({
      ...plan,
      answers: draftAnswers,
      structure: draftAnswers.preferredStructure,
      industry: draftAnswers.industry,
      city: draftAnswers.city,
      roadmap: nextRoadmap,
      completedStepIds: plan.completedStepIds.filter((stepId) => nextStepIds.has(stepId)),
      roadmapStepNotes: Object.fromEntries(
        Object.entries(plan.roadmapStepNotes ?? {}).filter(([stepId]) => nextStepIds.has(stepId))
      ),
      roadmapStepCompletedAt: Object.fromEntries(
        Object.entries(plan.roadmapStepCompletedAt ?? {}).filter(([stepId]) => nextStepIds.has(stepId))
      ),
      tinStatus: draftAnswers.hasTin ? "active" : plan.tinStatus,
      licenceStatus: draftAnswers.needsLicence ? plan.licenceStatus ?? "needed" : "not_needed"
    });
    Alert.alert("Business assumptions", "Roadmap updated from the latest answers.");
  }

  async function shareProfile() {
    await Share.share({
      message: [
        `${plan.businessName} - BiasharaStart TZ`,
        `Owner: ${plan.ownerName}`,
        `Structure: ${plan.structure.replace("_", " ")}`,
        `Industry: ${plan.industry}`,
        `City: ${plan.city}`,
        `Progress: ${plan.completedStepIds.length}/${plan.roadmap.length}`,
        `Planning estimates: ${totalCostLabel}`,
        "",
        "Cost estimates are planning notes only, not official fees.",
        legalTaxNotice
      ].join("\n")
    });
  }

  return (
    <Screen>
      <SectionHeader title="Business profile" subtitle={plan.businessName} />
      <AppCard>
        <Pill label={plan.structure.replace("_", " ")} active />
        <TextField label="Business name" value={businessName} onChangeText={setBusinessName} />
        <TextField label="Owner name" value={ownerName} onChangeText={setOwnerName} />
        <TextField label="Industry" value={industry} onChangeText={setIndustry} />
        <TextField label="Region/city" value={city} onChangeText={setCity} />
        <AppButton title="Save business details" icon="save-outline" variant="secondary" onPress={saveBusinessBasics} />
        <AppText variant="h3">Owner</AppText>
        <AppText muted>{plan.ownerName}</AppText>
        <AppText variant="h3">Industry</AppText>
        <AppText muted>{plan.industry}</AppText>
        <AppText variant="h3">Region/city</AppText>
        <AppText muted>{plan.city}</AppText>
        <AppText variant="h3">Registration status</AppText>
        <View style={styles.pills}>
          {(["planning", "in_progress", "registered", "paused"] as const).map((status) => (
            <Pill key={status} label={status} active={(plan.registrationStatus ?? "planning") === status} onPress={() => updateStatus("registrationStatus", status)} />
          ))}
        </View>
        <AppText variant="h3">TIN status</AppText>
        <View style={styles.pills}>
          {(["unknown", "needed", "applied", "active"] as const).map((status) => (
            <Pill key={status} label={status} active={(plan.tinStatus ?? (plan.answers.hasTin ? "active" : "needed")) === status} onPress={() => updateStatus("tinStatus", status)} />
          ))}
        </View>
        <AppText variant="h3">Licence status</AppText>
        <View style={styles.pills}>
          {(["unknown", "not_needed", "needed", "applied", "active"] as const).map((status) => (
            <Pill key={status} label={status} active={(plan.licenceStatus ?? (plan.answers.needsLicence ? "needed" : "not_needed")) === status} onPress={() => updateStatus("licenceStatus", status)} />
          ))}
        </View>
        <AppText variant="h3">Compliance reminders</AppText>
        <AppText muted>{linkedReminderCount} reminders linked to this plan</AppText>
        <AppText variant="h3">Business document folder</AppText>
        <AppText muted>{linkedDocuments.length} document records linked to this business profile</AppText>
        <AppButton title="Add linked document" icon="document-attach-outline" variant="secondary" onPress={() => router.push("/documents/upload")} />
        <AppButton title="Share business profile" icon="share-social-outline" variant="secondary" onPress={shareProfile} />
      </AppCard>

      <AppCard>
        <AppText variant="h3">Linked business documents</AppText>
        {linkedDocuments.length ? (
          linkedDocuments.map((document) => (
            <View key={document.id} style={styles.listItem}>
              <View style={styles.itemCopy}>
                <AppText variant="small" style={styles.bold}>{document.title}</AppText>
                <AppText muted>{document.documentType} - {document.folder}</AppText>
              </View>
              <Pill label={document.fileName ? "file attached" : "metadata only"} />
            </View>
          ))
        ) : (
          <AppText muted>No linked documents yet. Add records for registration, TIN, licence, tax, or contracts from the Document Vault.</AppText>
        )}
      </AppCard>

      {draftAnswers ? (
        <AppCard>
          <AppText variant="h3">Wizard assumptions</AppText>
          <AppText muted>Edit these when the business situation changes. Saving will rebuild the roadmap and keep matching completed steps.</AppText>
          <ChoiceRow
            label="Ownership"
            values={ownershipOptions}
            current={draftAnswers.ownership}
            onChange={(value) => updateDraftAnswer("ownership", value)}
          />
          <ChoiceRow
            label="Business structure"
            values={structureOptions}
            current={draftAnswers.preferredStructure}
            onChange={(value) => updateDraftAnswer("preferredStructure", value)}
          />
          <TextField label="Business idea" value={draftAnswers.businessIdea} onChangeText={(businessIdea) => updateDraftAnswer("businessIdea", businessIdea)} multiline />
          <TextField label="Industry" value={draftAnswers.industry} onChangeText={(nextIndustry) => updateDraftAnswer("industry", nextIndustry)} />
          <TextField label="Region/city" value={draftAnswers.city} onChangeText={(nextCity) => updateDraftAnswer("city", nextCity)} />
          <BooleanRow label="Has NIDA/NIN" value={draftAnswers.hasNida} onChange={(value) => updateDraftAnswer("hasNida", value)} />
          <BooleanRow label="Has TIN" value={draftAnswers.hasTin} onChange={(value) => updateDraftAnswer("hasTin", value)} />
          <BooleanRow label="Has business address" value={draftAnswers.hasAddress} onChange={(value) => updateDraftAnswer("hasAddress", value)} />
          <BooleanRow label="Needs shop/office" value={draftAnswers.needsPhysicalLocation} onChange={(value) => updateDraftAnswer("needsPhysicalLocation", value)} />
          <BooleanRow label="Expects employees" value={draftAnswers.expectsEmployees} onChange={(value) => updateDraftAnswer("expectsEmployees", value)} />
          <BooleanRow label="Needs licence" value={draftAnswers.needsLicence} onChange={(value) => updateDraftAnswer("needsLicence", value)} />
          <BooleanRow label="Needs EFD/VFD" value={draftAnswers.needsEfd} onChange={(value) => updateDraftAnswer("needsEfd", value)} />
          <BooleanRow label="Needs tax reminders" value={draftAnswers.needsTaxReminders} onChange={(value) => updateDraftAnswer("needsTaxReminders", value)} />
          <AppButton title="Save and rebuild roadmap" icon="map-outline" onPress={saveWizardAssumptions} />
        </AppCard>
      ) : null}

      <AppCard>
        <AppText variant="h3">{language === "sw" ? "Cost planning checklist" : "Cost planning checklist"}</AppText>
        <AppText muted>
          {language === "sw"
            ? "Hizi ni cost buckets za kupanga bajeti. Si ada rasmi."
            : "These are planning buckets, not official fees."}
        </AppText>
        {costItems.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={styles.itemCopy}>
            <AppText variant="h3">{pick(language, item.titleSw, item.titleEn)}</AppText>
            <AppText muted>{pick(language, item.noteSw, item.noteEn)}</AppText>
            </View>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <AppText variant="h3">User cost estimates</AppText>
        <AppText muted>Total planning estimate: {totalCostLabel}. These entries are not official fees.</AppText>
        <TextField label="Cost label" value={costLabel} onChangeText={setCostLabel} placeholder="Name search, licence, records..." />
        <TextField label="Amount" value={costAmount} onChangeText={setCostAmount} placeholder="TZS 0" keyboardType="numeric" />
        <TextField label="Notes" value={costNotes} onChangeText={setCostNotes} multiline />
        <AppButton title="Add estimate" icon="add-circle-outline" onPress={addCostEstimate} />
        {costEstimates.map((estimate) => (
          <View key={estimate.id} style={styles.listItem}>
            <View style={styles.itemCopy}>
            <Pill label="not official fee" active />
            <AppText variant="h3">{estimate.label}</AppText>
            <AppText muted>{estimate.amount || "No amount"}</AppText>
            {estimate.notes ? <AppText muted>{estimate.notes}</AppText> : null}
            </View>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <AppText variant="h3">Accountant/lawyer referral</AppText>
        <AppText muted>
          Placeholder only. HudumaGuide TZ does not endorse providers yet, and this is not legal or tax advice. Future referrals should show verification, disclosure, and user choice.
        </AppText>
        <AppButton title="Referral marketplace coming later" icon="people-outline" variant="secondary" disabled onPress={() => undefined} />
      </AppCard>

      <InfoBanner body={legalTaxNotice} tone="warning" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#DDE7E2"
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs
  },
  bold: {
    fontWeight: "800"
  }
});

function BooleanRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.listItem}>
      <View style={styles.itemCopy}>
        <AppText variant="small" style={styles.bold}>{label}</AppText>
      </View>
      <View style={styles.pills}>
        <Pill label="yes" active={value} onPress={() => onChange(true)} />
        <Pill label="no" active={!value} onPress={() => onChange(false)} />
      </View>
    </View>
  );
}

function ChoiceRow<T extends string>({
  label,
  values,
  current,
  onChange
}: {
  label: string;
  values: T[];
  current: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.listItem}>
      <View style={styles.itemCopy}>
        <AppText variant="small" style={styles.bold}>{label}</AppText>
        <View style={styles.pills}>
          {values.map((value) => (
            <Pill key={value} label={value.replace("_", " ")} active={current === value} onPress={() => onChange(value)} />
          ))}
        </View>
      </View>
    </View>
  );
}
