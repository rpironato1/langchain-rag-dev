import { NextRequest, NextResponse } from "next/server";
import { 
  globalTaskManager, 
  globalWorkflowOrchestrator, 
  globalTodoListManager,
  TaskState 
} from "@/lib/orchestration-tools";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const taskId = searchParams.get('taskId');

  try {
    switch (action) {
      case 'tasks':
        return NextResponse.json({
          tasks: globalTaskManager.getAllTasks(),
          activeCount: globalTaskManager.getActiveTasksCount(),
        });

      case 'task':
        if (!taskId) {
          return NextResponse.json({ error: "taskId required" }, { status: 400 });
        }
        const task = globalTaskManager.getTask(taskId);
        if (!task) {
          return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }
        return NextResponse.json({ task });

      case 'todos':
        const status = searchParams.get('status') as 'todo' | 'in_progress' | 'done' | null;
        return NextResponse.json({
          todos: globalTodoListManager.getTodos(status || undefined),
        });

      case 'todos_by_task':
        if (!taskId) {
          return NextResponse.json({ error: "taskId required" }, { status: 400 });
        }
        return NextResponse.json({
          todos: globalTodoListManager.getTodosByTask(taskId),
        });

      default:
        return NextResponse.json({
          description: "LangChain/LangGraph Orchestration API",
          features: [
            "Task management with LangGraph workflows",
            "Todo list integration",
            "Long-running task orchestration",
            "Step-by-step execution tracking",
            "CLI tool integration workflows"
          ],
          endpoints: {
            "GET ?action=tasks": "List all orchestrated tasks",
            "GET ?action=task&taskId=<id>": "Get specific task details",
            "GET ?action=todos&status=<status>": "List todos by status",
            "GET ?action=todos_by_task&taskId=<id>": "Get todos for specific task",
            "POST": "Create new orchestrated task or todo",
            "PUT": "Update task/todo status"
          },
          statistics: {
            activeTasks: globalTaskManager.getActiveTasksCount(),
            totalTodos: globalTodoListManager.getTodos().length,
            pendingTodos: globalTodoListManager.getTodos('todo').length,
            inProgressTodos: globalTodoListManager.getTodos('in_progress').length,
            completedTodos: globalTodoListManager.getTodos('done').length,
          }
        });
    }
  } catch (error) {
    console.error("Orchestration API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    switch (type) {
      case 'create_task':
        const { taskType, description: taskDescription, cliCommand } = data;
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create task with LangGraph workflow
        const steps = [
          { id: 'cli_execution', description: `Execute CLI: ${cliCommand}` },
          { id: 'result_processing', description: 'Process CLI results' },
          { id: 'plan_generation', description: 'Generate project plan' },
          { id: 'file_organization', description: 'Organize output files' },
        ];

        const task = globalTaskManager.createTask(taskId, taskType, taskDescription, steps);
        
        // Create related todos
        const taskTodoId = globalTodoListManager.addTodo(
          `Complete ${taskType} task`,
          taskDescription,
          'high',
          taskId
        );

        // Start workflow execution
        const orchestrator = globalWorkflowOrchestrator;
        const workflow = taskType === 'development' 
          ? orchestrator.createDevelopmentWorkflow()
          : orchestrator.createPlanningWorkflow();

        // Execute workflow in background
        workflow.invoke(task).catch(error => {
          console.error(`Workflow execution failed for task ${taskId}:`, error);
          globalTaskManager.updateTaskStatus(taskId, 'failed');
        });

        return NextResponse.json({
          success: true,
          taskId,
          todoId: taskTodoId,
          message: 'Orchestrated task created and workflow started',
          task,
        });

      case 'create_todo':
        const { title, description: todoDescription, priority, taskId: relatedTaskId } = data;
        const todoId = globalTodoListManager.addTodo(title, todoDescription, priority, relatedTaskId);
        
        return NextResponse.json({
          success: true,
          todoId,
          message: 'Todo created successfully',
        });

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Orchestration POST error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, status, stepId } = body;

    switch (type) {
      case 'update_task_status':
        globalTaskManager.updateTaskStatus(id, status);
        return NextResponse.json({ success: true, message: 'Task status updated' });

      case 'update_step_status':
        const { result } = body;
        globalTaskManager.updateStepStatus(id, stepId, status, result);
        return NextResponse.json({ success: true, message: 'Step status updated' });

      case 'update_todo_status':
        globalTodoListManager.updateTodoStatus(id, status);
        return NextResponse.json({ success: true, message: 'Todo status updated' });

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Orchestration PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}