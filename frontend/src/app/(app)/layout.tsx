import { PageContainer } from "@/components/common";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PageContainer>{children}</PageContainer>;
}
