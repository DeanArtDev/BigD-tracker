import { TrainingType } from '@big-d/api-contracts';
import { TrainingTemplateEntity } from '../training-template.entity';

describe('TrainingTemplateEntity', () => {
  it('creates and updates template', () => {
    const t = TrainingTemplateEntity.create({ name: 'T', type: TrainingType.LIGHT });
    t.update({ name: 'T2', type: TrainingType.MEDIUM });
    expect(t.name).toBe('T2');
  });
});
