import { GroupFactory } from '../group.factory';

describe('GroupFactory', () => {
  it('creates group without description when omitted', () => {
    const sanitizer = {
      sanitize: jest.fn((input: string) => input),
    };
    const factory = new GroupFactory();

    const group = factory.create({
      userId: 78,
      name: 'No description',
    });

    expect(sanitizer.sanitize).not.toHaveBeenCalled();
    expect(group.description).toBeUndefined();
  });
});
