"use client";

import React, { useState } from "react";
import RepricingRulesCard, { RepricingRule } from "./RepricingRulesCard";
import Button from "@/shared/Button";
import { Plus } from "lucide-react";

// Sample data matching the design
const sampleRules: RepricingRule[] = [
  {
    id: "1",
    title: "Test new price adjust",
    enabled: false,
    lastRun: null,
    repricingType: "preview",
    status: "enabled",
    productCount: "All",
    competitorCount: "All",
  },
  {
    id: "2", 
    title: "1% Below my cheapest competitor",
    enabled: false,
    lastRun: null,
    repricingType: "preview",
    status: "enabled",
    productCount: "All",
    competitorCount: "All",
  },
  {
    id: "3",
    title: "Reprice 1 cent below my cheapest competitor",
    enabled: false,
    lastRun: null,
    repricingType: "preview",
    status: "enabled",
    productCount: "All",
    competitorCount: "All",
  },
  {
    id: "4",
    title: "Reprice 1 cent below my cheapest competitor", 
    enabled: false,
    lastRun: null,
    repricingType: "preview",
    status: "enabled",
    productCount: "All",
    competitorCount: "All",
  },
  {
    id: "5",
    title: "Test new price adjust",
    enabled: false,
    lastRun: null,
    repricingType: "preview", 
    status: "enabled",
    productCount: "All",
    competitorCount: "All",
  },
  {
    id: "6",
    title: "1% Below my cheapest competitor",
    enabled: false,
    lastRun: null,
    repricingType: "preview",
    status: "enabled",
    productCount: "All",
    competitorCount: "All",
  },
];

const RepricingRules: React.FC = () => {
  const [rules, setRules] = useState<RepricingRule[]>(sampleRules);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());

  const handleToggleRule = (id: string, enabled: boolean) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, enabled } : rule
    ));
  };

  const handleSelectRule = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedRules);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRules(newSelected);
  };

  const handleManageRule = (id: string) => {
    console.log("Manage rule:", id);
    // Handle manage action
  };

  const handleDownloadRule = (id: string) => {
    console.log("Download rule:", id);
    // Handle download action
  };

  const handleRunPreview = (id: string) => {
    console.log("Run preview for rule:", id);
    // Handle run preview action
  };

  const handleAddReports = () => {
    console.log("Add reports clicked");
    // Handle add reports action
  };

  return (
    <div 
      className="w-full min-h-screen p-6"
      style={{
        background: "#F3F4F6",
        padding: "20px 24px 35px 24px",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="flex items-start justify-between mb-4 p-3 rounded-xl border"
          style={{
            height: "56px",
            borderRadius: "12px",
            border: "1px solid #F2F2F2",
            padding: "12px",
            background: "white",
            alignItems: "center",
          }}
        >
          <div className="flex items-start gap-1.5 flex-1">
            <div className="flex flex-col gap-1 flex-1">
              <h1 
                className="text-2xl font-bold leading-8"
                style={{
                  color: "#14151A",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "24px",
                  fontWeight: "700",
                  lineHeight: "32px",
                  letterSpacing: "-0.336px",
                }}
              >
                Repricing Rules
              </h1>
              <p 
                className="text-sm leading-5"
                style={{
                  color: "rgba(15, 19, 36, 0.60)",
                  fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "400",
                  lineHeight: "20px",
                  letterSpacing: "-0.07px",
                }}
              >
                Create or edit your repricing rule
              </p>
            </div>
          </div>
          
          <Button
            className="flex items-center justify-center gap-0.5 px-3 py-2 text-white"
            onClick={handleAddReports}
            style={{
              borderRadius: "5px",
              background: "#335CFF",
              boxShadow: "0 1px 2px 0 rgba(20, 21, 26, 0.05)",
              padding: "8px 10px 8px 12px",
            }}
          >
            <Plus size={16} style={{ color: "white" }} />
            <span
              style={{
                color: "#FFF",
                fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "20px",
                letterSpacing: "-0.07px",
              }}
            >
              Add Reports
            </span>
          </Button>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rules.map((rule) => (
            <RepricingRulesCard
              key={rule.id}
              rule={rule}
              selected={selectedRules.has(rule.id)}
              onToggle={handleToggleRule}
              onSelect={handleSelectRule}
              onManage={handleManageRule}
              onDownload={handleDownloadRule}
              onRunPreview={handleRunPreview}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepricingRules;
