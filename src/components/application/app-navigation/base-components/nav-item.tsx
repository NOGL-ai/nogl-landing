"use client";

import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { ChevronDown, Share04 } from "@untitledui/icons";
import { Link as AriaLink } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { cx, sortCx } from "@/utils/cx";

const getStyles = () => sortCx({
    root: `group relative flex w-full cursor-pointer items-center rounded-[6px] bg-white hover:bg-gray-50 dark:bg-[#0a0d12] dark:hover:bg-[#252b37]/50 outline-focus-ring transition-all duration-200 ease-in-out select-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2`,
    rootSelected: "bg-[#fafafa] hover:bg-[#fafafa] dark:bg-[#252b37] dark:hover:bg-[#252b37]",
    content: `bg-transparent box-border content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px px-[12px] py-[8px] relative rounded-[6px] shrink-0`,
    textAndIcon: `content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0`,
    avatar: `border-[0.417px] border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)] border-solid relative rounded-[200px] shrink-0 size-[20px]`,
    badge: `bg-[#fafafa] dark:bg-[#181d27] border border-[#e9eaeb] dark:border-[#414651] border-solid box-border content-stretch flex items-center px-[8px] py-[2px] relative rounded-[16px] shrink-0`,
    chevron: `overflow-clip relative shrink-0 size-[16px]`,
});

interface NavItemBaseProps {
    /** Whether the nav item shows only an icon. */
    iconOnly?: boolean;
    /** Whether the collapsible nav item is open. */
    open?: boolean;
    /** URL to navigate to when the nav item is clicked. */
    href?: string;
    /** Type of the nav item. */
    type: "link" | "collapsible" | "collapsible-child";
    /** Icon component to display. */
    icon?: FC<HTMLAttributes<HTMLOrSVGElement>> | (() => ReactNode);
    /** Badge to display. */
    badge?: ReactNode;
    /** Whether the nav item is currently active. */
    current?: boolean;
    /** Whether to truncate the label text. */
    truncate?: boolean;
    /** Handler for click events. */
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    /** Content to display. */
    children?: ReactNode;
    /** Theme for styling */
    theme?: 'light' | 'dark';
}

export const NavItemBase = ({ current, type, badge, href, icon: Icon, children, truncate = true, onClick }: NavItemBaseProps) => {
    const styles = getStyles();
    
    // Try to call the icon first to see if it returns JSX (for Avatar-based icons)
    const iconElement = Icon && (() => {
        try {
            const result = Icon();
            // If it returns a valid React element, use it directly (Avatar case)
            if (result) {
                return result;
            }
        } catch {
            // If calling without props fails, it's a regular icon component
        }
        // Regular icon component - pass the required props with Figma colors
        return <Icon aria-hidden="true" className={`size-5 shrink-0 transition-inherit-all ${current ? "text-[#a4a7ae] dark:text-[#717680]" : "text-[#a4a7ae] dark:text-[#717680]"}`} />;
    })();

    const badgeElement =
        badge && (typeof badge === "string" || typeof badge === "number") ? (
            <div className={styles.badge}>
                <p className={"font-['Inter',_sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[#414651] dark:text-[#d5d7da] text-[12px] text-center"}>
                    {badge}
                </p>
            </div>
        ) : (
            badge
        );

    const labelElement = (
        <p className={`font-['Inter',_sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[16px] ${current ? "text-[#252b37] dark:text-[#e9eaeb]" : "text-[#414651] dark:text-[#d5d7da]"} ${truncate ? "truncate" : ""}`}>
            {children}
        </p>
    );

    const isExternal = href && href.startsWith("http");
    const externalIcon = isExternal && <Share04 className="size-4 stroke-[2.5px] text-fg-quaternary" />;

    if (type === "collapsible") {
        return (
            <summary className={cx("px-0 py-[2px]", styles.root, current && styles.rootSelected)} onClick={onClick}>
                <div className={styles.content}>
                    <div className={styles.textAndIcon}>
                        <div className={styles.avatar}>
                            {iconElement}
                        </div>
                        {labelElement}
                    </div>
                    {badgeElement}
                    <div className={styles.chevron}>
                        <ChevronDown aria-hidden="true" className={"absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4 size-4 text-[#a4a7ae] dark:text-[#717680] in-open:-scale-y-100"} />
                    </div>
                </div>
            </summary>
        );
    }

    if (type === "collapsible-child") {
        return (
            <AriaLink
                href={href!}
                target={isExternal ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={cx("py-2 pr-3 pl-10", styles.root, current && styles.rootSelected)}
                onClick={onClick}
                aria-current={current ? "page" : undefined}
            >
                {labelElement}
                {externalIcon}
                {badgeElement}
            </AriaLink>
        );
    }

    return (
        <AriaLink
            href={href!}
            target={isExternal ? "_blank" : "_self"}
            rel="noopener noreferrer"
            className={cx("px-0 py-[2px]", styles.root, current && styles.rootSelected)}
            onClick={onClick}
            aria-current={current ? "page" : undefined}
        >
            <div className={styles.content}>
                <div className={styles.textAndIcon}>
                    <div className={styles.avatar}>
                        {iconElement}
                    </div>
                    {labelElement}
                </div>
                {badgeElement}
                {externalIcon && (
                    <div className={styles.chevron}>
                        {externalIcon}
                    </div>
                )}
            </div>
        </AriaLink>
    );
};
