enum TaskPriority {
  DO = 1, // Важно и Срочно → Делай
  PLAN = 2, // Важно и Несрочно → Планируй
  DELEGATE = 3, // Неважно, но Срочно → Делегируй
  DELETE = 4, // Неважно и Несрочно → Удали
}

export { TaskPriority };
