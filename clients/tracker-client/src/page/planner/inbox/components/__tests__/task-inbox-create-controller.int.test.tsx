import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TaskInboxCreateController } from '../task-inbox-create-controller';
import { mockDate, mockJsonPost, renderWithProviders } from '@/shared/__tests__';

interface CreateInboxTaskRequest {
  data: {
    name: string;
    priority: number;
    deadline?: string;
    description?: string;
  };
}

mockDate('2026-03-03T00:00:00.000Z');

describe('TaskInboxCreateController integration', () => {
  it('sends expected payload to POST /tasks/in-box from dialog form', async () => {
    const expectedName = 'Новая задача для inbox';
    const expectedDeadline = '2026-03-04T23:59:59.000Z';
    const requestSpy = mockJsonPost<CreateInboxTaskRequest, { data: unknown }>({
      path: '*/api/tasks/in-box',
      status: 201,
      response: {
        data: {
          id: 'o:1',
          userId: 1,
          name: expectedName,
          priority: 4,
          weight: 1,
          status: 'NOT_STARTED',
        },
      },
    });

    renderWithProviders(<TaskInboxCreateController />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button'));
    const nameInput = await screen.findByPlaceholderText('Задайте имя');
    await user.type(nameInput, expectedName);
    await user.click(screen.getByRole('button', { name: /Дедлайн:/i }));
    const dateButton = document.querySelector<HTMLButtonElement>(
      '[data-slot="calendar"] td[data-day="2026-03-04"] [data-slot="button"]',
    );
    expect(dateButton).not.toBeNull();
    await user.click(dateButton!);
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(requestSpy.getCallCount()).toBe(1);
      expect(requestSpy.getLastBody()).toMatchObject({
        data: {
          name: expectedName,
          priority: 4,
          deadline: expectedDeadline,
          description: expect.any(String),
        },
      });
    });
  });
});
