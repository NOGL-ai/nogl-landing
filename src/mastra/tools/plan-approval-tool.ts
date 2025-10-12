/**
 * Plan Approval Tools for HITL Workflows
 * 
 * These tools enable agents to create execution plans and request
 * user approval before performing data modifications.
 * 
 * Pattern based on mastra-hitl reference implementation.
 */

import { createTool } from "@mastra/core/tools";
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
export const updateTodosTool = createTool({
  id: "updateTodos",
  description: "Update the todo list with current execution plan. Use this to show the user what actions you plan to take before executing them.",
  inputSchema: z.object({
    todos: z.array(TodoSchema),
    message: z.string().optional().describe("Optional message explaining the plan to the user"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    todos: z.array(TodoSchema),
    message: z.string(),
    requiresApproval: z.boolean(),
  }),
  execute: async ({ context }) => {
    const { todos, message } = context;
    return {
      success: true,
      todos,
      message: message || `Created plan with ${todos.length} tasks`,
      requiresApproval: true,
    };
  },
});

/**
 * Ask for plan approval tool - requests user approval for execution plan
 * 
 * This tool is used after updateTodos to formally request approval
 * from the user before proceeding with the planned actions.
 */
export const askForPlanApprovalTool = createTool({
  id: "askForPlanApproval",
  description: "Ask the user to approve the execution plan. This will show the todo list and wait for user confirmation before proceeding.",
  inputSchema: z.object({
    message: z.string().describe("Message explaining what you're asking approval for"),
    urgent: z.boolean().optional().default(false).describe("Whether this approval is urgent"),
    estimatedDuration: z.string().optional().describe("Estimated time to complete all tasks"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    requiresApproval: z.boolean(),
    message: z.string(),
    urgent: z.boolean(),
    estimatedDuration: z.string().optional(),
    approvalType: z.string(),
  }),
  execute: async ({ context }) => {
    const { message, urgent = false, estimatedDuration } = context;
    return {
      success: true,
      requiresApproval: true,
      message,
      urgent,
      estimatedDuration,
      approvalType: "PLAN_APPROVAL",
    };
  },
});

/**
 * Confirm plan execution tool - used after approval to proceed
 * 
 * This tool is called after the user has approved the plan
 * to confirm that execution should proceed.
 */
export const confirmPlanExecutionTool = createTool({
  id: "confirmPlanExecution",
  description: "Confirm that the user has approved the plan and execution should proceed.",
  inputSchema: z.object({
    planId: z.string().optional().describe("Optional plan identifier"),
    approved: z.boolean().describe("Whether the plan was approved"),
    modifications: z.array(z.string()).optional().describe("Any modifications the user made to the plan"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    cancelled: z.boolean().optional(),
    planId: z.string().optional(),
    modifications: z.array(z.string()).optional(),
    approved: z.boolean().optional(),
  }),
  execute: async ({ context }) => {
    const { planId, approved, modifications = [] } = context;
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
});

/**
 * Cancel plan tool - allows agents to cancel current plan
 * 
 * This tool can be used if the agent determines that the plan
 * is no longer valid or should be abandoned.
 */
export const cancelPlanTool = createTool({
  id: "cancelPlan",
  description: "Cancel the current execution plan and explain why.",
  inputSchema: z.object({
    reason: z.string().describe("Reason for cancelling the plan"),
    alternative: z.string().optional().describe("Alternative approach to suggest"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    cancelled: z.boolean(),
    reason: z.string(),
    alternative: z.string().optional(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    const { reason, alternative } = context;
    return {
      success: true,
      cancelled: true,
      reason,
      alternative,
      message: `Plan cancelled: ${reason}${alternative ? `. Alternative: ${alternative}` : ""}`,
    };
  },
});

/**
 * All plan approval tools exported as named object for agent registration
 */
export const planApprovalTools = {
  updateTodos: updateTodosTool,
  askForPlanApproval: askForPlanApprovalTool,
  confirmPlanExecution: confirmPlanExecutionTool,
  cancelPlan: cancelPlanTool,
};
