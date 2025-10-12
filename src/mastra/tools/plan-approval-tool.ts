/**
 * Plan Approval Tools for HITL Workflows
 * 
 * These tools enable agents to create execution plans and request
 * user approval before performing data modifications.
 * 
 * Pattern based on mastra-hitl reference implementation.
 */

import { z } from "zod";

/**
 * Todo item schema for plan approval
 */
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  description: z.string().optional(),
  estimatedTime: z.string().optional(),
});

export type Todo = z.infer<typeof TodoSchema>;

/**
 * Update todos tool - allows agents to create/modify execution plans
 * 
 * This tool is used by agents to build a todo list of actions
 * they plan to take. The todos are then shown to the user for approval.
 */
export const updateTodosTool = {
  name: "updateTodos",
  description: "Update the todo list with current execution plan. Use this to show the user what actions you plan to take before executing them.",
  parameters: z.object({
    todos: z.array(TodoSchema),
    message: z.string().optional().describe("Optional message explaining the plan to the user"),
  }),
  execute: async ({ todos, message }: { todos: Todo[]; message?: string }) => {
    return {
      success: true,
      todos,
      message: message || `Created plan with ${todos.length} tasks`,
      requiresApproval: true,
    };
  },
};

/**
 * Ask for plan approval tool - requests user approval for execution plan
 * 
 * This tool is used after updateTodos to formally request approval
 * from the user before proceeding with the planned actions.
 */
export const askForPlanApprovalTool = {
  name: "askForPlanApproval",
  description: "Ask the user to approve the execution plan. This will show the todo list and wait for user confirmation before proceeding.",
  parameters: z.object({
    message: z.string().describe("Message explaining what you're asking approval for"),
    urgent: z.boolean().optional().default(false).describe("Whether this approval is urgent"),
    estimatedDuration: z.string().optional().describe("Estimated time to complete all tasks"),
  }),
  execute: async ({ 
    message, 
    urgent = false, 
    estimatedDuration 
  }: { 
    message: string; 
    urgent?: boolean; 
    estimatedDuration?: string; 
  }) => {
    return {
      success: true,
      requiresApproval: true,
      message,
      urgent,
      estimatedDuration,
      approvalType: "PLAN_APPROVAL",
    };
  },
};

/**
 * Confirm plan execution tool - used after approval to proceed
 * 
 * This tool is called after the user has approved the plan
 * to confirm that execution should proceed.
 */
export const confirmPlanExecutionTool = {
  name: "confirmPlanExecution",
  description: "Confirm that the user has approved the plan and execution should proceed.",
  parameters: z.object({
    planId: z.string().optional().describe("Optional plan identifier"),
    approved: z.boolean().describe("Whether the plan was approved"),
    modifications: z.array(z.string()).optional().describe("Any modifications the user made to the plan"),
  }),
  execute: async ({ 
    planId, 
    approved, 
    modifications = [] 
  }: { 
    planId?: string; 
    approved: boolean; 
    modifications?: string[]; 
  }) => {
    if (!approved) {
      return {
        success: false,
        message: "Plan execution cancelled by user",
        cancelled: true,
      };
    }

    return {
      success: true,
      message: "Plan approved, proceeding with execution",
      planId,
      modifications,
      approved: true,
    };
  },
};

/**
 * Cancel plan tool - allows agents to cancel current plan
 * 
 * This tool can be used if the agent determines that the plan
 * is no longer valid or should be abandoned.
 */
export const cancelPlanTool = {
  name: "cancelPlan",
  description: "Cancel the current execution plan and explain why.",
  parameters: z.object({
    reason: z.string().describe("Reason for cancelling the plan"),
    alternative: z.string().optional().describe("Alternative approach to suggest"),
  }),
  execute: async ({ reason, alternative }: { reason: string; alternative?: string }) => {
    return {
      success: true,
      cancelled: true,
      reason,
      alternative,
      message: `Plan cancelled: ${reason}${alternative ? `. Alternative: ${alternative}` : ""}`,
    };
  },
};

/**
 * All plan approval tools exported as array for easy registration
 */
export const planApprovalTools = [
  updateTodosTool,
  askForPlanApprovalTool,
  confirmPlanExecutionTool,
  cancelPlanTool,
];
