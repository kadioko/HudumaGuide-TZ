import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { TextField } from "@/components/TextField";
import { spacing } from "@/constants/theme";
import { AdminGuideDraft, getLocalAdminGuides, loadAdminGuides, upsertAdminGuide } from "@/services/adminContentService";

export default function AdminGuidesScreen() {
  const [guides, setGuides] = useState<AdminGuideDraft[]>(getLocalAdminGuides());
  const [selected, setSelected] = useState<AdminGuideDraft>(guides[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>();

  useEffect(() => {
    void loadAdminGuides()
      .then((remoteGuides) => {
        if (remoteGuides.length) {
          setGuides(remoteGuides);
          setSelected(remoteGuides[0]);
        }
        setLoadError(undefined);
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Unable to load remote guides."))
      .finally(() => setIsLoading(false));
  }, []);

  async function saveGuide() {
    const officialUrl = selected.verificationStatus === "verified" ? selected.officialUrl : "TO_BE_VERIFIED";
    const next = {
      ...selected,
      officialUrl,
      published: selected.published && selected.verificationStatus === "verified"
    };

    try {
      await upsertAdminGuide(next);
      setSelected(next);
      setGuides((items) => items.map((item) => (item.slug === next.slug ? next : item)));
      Alert.alert("Guide saved", "Guide review metadata was saved.");
    } catch (error) {
      Alert.alert("Planning mode", error instanceof Error ? error.message : "Unable to save guide.");
    }
  }

  return (
    <Screen>
      <SectionHeader title="Service guide management" subtitle="Verification, publishing, official links, and review notes." />
      <InfoBanner
        title="Official-link rule"
        body="Keep official_url as TO_BE_VERIFIED until a reviewer marks the guide verified and records official-source references."
        tone="warning"
      />
      {isLoading ? <InfoBanner title="Loading remote guides" body="Fetching admin guide records from Supabase." /> : null}
      {loadError ? <InfoBanner title="Remote load issue" body={loadError} tone="warning" /> : null}

      <View style={styles.pills}>
        {guides.map((guide) => (
          <Pill key={guide.slug} label={guide.titleEn} active={selected.slug === guide.slug} onPress={() => setSelected(guide)} />
        ))}
      </View>

      <AppCard>
        <TextField label="Slug" value={selected.slug} onChangeText={(slug) => setSelected({ ...selected, slug })} />
        <TextField label="English title" value={selected.titleEn} onChangeText={(titleEn) => setSelected({ ...selected, titleEn })} />
        <TextField label="Swahili title" value={selected.titleSw} onChangeText={(titleSw) => setSelected({ ...selected, titleSw })} />
        <TextField label="English summary" value={selected.summaryEn} onChangeText={(summaryEn) => setSelected({ ...selected, summaryEn })} multiline />
        <TextField label="Swahili summary" value={selected.summarySw} onChangeText={(summarySw) => setSelected({ ...selected, summarySw })} multiline />
        <InfoBanner
          title="Structured guide editor"
          body="Edit arrays for required documents, steps, and FAQs as JSON. This is the beta admin bridge before a richer visual editor."
        />
        <TextField label="Required documents JSON" value={selected.requiredDocumentsJson} onChangeText={(requiredDocumentsJson) => setSelected({ ...selected, requiredDocumentsJson })} multiline />
        <TextField label="Steps JSON" value={selected.stepsJson} onChangeText={(stepsJson) => setSelected({ ...selected, stepsJson })} multiline />
        <TextField label="FAQs JSON" value={selected.faqsJson} onChangeText={(faqsJson) => setSelected({ ...selected, faqsJson })} multiline />
        <TextField label="Official URL" value={selected.officialUrl} onChangeText={(officialUrl) => setSelected({ ...selected, officialUrl })} />
        <TextField
          label="Official-source references"
          value={(selected.officialSourceRefs ?? []).join("\n")}
          onChangeText={(value) =>
            setSelected({
              ...selected,
              officialSourceRefs: value.split("\n").map((item) => item.trim()).filter(Boolean)
            })
          }
          multiline
        />
        <TextField label="Last verified at" placeholder="2026-05-10" value={selected.lastVerifiedAt} onChangeText={(lastVerifiedAt) => setSelected({ ...selected, lastVerifiedAt })} />
        <TextField label="Review expires at" placeholder="2026-08-10" value={selected.expiresReviewAt} onChangeText={(expiresReviewAt) => setSelected({ ...selected, expiresReviewAt })} />
        <TextField label="Reviewer notes" value={selected.reviewerNotes} onChangeText={(reviewerNotes) => setSelected({ ...selected, reviewerNotes })} multiline />
        <InfoBanner
          title="Msaidizi controls"
          body="Exclude guides from assistant answers when content is uncertain, stale, or missing official-source review."
          tone="warning"
        />
        <AppText muted>Msaidizi enabled: {selected.msaidiziEnabled === false ? "no" : "yes"}</AppText>
        <AppButton
          title={selected.msaidiziEnabled === false ? "Enable for Msaidizi" : "Exclude from Msaidizi"}
          variant="secondary"
          onPress={() => setSelected({ ...selected, msaidiziEnabled: selected.msaidiziEnabled === false })}
        />
        <TextField
          label="Msaidizi exclusion reason"
          value={selected.msaidiziExcludedReason}
          onChangeText={(msaidiziExcludedReason) => setSelected({ ...selected, msaidiziExcludedReason })}
          multiline
        />

        <View style={styles.pills}>
          {(["draft", "needs_review", "verified", "outdated"] as const).map((status) => (
            <Pill key={status} label={status} active={selected.verificationStatus === status} onPress={() => setSelected({ ...selected, verificationStatus: status })} />
          ))}
        </View>
        <AppText muted>Published: {selected.published ? "yes" : "no"}; effective publish requires verified status.</AppText>
        <AppButton title="Toggle published" variant="secondary" onPress={() => setSelected({ ...selected, published: !selected.published })} />
        <AppButton title="Save guide" icon="save-outline" onPress={saveGuide} />
      </AppCard>

      <AppCard muted>
        <AppText variant="h3">Content review checklist</AppText>
        <AppText muted>Fees: no exact amount unless verified and dated.</AppText>
        <AppText muted>Documents: confirm required vs optional documents.</AppText>
        <AppText muted>Steps: confirm order, office/channel, and no approval guarantee.</AppText>
        <AppText muted>Offices: confirm physical-location guidance and regional differences.</AppText>
        <AppText muted>Legal/tax: include general-guidance disclaimer and official-source confirmation.</AppText>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
