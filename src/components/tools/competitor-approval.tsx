/**
 * Competitor Approval UI Component
 * 
 * This component provides a user interface for approving or modifying
 * competitor data operations (create, update, delete) with preview
 * and editing capabilities.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckIcon, XIcon, AlertTriangleIcon, ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitorData {
  name: string;
  domain: string;
  website?: string;
  description?: string;
  categories?: string[];
  marketPosition?: number;
  marketShare?: number;
  dataSource?: string;
}

interface CompetitorApprovalProps {
  addResult: (result: any) => void;
  args: {
    action: "CREATE_COMPETITOR" | "UPDATE_COMPETITOR" | "DELETE_COMPETITOR";
    data: CompetitorData;
    currentData?: CompetitorData;
    competitorData?: any;
    preview: string;
    message: string;
    warning?: string;
  };
}

export function CompetitorApprovalUI({ addResult, args }: CompetitorApprovalProps) {
  const [formData, setFormData] = useState<CompetitorData>(args.data);
  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Initialize form data
  useEffect(() => {
    setFormData(args.data);
  }, [args.data]);

  const updateField = (field: keyof CompetitorData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    const categories = formData.categories || [];
    if (!categories.includes(newCategory.trim())) {
      updateField("categories", [...categories, newCategory.trim()]);
    }
    setNewCategory("");
  };

  const removeCategory = (category: string) => {
    const categories = formData.categories || [];
    updateField("categories", categories.filter(c => c !== category));
  };

  const handleApprove = async () => {
    try {
      // Call the execution API
      const response = await fetch("/api/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: args.action,
          data: formData,
          approved: true,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        addResult({
          approved: true,
          data: formData,
          action: args.action,
          executionResult: result,
        });
      } else {
        throw new Error(result.message || "Failed to execute action");
      }
    } catch (error) {
      console.error("Action execution failed:", error);
      addResult({
        approved: false,
        error: error instanceof Error ? error.message : "Failed to execute action",
        action: args.action,
      });
    }
  };

  const handleReject = () => {
    addResult({
      approved: false,
      reason: "User rejected the operation",
      action: args.action,
    });
  };

  const getActionIcon = () => {
    switch (args.action) {
      case "CREATE_COMPETITOR":
        return "➕";
      case "UPDATE_COMPETITOR":
        return "✏️";
      case "DELETE_COMPETITOR":
        return "🗑️";
      default:
        return "📝";
    }
  };

  const getActionTitle = () => {
    switch (args.action) {
      case "CREATE_COMPETITOR":
        return "Create New Competitor";
      case "UPDATE_COMPETITOR":
        return "Update Competitor";
      case "DELETE_COMPETITOR":
        return "Delete Competitor";
      default:
        return "Competitor Operation";
    }
  };

  const getActionColor = () => {
    switch (args.action) {
      case "CREATE_COMPETITOR":
        return "text-green-600";
      case "UPDATE_COMPETITOR":
        return "text-blue-600";
      case "DELETE_COMPETITOR":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${getActionColor()}`}>
          <span className="text-2xl">{getActionIcon()}</span>
          {getActionTitle()}
        </CardTitle>
        <CardDescription>
          {args.message}
        </CardDescription>
        
        {args.warning && (
          <Alert className="mt-4 border-red-200 bg-red-50 dark:bg-red-950">
            <AlertTriangleIcon className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {args.warning}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Data (for updates) */}
        {args.currentData && args.action === "UPDATE_COMPETITOR" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Data:
            </h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {args.currentData.name}
                </div>
                <div>
                  <span className="font-medium">Domain:</span> {args.currentData.domain}
                </div>
                {args.currentData.website && (
                  <div className="col-span-2">
                    <span className="font-medium">Website:</span> {args.currentData.website}
                  </div>
                )}
                {args.currentData.description && (
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span> {args.currentData.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Competitor Data (for deletion) */}
        {args.competitorData && args.action === "DELETE_COMPETITOR" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Competitor to Delete:
            </h4>
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {args.competitorData.name}
                </div>
                <div>
                  <span className="font-medium">Domain:</span> {args.competitorData.domain}
                </div>
                <div>
                  <span className="font-medium">Products:</span> {args.competitorData.productCount}
                </div>
                <div>
                  <span className="font-medium">Price Records:</span> {args.competitorData.priceComparisons?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Notes:</span> {args.competitorData.CompetitorNote?.length || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields (for create/update) */}
        {args.action !== "DELETE_COMPETITOR" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {args.action === "CREATE_COMPETITOR" ? "New Competitor Data:" : "Updated Data:"}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Done Editing" : "Edit Data"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Competitor name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Domain *</label>
                <Input
                  value={formData.domain}
                  onChange={(e) => updateField("domain", e.target.value)}
                  disabled={!isEditing}
                  placeholder="example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  value={formData.website || ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  disabled={!isEditing}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Market Position</label>
                <Input
                  type="number"
                  value={formData.marketPosition || ""}
                  onChange={(e) => updateField("marketPosition", e.target.value ? Number(e.target.value) : undefined)}
                  disabled={!isEditing}
                  placeholder="1-10"
                  min="1"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Market Share (%)</label>
                <Input
                  type="number"
                  value={formData.marketShare || ""}
                  onChange={(e) => updateField("marketShare", e.target.value ? Number(e.target.value) : undefined)}
                  disabled={!isEditing}
                  placeholder="0-100"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Source</label>
                <Input
                  value={formData.dataSource || ""}
                  onChange={(e) => updateField("dataSource", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Source of data"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                disabled={!isEditing}
                placeholder="Competitor description"
                rows={3}
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories</label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Add category"
                  onKeyPress={(e) => e.key === "Enter" && addCategory()}
                />
                <Button
                  size="sm"
                  onClick={addCategory}
                  disabled={!isEditing || !newCategory.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.categories || []).map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {category}
                    {isEditing && (
                      <button
                        onClick={() => removeCategory(category)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Operation Preview:
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {args.preview}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {isEditing ? "You can modify the data above" : "Review the operation above"}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-red-600 hover:text-red-700"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              className={cn(
                "text-white",
                args.action === "DELETE_COMPETITOR" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              {args.action === "DELETE_COMPETITOR" ? "Confirm Delete" : "Approve"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
