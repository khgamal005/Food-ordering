// src/app/[locale]/profile/page.tsx

import EditUserForm from "@/components/edit-user-form";
import { Pages, Routes } from "@/constants/enums";
import { Locale } from "@/i18n.config";
import getTrans from "@/lib/translation";
import { authOptions } from "@/server/auth";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;

  // Get session
  const session = await getServerSession(authOptions);

  // Load translations
  const translations = await getTrans(locale);

  // Redirects
  if (!session) {
    redirect(`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`);
  }

  if (session.user.role === UserRole.ADMIN) {
    redirect(`/${locale}/${Routes.ADMIN}`);
  }

  return (
    <main>
      <section className="section-gap">
        <div className="container">
          <h1 className="text-primary text-center font-bold text-4xl italic mb-10">
            {translations.profile.title}
          </h1>
          <EditUserForm user={session.user} translations={translations} />
        </div>
      </section>
    </main>
  );
}
