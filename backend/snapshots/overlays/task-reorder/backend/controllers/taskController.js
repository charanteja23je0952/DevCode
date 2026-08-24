import taskModel from "../models/Task.js";

const getTasks = async (req, res) => {
  try {
    const tasks = await taskModel.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  const task = new taskModel(req.body);
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
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
  const { id } = req.params;
  try {
    const deletedTask = await taskModel.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const reorderTasks = async (req, res) => {
  // TODO: Implement task reordering.
  //
  // Requirements:
  // - Read the task updates from req.body.tasks.
  // - Each item contains the task id and its destination status.
  // - Persist every task's new status using the task model.
  // - Return HTTP 200 with a success message when all updates succeed.
  // - Handle malformed input or database errors with an appropriate 4xx response.
  // - Do not report success if any required update fails.
};

export { getTasks, createTask, updateTask, deleteTask, reorderTasks };
