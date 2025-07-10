import { RepetitionFinishType } from '../../application/repetitions.repository';
import { RepetitionEntity } from '../repetition.entity';

describe('RepetitionEntity', () => {
  it('creates repetition and sets fact', () => {
    const rep = RepetitionEntity.create({
      exerciseId: 1,
      position: 0,
      targetCount: 10,
      targetWeight: '10',
      targetBreak: 5,
    });
    rep.setFact({ finishType: RepetitionFinishType.DONE, factWeight: '10', factCount: 10 });
    expect(rep.status).toBe('break');
    rep.setDuration({ factBreak: 5 });
    expect(rep.status).toBe('done');
  });
});
