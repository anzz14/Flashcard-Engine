import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
      <div className="mb-4 text-white">{icon}</div>
      <h3 className="text-lg font-semibold text-[#ff6a3d]">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-white">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;