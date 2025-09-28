"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Toggle from "@/components/ui/toggle";
import Checkbox from "@/shared/Checkbox";
import Button from "@/shared/Button";
import Avatar from "@/shared/Avatar";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";
import { Settings2, Download, Clock } from "lucide-react";

export interface RepricingRule {
  id: string;
  title: string;
  enabled: boolean;
  lastRun: string | null;
  repricingType: "preview" | "live";
  status: "enabled" | "disabled" | "preview";
  productCount: string;
  competitorCount: string;
}

export interface RepricingRulesCardProps {
  rule: RepricingRule;
  onToggle?: (id: string, enabled: boolean) => void;
  onSelect?: (id: string, selected: boolean) => void;
  onManage?: (id: string) => void;
  onDownload?: (id: string) => void;
  onRunPreview?: (id: string) => void;
  selected?: boolean;
  className?: string;
}

const RepricingRulesCard: React.FC<RepricingRulesCardProps> = ({
  rule,
  onToggle,
  onSelect,
  onManage,
  onDownload,
  onRunPreview,
  selected = false,
  className = "",
}) => {
  return (
    <Card
      className={cn(
        "w-full border border-bg-soft-200 bg-white shadow-sm",
        className
      )}
      style={{
        borderRadius: "8px",
        border: "1px solid #E2E4E9",
        background: "#FFF",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
      }}
    >
      <CardContent className="p-4">
        <div className="flex flex-col h-full justify-between">
          {/* Header with checkbox, title, and toggle */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-start gap-2 flex-1">
              <div className="relative" style={{ width: "24px", height: "24px" }}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => onSelect?.(rule.id, e.target.checked)}
                  className="w-4.5 h-4.5 border border-neutral-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  style={{
                    width: "18px",
                    height: "18px",
                    position: "absolute",
                    left: "3px",
                    top: "3px",
                    borderRadius: "3px",
                    border: "1px solid #CED4DA",
                    background: "#FFF",
                  }}
                />
              </div>
              <h3
                className="flex-1 text-base font-medium leading-6"
                style={{
                  color: "#0E121B",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "24px",
                  letterSpacing: "-0.176px",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {rule.title}
              </h3>
            </div>
            <Toggle
              checked={rule.enabled}
              onChange={(checked) => onToggle?.(rule.id, checked)}
              disabled={true}
            />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-stroke-soft-200 mb-5" style={{ background: "#E1E4EA" }} />

          {/* Content Section */}
          <div className="flex flex-col gap-5 mb-5">
            {/* Product and Competitors Row */}
            <div className="flex items-start gap-4">
              {/* Product Column */}
              <div className="flex flex-col gap-1.5" style={{ width: "204px" }}>
                <span
                  className="text-xs leading-4"
                  style={{
                    color: "#525866",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "12px",
                    fontWeight: "400",
                    lineHeight: "16px",
                  }}
                >
                  Product
                </span>
                <div className="flex items-center gap-2">
                  <Avatar
                    sizeClass="w-6 h-6"
                    containerClassName=""
                    userName="All"
                    imgUrl=""
                    radius="rounded-full"
                  />
                  <button
                    onClick={() => {/* Handle show products */}}
                    className="text-sm text-primary-base underline"
                    style={{
                      color: "#375DFB",
                      fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                      letterSpacing: "-0.084px",
                      textDecoration: "underline",
                    }}
                  >
                    Show
                  </button>
                </div>
              </div>

              {/* Competitors Column */}
              <div className="flex flex-col gap-1.5 flex-1">
                <span
                  className="text-xs leading-4"
                  style={{
                    color: "#525866",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "12px",
                    fontWeight: "400",
                    lineHeight: "16px",
                  }}
                >
                  Competitors
                </span>
                <div className="flex items-center gap-2">
                  <Avatar
                    sizeClass="w-6 h-6"
                    containerClassName=""
                    userName="All"
                    imgUrl=""
                    radius="rounded-full"
                  />
                  <button
                    onClick={() => {/* Handle show competitors */}}
                    className="text-sm text-primary-base underline"
                    style={{
                      color: "#375DFB",
                      fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                      letterSpacing: "-0.084px",
                      textDecoration: "underline",
                    }}
                  >
                    Show
                  </button>
                </div>
              </div>
            </div>

            {/* Last Run and Repricing Type Row */}
            <div className="flex items-start gap-4">
              {/* Last Run Column */}
              <div className="flex flex-col gap-1.5" style={{ width: "204px" }}>
                <span
                  className="text-xs leading-4"
                  style={{
                    color: "#525866",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "12px",
                    fontWeight: "400",
                    lineHeight: "16px",
                  }}
                >
                  Last Run
                </span>
                <div className="flex items-center gap-1">
                  <Clock 
                    size={20} 
                    className="text-text-sub-600" 
                    style={{ color: "#525866" }}
                  />
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                      letterSpacing: "-0.084px",
                    }}
                  >
                    <span style={{ color: "#0E121B" }}>Never | </span>
                    <button
                      onClick={() => onRunPreview?.(rule.id)}
                      className="text-primary-base"
                      style={{ color: "#335CFF" }}
                    >
                      Run Preview
                    </button>
                  </span>
                </div>
              </div>

              {/* Repricing Type Column */}
              <div className="flex flex-col gap-1.5 flex-1">
                <span
                  className="text-xs leading-4"
                  style={{
                    color: "#525866",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "12px",
                    fontWeight: "400",
                    lineHeight: "16px",
                  }}
                >
                  Repricing Type
                </span>
                <StatusBadge status={rule.repricingType as any} />
              </div>
            </div>

            {/* Status Row */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col gap-1.5" style={{ width: "204px" }}>
                <span
                  className="text-xs leading-4"
                  style={{
                    color: "#525866",
                    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "12px",
                    fontWeight: "400",
                    lineHeight: "16px",
                  }}
                >
                  Status
                </span>
                <StatusBadge status={rule.status} />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 border border-stroke-soft-200 bg-white text-text-sub-600 hover:bg-gray-50"
              onClick={() => onManage?.(rule.id)}
              style={{
                borderRadius: "5px",
                border: "1px solid #E1E4EA",
                background: "#FFF",
                boxShadow: "0 1px 2px 0 rgba(10, 13, 20, 0.03)",
              }}
            >
              <Settings2 size={20} style={{ color: "#525866" }} />
              <span
                style={{
                  color: "#525866",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  letterSpacing: "-0.084px",
                }}
              >
                Manage
              </span>
            </Button>
            
            <Button
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 border border-stroke-soft-200 text-white hover:bg-blue-600"
              onClick={() => onDownload?.(rule.id)}
              style={{
                borderRadius: "5px",
                border: "1px solid #E1E4EA",
                background: "#335CFF",
                boxShadow: "0 1px 2px 0 rgba(10, 13, 20, 0.03)",
              }}
            >
              <Download size={20} style={{ color: "white" }} />
              <span
                style={{
                  color: "#FFF",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  letterSpacing: "-0.084px",
                }}
              >
                Download
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepricingRulesCard;
