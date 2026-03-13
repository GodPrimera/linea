import Link from "next/link";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
};

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-5 text-zinc-400 dark:text-zinc-600">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
