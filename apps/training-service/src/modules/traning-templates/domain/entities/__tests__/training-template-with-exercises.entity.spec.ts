import { TrainingType, ExerciseType } from '@big-d/api-contracts';
import { TrainingTemplateWithExercisesEntity } from '../training-template-with-exercises.entity';
import { ExerciseWithRepetitionsEntity } from '../../../../exercises/domain';
import { RepetitionEntity } from '../../../../repetitions/domain/repetition.entity';

describe('TrainingTemplateWithExercisesEntity', () => {
  it('sets exercises', () => {
    const template = TrainingTemplateWithExercisesEntity.create({
      name: 'T',
      type: TrainingType.LIGHT,
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
    exercise.setRepetitions([rep]);
    template.setExercises([exercise.assignToTemplate({ trainingTemplateId: template.id })]);
    expect(template.exercises.length).toBe(1);
  });
});
