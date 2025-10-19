/**
 * Plan Approval UI Component
 * 
 * This component provides a user interface for approving or modifying
 * AI-generated execution plans. It allows users to edit tasks, add notes,
 * and approve or reject the plan before execution.
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Checkbox from "@/components/ui/checkbox";
import { PencilIcon, TrashIcon, PlusIcon, CheckIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  estimatedTime?: string;
}

interface PlanApprovalProps {
  addResult: (result: any) => void;
  args: {
    todos: Todo[];
    message?: string;
    urgent?: boolean;
    estimatedDuration?: string;
  };
}

export function PlanApprovalUI({ addResult, args }: PlanApprovalProps) {
  const [todos, setTodos] = useState<Todo[]>(args.todos || []);
  const [editing, setEditing] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [newTodoEstimatedTime, setNewTodoEstimatedTime] = useState("");

  // Initialize todos from args
  useEffect(() => {
    if (args.todos) {
      setTodos(args.todos);
    }
  }, [args.todos]);

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const addTodo = () => {
    if (!newTodoTitle.trim()) return;
    
    const newTodo: Todo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newTodoTitle.trim(),
      description: newTodoDescription.trim() || undefined,
      estimatedTime: newTodoEstimatedTime.trim() || undefined,
      completed: false,
    };
    
    setTodos(prev => [...prev, newTodo]);
    setNewTodoTitle("");
    setNewTodoDescription("");
    setNewTodoEstimatedTime("");
  };

  const removeTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const startEditing = (id: string) => {
    setEditingTodoId(id);
    setEditing(true);
  };

  const saveEdit = (id: string) => {
    setEditingTodoId(null);
    setEditing(false);
  };

  const handleApprove = async () => {
    try {
      // Call the execution API
      const response = await fetch("/api/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CONFIRM_PLAN_EXECUTION",
          data: {
            planId: `plan_${Date.now()}`,
            todos: todos,
          },
          approved: true,
          modifications: editing ? ["User modified the plan"] : [],
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        addResult({
          approved: true,
          todos: todos,
          modifications: editing ? ["User modified the plan"] : [],
          executionResult: result,
        });
      } else {
        throw new Error(result.message || "Failed to execute plan");
      }
    } catch (error) {
      console.error("Plan execution failed:", error);
      addResult({
        approved: false,
        error: error instanceof Error ? error.message : "Failed to execute plan",
      });
    }
  };

  const handleReject = () => {
    addResult({
      approved: false,
      reason: "User rejected the plan",
    });
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-blue-600" />
              Execution Plan Approval
              {args.urgent && (
                <Badge variant="destructive" className="ml-2">
                  Urgent
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Review and modify the AI's execution plan before proceeding
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              {editing ? "Done Editing" : "Edit Plan"}
            </Button>
          </div>
        </div>
        
        {args.message && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {args.message}
            </p>
          </div>
        )}

        {args.estimatedDuration && (
          <div className="mt-2">
            <Badge variant="secondary">
              Estimated Duration: {args.estimatedDuration}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Summary */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">
            Progress: {completedCount} of {totalCount} tasks
          </span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {todos.map((todo, index) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                todo.completed 
                  ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" 
                  : "bg-white border-gray-200"
              )}
            >
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) => updateTodo(todo.id, { completed: !!checked })}
                disabled={!editing}
                className="mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    {index + 1}.
                  </span>
                  {editingTodoId === todo.id ? (
                    <div className="flex-1 space-y-2">
                      <Input
                        value={todo.title}
                        onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
                        className="text-sm"
                        placeholder="Task title"
                      />
                      <Textarea
                        value={todo.description || ""}
                        onChange={(e) => updateTodo(todo.id, { description: e.target.value })}
                        className="text-sm"
                        placeholder="Task description (optional)"
                        rows={2}
                      />
                      <Input
                        value={todo.estimatedTime || ""}
                        onChange={(e) => updateTodo(todo.id, { estimatedTime: e.target.value })}
                        className="text-sm"
                        placeholder="Estimated time (optional)"
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-medium",
                        todo.completed ? "line-through text-gray-500" : "text-gray-900"
                      )}>
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {todo.description}
                        </p>
                      )}
                      {todo.estimatedTime && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {todo.estimatedTime}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex items-center gap-1">
                  {editingTodoId === todo.id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveEdit(todo.id)}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing(todo.id)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTodo(todo.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add New Todo */}
        {editing && (
          <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="space-y-2">
              <Input
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="Add new task..."
                className="text-sm"
              />
              <Textarea
                value={newTodoDescription}
                onChange={(e) => setNewTodoDescription(e.target.value)}
                placeholder="Task description (optional)"
                className="text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <Input
                  value={newTodoEstimatedTime}
                  onChange={(e) => setNewTodoEstimatedTime(e.target.value)}
                  placeholder="Estimated time (optional)"
                  className="text-sm flex-1"
                />
                <Button
                  size="sm"
                  onClick={addTodo}
                  disabled={!newTodoTitle.trim()}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {editing ? "You can modify the plan above" : "Review the plan above"}
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
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Approve Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
