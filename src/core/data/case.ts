import type { CaseScreenType } from "@ctypes/case";
import { getImageGlob } from "src/assets/js/utils/astro";

export const CaseScreensData: CaseScreenType[] = [
  {
    title: "como.salon",
    image: getImageGlob(import.meta.glob<{ default: ImageMetadata }>("/src/assets/images/Projects/*"), "1.jpg"),
  },
  {
    title: "nastoyashchee",
    image: getImageGlob(import.meta.glob<{ default: ImageMetadata }>("/src/assets/images/Projects/*"), "2.jpg"),
  },
  {
    title: "duderhof club",
    image: getImageGlob(import.meta.glob<{ default: ImageMetadata }>("/src/assets/images/Projects/*"), "3.jpg"),
  },
];
