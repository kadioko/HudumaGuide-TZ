import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppText } from "@/components/AppText";
import { InfoBanner } from "@/components/InfoBanner";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { colors, spacing } from "@/constants/theme";
import { useAppStore } from "@/store/useAppStore";

const folders = [
  "Personal Documents",
  "Business Documents",
  "Tax Documents",
  "Licences",
  "Land/Property",
  "Education",
  "Family Documents",
  "Other"
];

export default function DocumentsScreen() {
  const language = useAppStore((state) => state.language);

  return (
    <Screen>
      <SectionHeader
        title={language === "sw" ? "Document Vault" : "Document Vault"}
        subtitle={language === "sw" ? "Imeandaliwa kwa version inayofuata." : "Prepared for the next product slice."}
      />
      <InfoBanner
        title="Next module"
        body="The first working MVP focuses on guides, checklists, BiasharaStart, and reminders. Secure Supabase Storage uploads come next."
      />
      <AppButton title="Upload document" icon="cloud-upload-outline" variant="secondary" onPress={() => router.push("/documents/upload")} />
      <View style={styles.grid}>
        {folders.map((folder) => (
          <AppCard key={folder} style={styles.folder}>
            <Ionicons name="folder-open-outline" size={26} color={colors.green} />
            <AppText variant="small" style={styles.folderTitle}>
              {folder}
            </AppText>
          </AppCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  folder: {
    width: "47%",
    minHeight: 112,
    justifyContent: "center"
  },
  folderTitle: {
    fontWeight: "800"
  }
});
