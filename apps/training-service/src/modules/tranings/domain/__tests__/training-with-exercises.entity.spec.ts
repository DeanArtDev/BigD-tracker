import { TrainingType, ExerciseType } from '@big-d/api-contracts';
import { TrainingWithExercisesEntity } from '../entities/training-with-exercises.entity';
import { ExerciseWithRepetitionsEntity } from '../../../exercises/domain';
import { RepetitionEntity } from '../../../repetitions/domain/repetition.entity';

describe('TrainingWithExercisesEntity', () => {
  it('sets exercises', () => {
    const training = TrainingWithExercisesEntity.create({
      userId: 1,
      name: 'T',
      type: TrainingType.LIGHT,
      startDate: new Date().toISOString(),
    });
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
      targetBreak: 5,
    });
    exercise.setRepetitions([rep]).assignToTraining({ trainingId: training.id });
    training.setExercises([exercise]);
    expect(training.exercises.length).toBe(1);
  });
});
