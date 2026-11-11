import { describe, expect, it } from 'vitest';
import { groupByDepartment, type User } from './transform.js';

const user = (overrides: Partial<User> & { department?: string } = {}): User => ({
  firstName: 'Terry',
  lastName: 'Medhurst',
  gender: 'male',
  age: 30,
  hair: { color: 'Black' },
  address: { postalCode: '12345' },
  company: { department: overrides.department ?? 'Marketing' },
  ...overrides,
});

describe('groupByDepartment', () => {
  it('returns an empty object for no users', () => {
    expect(groupByDepartment([])).toEqual({});
  });

  it('summarises one department', () => {
    const result = groupByDepartment([
      user({ age: 30 }),
      user({ firstName: 'Emily', lastName: 'Johnson', gender: 'female', age: 45, hair: { color: 'Brown' }, address: { postalCode: '99999' } }),
      user({ firstName: 'Ann', lastName: 'Lee', gender: 'female', age: 22, hair: { color: 'Black' }, address: { postalCode: '11111' } }),
    ]);

    expect(result).toEqual({
      Marketing: {
        male: 1,
        female: 2,
        ageRange: '22-45',
        hair: { Black: 2, Brown: 1 },
        addressUser: { TerryMedhurst: '12345', EmilyJohnson: '99999', AnnLee: '11111' },
      },
    });
  });

  it('keeps departments separate', () => {
    const result = groupByDepartment([user({ department: 'Sales', age: 50 }), user({ department: 'Engineering', age: 20 })]);
    expect(Object.keys(result).sort()).toEqual(['Engineering', 'Sales']);
    expect(result.Sales.ageRange).toBe('50-50');
    expect(result.Engineering.ageRange).toBe('20-20');
  });
});
