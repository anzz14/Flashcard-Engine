import ChangePasswordForm from "@/components/settings/ChangePasswordForm";
import DangerZone from "@/components/settings/DangerZone";
import ProfileForm from "@/components/settings/ProfileForm";
import ReminderToggle from "@/components/settings/ReminderToggle";
import SettingsSection from "@/components/settings/SettingsSection";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = session!.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      reminderEnabled: true,
      password: true,
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl space-y-10">


      <SettingsSection title="Profile" description="Update your display name.">
        <ProfileForm initialName={user.name ?? ""} initialEmail={user.email} />
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        description="Control how Flashcard Engine contacts you."
      >
        <ReminderToggle initialEnabled={user.reminderEnabled} />
      </SettingsSection>

      {user.password && (
        <SettingsSection title="Password" description="Change your login password.">
          <ChangePasswordForm />
        </SettingsSection>
      )}

      <SettingsSection title="Danger zone">
        <DangerZone />
      </SettingsSection>
    </div>
  );
}

