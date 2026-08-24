const buildNewTaskPayload = (now = new Date()) => ({
  title: "New Task",
  description: "New Description",
  status: "To Do",
  priority: "Medium",
  dueDate: now.toISOString().split("T")[0],
});

export { buildNewTaskPayload };
