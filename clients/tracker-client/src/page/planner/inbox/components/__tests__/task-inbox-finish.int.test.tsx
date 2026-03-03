import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockGetInboxTasks, mockPost, renderWithProviders } from '@/shared/__tests__';
import { TaskInboxList } from '../inbox-list/task-inbox-list';

describe('TaskInboxList integration', () => {
  it('sends expected request to POST /tasks/{taskId}/finish', async () => {
    const finishSpy = mockPost<{ data: { id: string } }>({
      path: '*/api/tasks/*/finish',
      response: { data: { id: 'o:88' } },
    });

    mockGetInboxTasks([
      {
        id: 'o:88',
        name: 'Завершаемое дело',
      },
    ]);

    renderWithProviders(<TaskInboxList />);
    const user = userEvent.setup();

    await screen.findByText('Завершаемое дело');

    const finishButton = document
      .querySelector<HTMLButtonElement>('.inbox-card-actions svg.lucide-circle-check-big')
      ?.closest('button');
    expect(finishButton).not.toBeNull();
    await user.click(finishButton!);

    await waitFor(() => {
      expect(finishSpy.getCallCount()).toBe(1);
    });
  });
});
