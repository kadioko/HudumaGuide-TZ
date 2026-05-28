import AsyncStorage from "@react-native-async-storage/async-storage";
import { serviceGuides } from "@/data/serviceGuides";
import { OfflineGuideCacheMeta, ServiceGuide } from "@/types";

const GUIDE_CACHE_KEY = "hudumaguide-tz-guide-cache";
const GUIDE_CACHE_META_KEY = "hudumaguide-tz-guide-cache-meta";

export async function cachePublishedGuides(savedGuideSlugs: string[] = []) {
  const publishedGuides = serviceGuides.filter((guide) => guide.published !== false);
  const meta: OfflineGuideCacheMeta = {
    cachedAt: new Date().toISOString(),
    guideCount: publishedGuides.length,
    savedGuideSlugs
  };

  await AsyncStorage.multiSet([
    [GUIDE_CACHE_KEY, JSON.stringify(publishedGuides)],
    [GUIDE_CACHE_META_KEY, JSON.stringify(meta)]
  ]);

  return meta;
}

export async function getCachedGuideMeta() {
  const value = await AsyncStorage.getItem(GUIDE_CACHE_META_KEY);
  return value ? (JSON.parse(value) as OfflineGuideCacheMeta) : undefined;
}

export async function getCachedGuides() {
  const value = await AsyncStorage.getItem(GUIDE_CACHE_KEY);
  return value ? (JSON.parse(value) as ServiceGuide[]) : [];
}

export async function getOfflineGuideBySlug(slug: string) {
  const guides = await getCachedGuides();
  return guides.find((guide) => guide.slug === slug) ?? serviceGuides.find((guide) => guide.slug === slug);
}
