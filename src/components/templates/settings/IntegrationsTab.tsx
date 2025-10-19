"use client";

import { useState } from "react";
import { Button } from "@/components/base/buttons/button";
import Logo from "@/shared/Logo";
import { cx } from "@/utils/cx";

type Integration = {
  id: string;
  name: string;
  description: string;
  color?: string;
  domain?: string; // domain for logo.dev
  initials?: string;
  enabled?: boolean;
};

const DEFAULT_INTEGRATIONS: Integration[] = [
  { id: "linear", name: "Linear", description: "Streamline software projects, sprints, and bug tracking.", domain: "linear.app", enabled: true },
  { id: "github", name: "GitHub", description: "Link pull requests and automate workflows.", domain: "github.com", enabled: true },
  { id: "figma", name: "Figma", description: "Embed file previews in projects.", domain: "figma.com", enabled: true },
  { id: "zapier", name: "Zapier", description: "Build custom automations and integrations with apps.", domain: "zapier.com", enabled: false },
  { id: "notion", name: "Notion", description: "Embed notion pages and notes in projects.", domain: "notion.so", enabled: true },
  { id: "slack", name: "Slack", description: "Send notifications to channels and create projects.", domain: "slack.com", enabled: true },
  { id: "zendesk", name: "Zendesk", description: "Link and automate Zendesk tickets.", domain: "zendesk.com", enabled: true },
  { id: "jira", name: "Atlassian JIRA", description: "Plan, track, and release great software.", domain: "atlassian.com", enabled: false },
  { id: "dropbox", name: "Dropbox", description: "Everything you need for work, all in one place.", domain: "dropbox.com", enabled: true },
];

