export interface User {
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  age: number;
  hair: { color: string };
  address: { postalCode: string };
  company: { department: string };
}

export interface DepartmentSummary {
  male: number;
  female: number;
  ageRange: string;
  hair: Record<string, number>;
  addressUser: Record<string, string>;
}

type Accumulator = Omit<DepartmentSummary, 'ageRange'> & { minAge: number; maxAge: number };

/** Groups users by department in a single pass over the input. */
export function groupByDepartment(users: User[]): Record<string, DepartmentSummary> {
  const groups = new Map<string, Accumulator>();

  for (const user of users) {
    const department = user.company.department;
    let group = groups.get(department);
    if (!group) {
      group = { male: 0, female: 0, minAge: Infinity, maxAge: -Infinity, hair: {}, addressUser: {} };
      groups.set(department, group);
    }

    group[user.gender]++;
    group.minAge = Math.min(group.minAge, user.age);
    group.maxAge = Math.max(group.maxAge, user.age);
    group.hair[user.hair.color] = (group.hair[user.hair.color] ?? 0) + 1;
    group.addressUser[`${user.firstName}${user.lastName}`] = user.address.postalCode;
  }

  const result: Record<string, DepartmentSummary> = {};
  for (const [department, { minAge, maxAge, ...rest }] of groups) {
    result[department] = { ...rest, ageRange: `${minAge}-${maxAge}` };
  }
  return result;
}
