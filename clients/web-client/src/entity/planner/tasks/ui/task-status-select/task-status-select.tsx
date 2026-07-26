import { TaskStatus } from '@/shared/transport/graphql';
import { MultiSelect } from '@/shared/ui-kit';

const humanizeStatusMap: Record<TaskStatus, string> = {
  [TaskStatus.NotStarted]: 'Не начатые',
  [TaskStatus.InProgress]: 'Выполняются',
  [TaskStatus.Completed]: 'Завершенные',
  [TaskStatus.Overdue]: 'Просроченные',
  [TaskStatus.Canceled]: 'Отмененные',
  [TaskStatus.Archived]: 'Архивные',
  [TaskStatus.Deleted]: 'Удаленные',
};

const availableOptions = [
  TaskStatus.NotStarted,
  TaskStatus.InProgress,
  TaskStatus.Completed,
  TaskStatus.Overdue,
  TaskStatus.Canceled,
];

interface TaskStatusSelectProps {
  readonly placeholder?: string;
  readonly values: TaskStatus[] | undefined;
  readonly onChange: (values: TaskStatus[]) => void;
}

function TaskStatusSelect({ values = [], placeholder = 'Статус', onChange }: TaskStatusSelectProps) {
  const options = availableOptions.map((v) => ({ value: v, label: humanizeStatusMap[v] }));

  return <MultiSelect placeholder={placeholder} options={options} value={values} onChange={onChange} />;
}

export { TaskStatusSelect, type TaskStatusSelectProps };
