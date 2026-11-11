import { groupByDepartment, type DepartmentSummary, type User } from './transform.js';

const USERS_URL = 'https://dummyjson.com/users?limit=0';

/** Fetches all users from dummyjson and returns the per-department summary. */
export async function fetchDepartmentSummary(): Promise<Record<string, DepartmentSummary>> {
  const upstream = await fetch(USERS_URL);
  if (!upstream.ok) throw new Error(`Upstream responded with ${upstream.status}`);
  const { users } = (await upstream.json()) as { users: User[] };
  return groupByDepartment(users);
}
