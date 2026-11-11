import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { server } from './grpc-server.js';
import { fetchDepartmentSummary } from './summary.js';

vi.mock('./summary.js', () => ({ fetchDepartmentSummary: vi.fn() }));
const mockedFetch = vi.mocked(fetchDepartmentSummary);

const PROTO_PATH = new URL('../proto/users.proto', import.meta.url).pathname;
const { users } = grpc.loadPackageDefinition(protoLoader.loadSync(PROTO_PATH, { keepCase: true })) as unknown as {
  users: { UserService: grpc.ServiceClientConstructor };
};

let client: grpc.Client & { GetDepartmentSummary: (req: object, cb: grpc.requestCallback<any>) => void };

const call = () =>
  new Promise<{ err: grpc.ServiceError | null; res: any }>((resolve) =>
    client.GetDepartmentSummary({}, (err: grpc.ServiceError | null, res: any) => resolve({ err, res })),
  );

beforeAll(async () => {
  const port = await new Promise<number>((resolve, reject) =>
    server.bindAsync('127.0.0.1:0', grpc.ServerCredentials.createInsecure(), (err, p) => (err ? reject(err) : resolve(p))),
  );
  client = new users.UserService(`127.0.0.1:${port}`, grpc.credentials.createInsecure()) as typeof client;
});

afterAll(() => {
  client.close();
  server.forceShutdown();
});

describe('UserService.GetDepartmentSummary', () => {
  it('returns the department summary', async () => {
    mockedFetch.mockResolvedValueOnce({
      Sales: { male: 1, female: 2, ageRange: '20-40', hair: { Black: 3 }, addressUser: { AnnLee: '11111' } },
    });

    const { err, res } = await call();

    expect(err).toBeNull();
    expect(res.departments.Sales).toEqual({
      male: 1,
      female: 2,
      ageRange: '20-40',
      hair: { Black: 3 },
      addressUser: { AnnLee: '11111' },
    });
  });

  it('responds UNAVAILABLE when the upstream API fails', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Upstream responded with 500'));

    const { err } = await call();

    expect(err?.code).toBe(grpc.status.UNAVAILABLE);
    expect(err?.details).toBe('Upstream responded with 500');
  });
});
