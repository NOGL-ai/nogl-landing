/**
 * Email Approval UI Component
 * 
 * This component provides a user interface for approving or modifying
 * email content before sending. It includes rich text preview and
 * editing capabilities.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, XIcon, MailIcon, EyeIcon, EditIcon, ExternalLinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailData {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: string[];
  priority?: "low" | "normal" | "high";
}

interface EmailApprovalProps {
  addResult: (result: any) => void;
  args: {
    action: "SEND_EMAIL" | "SEND_PRICING_REPORT" | "SEND_ALERT_EMAIL";
    data: EmailData;
    preview: {
      to: string;
      cc: string[];
      bcc: string[];
      subject: string;
      body: string;
      attachments: string[];
      priority: "low" | "normal" | "high";
      from: string;
      timestamp: string;
      [key: string]: any;
    };
    message: string;
  };
}

export function EmailApprovalUI({ addResult, args }: EmailApprovalProps) {
  const [formData, setFormData] = useState<EmailData>(args.data);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [newCc, setNewCc] = useState("");
  const [newBcc, setNewBcc] = useState("");

  // Initialize form data
  useEffect(() => {
    setFormData(args.data);
  }, [args.data]);

  const updateField = (field: keyof EmailData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRecipient = (type: "cc" | "bcc", email: string) => {
    if (!email.trim()) return;
    const recipients = formData[type] || [];
    if (!recipients.includes(email.trim())) {
      updateField(type, [...recipients, email.trim()]);
    }
    if (type === "cc") setNewCc("");
    if (type === "bcc") setNewBcc("");
  };

  const removeRecipient = (type: "cc" | "bcc", email: string) => {
    const recipients = formData[type] || [];
    updateField(type, recipients.filter(e => e !== email));
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
        throw new Error(result.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      addResult({
        approved: false,
        error: error instanceof Error ? error.message : "Failed to send email",
        action: args.action,
      });
    }
  };

  const handleReject = () => {
    addResult({
      approved: false,
      reason: "User rejected the email",
      action: args.action,
    });
  };

  const getActionIcon = () => {
    switch (args.action) {
      case "SEND_EMAIL":
        return "📧";
      case "SEND_PRICING_REPORT":
        return "📊";
      case "SEND_ALERT_EMAIL":
        return "🚨";
      default:
        return "📧";
    }
  };

  const getActionTitle = () => {
    switch (args.action) {
      case "SEND_EMAIL":
        return "Send Competitor Email";
      case "SEND_PRICING_REPORT":
        return "Send Pricing Report";
      case "SEND_ALERT_EMAIL":
        return "Send Alert Email";
      default:
        return "Send Email";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 dark:bg-red-950";
      case "low":
        return "text-tertiary bg-secondary_bg";
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-950";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{getActionIcon()}</span>
          {getActionTitle()}
        </CardTitle>
        <CardDescription>
          {args.message}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <EditIcon className="h-4 w-4" />
              Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {/* Email Preview */}
            <div className="border rounded-lg p-4 bg-white">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4 text-tertiary" />
                    <span className="text-sm font-medium">From:</span>
                    <span className="text-sm text-tertiary">
                      {args.preview.from}
                    </span>
                  </div>
                  <Badge className={getPriorityColor(args.preview.priority)}>
                    {args.preview.priority.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-12">To:</span>
                    <span className="text-sm">{formData.to}</span>
                  </div>
                  
                  {formData.cc && formData.cc.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-12">CC:</span>
                      <div className="flex flex-wrap gap-1">
                        {formData.cc.map((email, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {formData.bcc && formData.bcc.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-12">BCC:</span>
                      <div className="flex flex-wrap gap-1">
                        {formData.bcc.map((email, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {email}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3">
                  <div className="text-lg font-semibold mb-2">
                    {formData.subject}
                  </div>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: formData.body }}
                  />
                </div>

                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium mb-2">Attachments:</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.attachments.map((attachment, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <ExternalLinkIcon className="h-3 w-3" />
                          {attachment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            {/* Edit Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">To *</label>
                  <Input
                    value={formData.to}
                    onChange={(e) => updateField("to", e.target.value)}
                    placeholder="recipient@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={formData.priority || "normal"}
                    onChange={(e) => updateField("priority", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject *</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  placeholder="Email subject"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CC</label>
                <div className="flex gap-2">
                  <Input
                    value={newCc}
                    onChange={(e) => setNewCc(e.target.value)}
                    placeholder="cc@example.com"
                    onKeyPress={(e) => e.key === "Enter" && addRecipient("cc", newCc)}
                  />
                  <Button
                    size="sm"
                    onClick={() => addRecipient("cc", newCc)}
                    disabled={!newCc.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(formData.cc || []).map((email, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button
                        onClick={() => removeRecipient("cc", email)}
                        className="ml-1 text-tertiary hover:text-secondary"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">BCC</label>
                <div className="flex gap-2">
                  <Input
                    value={newBcc}
                    onChange={(e) => setNewBcc(e.target.value)}
                    placeholder="bcc@example.com"
                    onKeyPress={(e) => e.key === "Enter" && addRecipient("bcc", newBcc)}
                  />
                  <Button
                    size="sm"
                    onClick={() => addRecipient("bcc", newBcc)}
                    disabled={!newBcc.trim()}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(formData.bcc || []).map((email, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {email}
                      <button
                        onClick={() => removeRecipient("bcc", email)}
                        className="ml-1 text-tertiary hover:text-secondary"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Body *</label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => updateField("body", e.target.value)}
                  placeholder="Email content (HTML supported)"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-tertiary">
                  HTML tags are supported for formatting
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-tertiary">
            Review the email above before sending
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-red-600 hover:text-red-700"
            >
              <XIcon className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MailIcon className="h-4 w-4 mr-1" />
              Send Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
