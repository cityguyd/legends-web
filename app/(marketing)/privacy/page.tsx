import { LegalArticle } from "@/components/marketing/LegalArticle";

export const revalidate = 3600;

export const metadata = {
  title: "Privacy Policy — Legends Library",
};

export default function PrivacyPage() {
  return <LegalArticle file="privacy.md" />;
}
