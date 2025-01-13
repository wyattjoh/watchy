import { QueryProvider } from "@/components/query-provider";
import "./layout.css";
import ServiceRevalidator from "@/components/service-revalidator";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          <main>{children}</main>
          <ServiceRevalidator />
        </QueryProvider>
      </body>
    </html>
  );
}
