import type { ReactNode } from "react";

type PlaceholderProps = {
    title: string;
    description: string;
    icon?: ReactNode;
};

export function PlaceholderPage({ title, description, icon }: PlaceholderProps) {
    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
            {icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                    {icon}
                </div>
            )}
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
            <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Coming soon
            </span>
        </div>
    );
}
