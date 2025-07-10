import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { Expose } from 'class-transformer';
import { BaseMapper } from '../../src/mapper/mapper';

class Dto {
  @Expose()
  a!: string;
}

describe('BaseMapper', () => {
  it('maps entity to DTO', () => {
    const mapper = new BaseMapper();
    const entity = { a: '1', b: 2 } as any;
    const dto = mapper['entityToDTO'](entity, Dto);
    expect(dto).toBeInstanceOf(Dto);
    expect((dto as any).a).toBe('1');
    expect(dto).not.toHaveProperty('b');
  });
});
