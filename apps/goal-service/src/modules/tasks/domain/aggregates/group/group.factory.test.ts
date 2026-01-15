import { GroupFactory } from './group.factory';

describe('GroupFactory', () => {
  it('creates group with sanitized description', () => {
    const sanitizer = {
      sanitize: jest.fn((input: string) => input.replace('<b>', '').replace('</b>', '')),
    };
    const factory = new GroupFactory({ sanitizer });

    const group = factory.create({
      userId: 77,
      name: 'New group',
      description: '<b>Important</b>',
    });

    expect(sanitizer.sanitize).toHaveBeenCalledWith('<b>Important</b>');
    expect(group.name).toBe('New group');
    expect(group.description).toBe('Important');
  });

  it('creates group without description when omitted', () => {
    const sanitizer = {
      sanitize: jest.fn((input: string) => input),
    };
    const factory = new GroupFactory({ sanitizer });

    const group = factory.create({
      userId: 78,
      name: 'No description',
    });

    expect(sanitizer.sanitize).not.toHaveBeenCalled();
    expect(group.description).toBeUndefined();
  });
});
