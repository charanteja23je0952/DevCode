import taskModel from "../models/Task.js";

// TODO: Implement the task CRUD controller operations.
//
// Requirements:
// - createTask: create a task from req.body and return the created task.
// - deleteTask: delete the task identified by req.params.id.
// - Return the appropriate success status for each operation.
// - Return a useful error response when a database operation fails.
// - Return 404 when an delete targets a task that does not exist.
//
// Keep the existing API response shapes and route contracts intact.

const getTasks = async (req, res) => {
  try {
    const tasks = await taskModel.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  // TODO
};


const updateTask = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedTask = await taskModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  // TODO
};

const reorderTasks = async (req, res) => {
  const { tasks } = req.body;
  try {
    for (let task of tasks) {
      await taskModel.findByIdAndUpdate(task.id, { status: task.status });
    }
    res.status(200).json({ message: "Tasks reordered successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { getTasks, createTask, updateTask, deleteTask, reorderTasks };
