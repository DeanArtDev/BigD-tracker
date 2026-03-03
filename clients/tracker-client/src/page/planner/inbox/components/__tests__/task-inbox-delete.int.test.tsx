import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockDelete, mockGetInboxTasks, renderWithProviders } from '@/shared/__tests__';
import { TaskInboxList } from '../inbox-list/task-inbox-list';

describe('TaskInboxList integration', () => {
  it('sends expected request to DELETE /tasks/{taskId} after delete confirmation', async () => {
    const deleteSpy = mockDelete<{ data: { id: string } }>({
      path: '*/api/tasks/*',
      response: { data: { id: 'o:77' } },
    });

    mockGetInboxTasks([
      {
        id: 'o:77',
        name: 'Удаляемое дело',
      },
    ]);

    renderWithProviders(<TaskInboxList />);
    const user = userEvent.setup();

    await screen.findByText('Удаляемое дело');

    const deleteButton = document
      .querySelector<HTMLButtonElement>('.inbox-card-actions svg.lucide-trash')
      ?.closest('button');
    expect(deleteButton).not.toBeNull();
    await user.click(deleteButton!);

    await screen.findByText('Удалить?');
    await user.click(screen.getByRole('button', { name: 'Да' }));

    await waitFor(() => {
      expect(deleteSpy.getCallCount()).toBe(1);
    });
  });
});
