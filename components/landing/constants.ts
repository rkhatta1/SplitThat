import {
  Invoice01Icon,
  UserGroupIcon,
  FlashIcon,
  Share01Icon,
  Shield01Icon,
  JusticeScale01Icon,
} from "@hugeicons/core-free-icons";

export interface NavItem {
  label: string;
  href: string;
}

export interface FeatureItem {
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Performance", href: "#stats" },
  { label: "Features", href: "#features" },
];

export const HERO_CONTENT = {
  title: "Split bills with absolute precision.",
  subtitle: "SplitThat uses Gemini AI to extract items from receipts, calculate fair tax & tip, and sync directly to Splitwise. No more manual entry.",
  cta: "Start Splitting"
};

export const FEATURES_GRID: FeatureItem[] = [
  {
    title: "AI Receipt Processing",
    description: "Upload any receipt. Our Gemini 2.5 Flash integration extracts items, prices, and complex modifiers in seconds.",
    icon: Invoice01Icon
  },
  {
    title: "Fair Distribution",
    description: "Tax and tip are calculated proportionally based on exactly what each person ordered. No more guessing.",
    icon: JusticeScale01Icon
  },
  {
    title: "Splitwise Sync",
    description: "Seamless OAuth integration. Publish itemized expenses directly to your groups without leaving the app.",
    icon: Share01Icon
  },
  {
    title: "Collaborative Editing",
    description: "Invite friends to claim their items in real-time. Everyone sees the same breakdown.",
    icon: UserGroupIcon
  },
  {
    title: "Smart Caching",
    description: "We hash every receipt. Re-uploading the same image fetches instant results without hitting the API.",
    icon: FlashIcon
  },
  {
    title: "Secure & Private",
    description: "Your data is encrypted. We only ask for the permissions we need to make your life easier.",
    icon: Shield01Icon
  }
];

// Recharts dummy data
export const CHART_DATA = [
  { name: 'Manual', time: 120, accuracy: 85 },
  { name: 'OCR', time: 45, accuracy: 92 },
  { name: 'SplitThat AI', time: 10, accuracy: 99.8 },
];
