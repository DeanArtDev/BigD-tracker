import { TrainingType } from '@big-d/api-contracts';
import { TrainingEntity } from '../entities/training.entity';

const createTraining = () =>
  TrainingEntity.create({
    userId: 1,
    name: 'T',
    type: TrainingType.LIGHT,
    startDate: new Date(Date.now() - 1000).toISOString(),
  });

describe('TrainingEntity', () => {
  it('creates and finishes training', () => {
    const t = createTraining();
    expect(t.inProgress).toBe(false);
    t['start']?.();
    expect(t.inProgress).toBe(true);
    t.finish();
    expect(t.isCompleted).toBe(true);
  });
});
