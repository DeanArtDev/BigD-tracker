import { ExerciseType } from '@big-d/api-contracts';
import { ExerciseEntity } from '../exercise.entity';
import { ExerciseWithRepetitionsEntity } from '../exercise-with-repetitions.entity';
import { RepetitionEntity } from '../../../repetitions/domain/repetition.entity';

describe('ExerciseEntity', () => {
  it('creates and updates exercise', () => {
    const exercise = ExerciseEntity.create({
      name: 'Push',
      type: ExerciseType.AEROBIC,
      position: 0,
    });
    expect(exercise.id).toBeGreaterThan(0);
    exercise.update({ name: 'Pull', type: ExerciseType.AEROBIC });
    expect(exercise.name).toBe('Pull');
  });
});

describe('ExerciseWithRepetitionsEntity', () => {
  it('sets repetitions', () => {
    const exercise = ExerciseWithRepetitionsEntity.create({
      name: 'Push',
      type: ExerciseType.AEROBIC,
      position: 0,
    });
    const rep = RepetitionEntity.create({
      exerciseId: exercise.id,
      position: 0,
      targetCount: 10,
      targetWeight: '10',
      targetBreak: 10,
    });
    exercise.setRepetitions([rep]);
    expect(exercise.repetitions.length).toBe(1);
  });
});
