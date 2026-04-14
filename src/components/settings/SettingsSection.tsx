import type { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h3 className="text-base font-medium text-[#ff6a3d]">{title}</h3>
        {description ? <p className="text-sm text-white">{description}</p> : null}
      </header>

      <div className="h-px w-full bg-white/10" />

      <div>{children}</div>
    </section>
  );
}
