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
import { AdminCategoryDraft, getLocalAdminCategories, loadAdminCategories, upsertAdminCategory } from "@/services/adminContentService";

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<AdminCategoryDraft[]>(getLocalAdminCategories());
  const [selected, setSelected] = useState<AdminCategoryDraft>(categories[0]);
  const [loadError, setLoadError] = useState<string | undefined>();

  useEffect(() => {
    void loadAdminCategories()
      .then((remoteCategories) => {
        if (remoteCategories.length) {
          setCategories(remoteCategories);
          setSelected(remoteCategories[0]);
        }
      })
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Unable to load remote categories."));
  }, []);

  async function saveCategory() {
    try {
      await upsertAdminCategory(selected);
      setCategories((items) => items.map((item) => (item.slug === selected.slug ? selected : item)));
      Alert.alert("Category saved", "Category review metadata was saved.");
    } catch (error) {
      Alert.alert("Planning mode", error instanceof Error ? error.message : "Unable to save category.");
    }
  }

  return (
    <Screen>
      <SectionHeader title="Service category management" subtitle="Admin-managed directory structure and review metadata." />
      <InfoBanner
        title="Review workflow"
        body="Categories can be draft, needs_review, verified, or outdated. Publish only after content owners confirm wording and scope."
      />
      {loadError ? <InfoBanner title="Remote load issue" body={loadError} tone="warning" /> : null}

      <View style={styles.pills}>
        {categories.map((category) => (
          <Pill key={category.slug} label={category.titleEn} active={selected.slug === category.slug} onPress={() => setSelected(category)} />
        ))}
      </View>

      <AppCard>
        <TextField label="Slug" value={selected.slug} onChangeText={(slug) => setSelected({ ...selected, slug })} />
        <TextField label="English title" value={selected.titleEn} onChangeText={(titleEn) => setSelected({ ...selected, titleEn })} />
        <TextField label="Swahili title" value={selected.titleSw} onChangeText={(titleSw) => setSelected({ ...selected, titleSw })} />
        <TextField label="Icon" value={selected.icon} onChangeText={(icon) => setSelected({ ...selected, icon })} />
        <TextField
          label="Reviewer notes"
          value={selected.reviewerNotes}
          onChangeText={(reviewerNotes) => setSelected({ ...selected, reviewerNotes })}
          multiline
        />
        <View style={styles.pills}>
          {(["draft", "needs_review", "verified", "outdated"] as const).map((status) => (
            <Pill
              key={status}
              label={status}
              active={selected.verificationStatus === status}
              onPress={() => setSelected({ ...selected, verificationStatus: status })}
            />
          ))}
        </View>
        <AppText muted>Published: {selected.published ? "yes" : "no"}</AppText>
        <AppButton title="Toggle published" variant="secondary" onPress={() => setSelected({ ...selected, published: !selected.published })} />
        <AppButton title="Save category" icon="save-outline" onPress={saveCategory} />
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
