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
  // TODO: Implement task creation.
  //
  // Requirements:
  // - Create a task from the request body using the existing Mongoose model.
  // - Persist it to MongoDB.
  // - Return the newly-created document with HTTP 201.
  // - Return an appropriate error response if persistence fails.
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
