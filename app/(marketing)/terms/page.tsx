import { LegalArticle } from "@/components/marketing/LegalArticle";

export const revalidate = 3600;

export const metadata = {
  title: "Terms of Service — Legends Library",
};

export default function TermsPage() {
  return <LegalArticle file="terms.md" />;
}
