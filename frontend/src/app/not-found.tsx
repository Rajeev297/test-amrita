import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main>
      <h1>404 — Page Not Found</h1>
      <Link href="/">Go home</Link>
    </main>
  );
}