function ToggleSwitch({ checked, onChange, ariaLabel }: { checked: boolean; onChange: (next: boolean) => void; ariaLabel?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={cx(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-2 focus:outline-offset-2",
        checked ? "bg-brand-600" : "bg-border",
      )}
    >
      <span
        aria-hidden
        className={cx(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}

export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>(DEFAULT_INTEGRATIONS);

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold leading-7 text-primary">Integrations and connected apps</h2>
            <p className="text-sm leading-5 text-tertiary">Supercharge your workflow and connect the tool you use every day.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button size="md" color="secondary" aria-label="Request new integration" iconLeading={() => (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0013 4.16669V15.8334M4.16797 10H15.8346" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}>
              Request integration
            </Button>
            <button aria-label="More options" className="rounded-md p-2 hover:bg-secondary_bg sm:block hidden">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0013 10.8333C10.4615 10.8333 10.8346 10.4602 10.8346 9.99998C10.8346 9.53974 10.4615 9.16665 10.0013 9.16665C9.54106 9.16665 9.16797 9.53974 9.16797 9.99998C9.16797 10.4602 9.54106 10.8333 10.0013 10.8333Z" stroke="#A4A7AE" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.0013 4.99998C10.4615 4.99998 10.8346 4.62688 10.8346 4.16665C10.8346 3.70641 10.4615 3.33331 10.0013 3.33331C9.54106 3.33331 9.16797 3.70641 9.16797 4.16665C9.16797 4.62688 9.54106 4.99998 10.0013 4.99998Z" stroke="#A4A7AE" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.0013 16.6666C10.4615 16.6666 10.8346 16.2935 10.8346 15.8333C10.8346 15.3731 10.4615 15 10.0013 15C9.54106 15 9.16797 15.3731 9.16797 15.8333C9.16797 16.2935 9.54106 16.6666 10.0013 16.6666Z" stroke="#A4A7AE" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs row (desktop only) */}
        <div className="hidden sm:block mt-4 w-full border-b border-border">
          <nav className="flex gap-3 overflow-auto" role="tablist">
            <button role="tab" aria-selected="true" className="pb-3 px-1 text-sm font-semibold text-brand-700 border-b-2 border-brand-600 whitespace-nowrap">View all</button>
            <button role="tab" aria-selected="false" className="pb-3 px-1 text-sm font-semibold text-tertiary border-b-2 border-transparent hover:text-secondary whitespace-nowrap">Developer tools</button>
            <button role="tab" aria-selected="false" className="pb-3 px-1 text-sm font-semibold text-tertiary border-b-2 border-transparent hover:text-secondary whitespace-nowrap">Communication</button>
            <button role="tab" aria-selected="false" className="pb-3 px-1 text-sm font-semibold text-tertiary border-b-2 border-transparent hover:text-secondary whitespace-nowrap">Productivity</button>
            <button role="tab" aria-selected="false" className="pb-3 px-1 text-sm font-semibold text-tertiary border-b-2 border-transparent hover:text-secondary whitespace-nowrap">Browser tools</button>
            <button role="tab" aria-selected="false" className="pb-3 px-1 text-sm font-semibold text-tertiary border-b-2 border-transparent hover:text-secondary whitespace-nowrap">Marketplace</button>
          </nav>
        </div>
      </div>

      {/* Cards - mobile: stacked, desktop: grid */}
      <div className="flex flex-col gap-5 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {integrations.map((it) => (
          <div key={it.id} className="flex flex-col rounded-xl border border-border bg-white shadow-sm">
            <div className="flex flex-col gap-6 p-5 sm:p-5">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-white border border-border overflow-hidden flex items-center justify-center dark:bg-white shadow-sm" aria-label={`${it.name} logo`}>
                    {it.domain ? (
                      <>
                        <img
                          src={`/api/logo?domain=${encodeURIComponent(it.domain)}&format=png&size=64`}
                          alt={`${it.name} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            target.nextElementSibling && (target.nextElementSibling as HTMLElement).classList.remove("hidden");
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.nextElementSibling && (target.nextElementSibling as HTMLElement).classList.add("hidden");
                          }}
                        />
                        <div className="w-8 h-8 rounded hidden items-center justify-center text-xs font-semibold text-tertiary">
                          {it.name.charAt(0).toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-tertiary">
                        {it.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-medium leading-6 text-primary">{it.name}</h3>
                </div>

                <div className="flex-shrink-0">
                  <ToggleSwitch checked={!!it.enabled} onChange={() => toggleIntegration(it.id)} ariaLabel={`Toggle ${it.name} integration`} />
                </div>
              </div>

              <p className="text-sm leading-5 text-tertiary">{it.description}</p>
            </div>

            <div className="flex flex-col gap-4 pb-4">
              <div className="h-px w-full bg-border" />
              <div className="flex items-center justify-end px-6">
                <Button size="md" color="link-color" aria-label={`View ${it.name} integration details`}>View integration</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MCP suggestions (proactive guidance) - hidden on mobile */}
      <div className="hidden sm:block mt-2 rounded-lg border border-dashed border-border bg-secondary_bg p-4 text-sm text-secondary">
        <p className="font-semibold">Recommended integrations to connect</p>
        <p className="mt-2 text-sm text-tertiary">
          For database and auth, prefer Supabase or Neon. For content and CMS workflows use Builder.io. For automation and workflows consider Zapier. For design to code, use the Figma plugin. For deployment use Netlify. For error monitoring use Sentry. For developer productivity and issue tracking connect Linear and Notion.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Supabase integration">Connect to Supabase</a>
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Neon integration">Connect to Neon</a>
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Netlify integration">Connect to Netlify</a>
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Zapier integration">Connect to Zapier</a>
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Figma integration">Connect to Figma</a>
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Builder.io integration">Connect to Builder.io</a>
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Linear integration">Connect to Linear</a>
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Notion integration">Connect to Notion</a>
          <a href="#open-mcp-popover" className="rounded bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-secondary_bg" aria-label="Connect to Sentry integration">Connect to Sentry</a>
        </div>
      </div>
    </div>
  );
}
