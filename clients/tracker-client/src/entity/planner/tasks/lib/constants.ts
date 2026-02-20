enum TaskPriority {
  DO = 1, // Важно и Срочно → Делай
  PLAN = 2, // Важно и Несрочно → Планируй
  DELEGATE = 3, // Неважно, но Срочно → Делегируй
  DELETE = 4, // Неважно и Несрочно → Удали
}

const taskPriorityColorMap = {
  [TaskPriority.DO]: '--priority-1',
  [TaskPriority.PLAN]: '--priority-2',
  [TaskPriority.DELEGATE]: '--priority-3',
  [TaskPriority.DELETE]: '--priority-4',
};

export { TaskPriority, taskPriorityColorMap };
