// TODO: Build the default task payload used by the board's creation request.
const buildNewTaskPayload = (now = new Date()) => ({
  title: "",
  description: "",
  status: "",
  priority: "",
  dueDate: now.toISOString().split("T")[0],
});

export { buildNewTaskPayload };
