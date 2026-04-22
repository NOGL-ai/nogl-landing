"use client";

type ExternalLinkActionProps = {
	href: string;
	label: string;
	className: string;
};

export function ExternalLinkAction({ href, label, className }: ExternalLinkActionProps) {
	return (
		<a href={href} target="_blank" rel="noreferrer" className={className}>
			{label}
		</a>
	);
}
