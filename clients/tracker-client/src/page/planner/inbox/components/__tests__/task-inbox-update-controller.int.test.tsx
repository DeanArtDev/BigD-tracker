import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TaskFabric } from '@/shared/__tests__/entities';
import { mockDate, mockGetAssignableGroups, mockJsonPut, renderWithProviders } from '@/shared/__tests__';
import { TaskInboxUpdateController } from '../task-inbox-update-controller';

interface UpdateInboxTaskRequest {
  data: {
    name: string;
    priority: number;
    deadline?: string;
    description?: string;
  };
}

mockDate('2026-03-03T00:00:00.000Z');

describe('TaskInboxUpdateController integration', () => {
  it('sends expected payload to PUT /tasks/{taskId}/inbox from dialog form', async () => {
    const inboxTask = TaskFabric.createInboxTask({
      id: 'o:42',
      name: 'Обновляемая задача',
      description: 'Описание',
      priority: 2,
    });

    const requestSpy = mockJsonPut<UpdateInboxTaskRequest, { data: unknown }>({
      path: '*/api/tasks/*/inbox',
      response: {
        data: {
          ...inboxTask,
          deadline: '2026-03-06T23:59:59.000Z',
        },
      },
    });
    mockGetAssignableGroups([]);

    renderWithProviders(<TaskInboxUpdateController inboxTask={inboxTask} />);
    const user = userEvent.setup();

    await screen.findByRole('button', { name: 'Сохранить' });
    const sidebarTrigger = document.querySelector<SVGElement>('svg.lucide-panel-left')?.closest('button');
    expect(sidebarTrigger).not.toBeNull();
    await user.click(sidebarTrigger!);

    await user.click(screen.getByRole('button', { name: /Дедлайн:/i }));

    const dateButton = document.querySelector<HTMLButtonElement>(
      '[data-slot="calendar"] td[data-day="2026-03-06"] [data-slot="button"]',
    );
    expect(dateButton).not.toBeNull();
    await user.click(dateButton!);

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(requestSpy.getCallCount()).toBe(1);
      expect(requestSpy.getLastBody()).toMatchObject({
        data: {
          name: inboxTask.name,
          priority: inboxTask.priority,
          deadline: '2026-03-06T23:59:59.000Z',
        },
      });
    });
  });
});
