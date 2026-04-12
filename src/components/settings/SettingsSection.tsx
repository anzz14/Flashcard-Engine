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
        <h3 className="text-base font-medium text-slate-900">{title}</h3>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </header>

      <div className="h-px w-full bg-slate-200" />

      <div>{children}</div>
    </section>
  );
}
