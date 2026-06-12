import { LegalArticle } from "@/components/marketing/LegalArticle";

export const revalidate = 3600;

export const metadata = {
  title: "Disclaimer — Legends Library",
};

export default function DisclaimerPage() {
  return <LegalArticle file="disclaimer.md" />;
}
