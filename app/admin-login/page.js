import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import AdminLoginForm from "@/components/AdminLoginForm";
import { ADMIN_SESSION_COOKIE, getAdminSessionRole } from "@/lib/adminSession";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || "";

  if (getAdminSessionRole(sessionToken)) {
    redirect("/admin-preview");
  }

  return (
    <SiteShell lang="hi">
      <div className="max-w-content mx-auto px-4 py-12 flex justify-center">
        <AdminLoginForm />
      </div>
    </SiteShell>
  );
}
