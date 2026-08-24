const getDragUpdate = (result, tasks) => {
  const { source, destination } = result;
  if (!destination) return null;

  const statusByColumn = {
    todo: "To Do",
    inProgress: "In Progress",
    done: "Done",
  };
  const sourceTasks = tasks.filter(
    (task) => task.status === statusByColumn[source.droppableId]
  );
  const task = sourceTasks[source.index];
  if (!task || !statusByColumn[destination.droppableId]) return null;

  return { ...task, status: statusByColumn[destination.droppableId] };
};

export { getDragUpdate };
