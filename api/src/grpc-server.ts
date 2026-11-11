import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { fetchDepartmentSummary } from './summary.js';

const PORT = Number(process.env.GRPC_PORT ?? 50051);
const PROTO_PATH = new URL('../proto/users.proto', import.meta.url).pathname;

const definition = protoLoader.loadSync(PROTO_PATH, { keepCase: true });
const { users } = grpc.loadPackageDefinition(definition) as unknown as {
  users: { UserService: grpc.ServiceClientConstructor };
};

export const server = new grpc.Server();

server.addService(users.UserService.service, {
  GetDepartmentSummary: async (
    _call: grpc.ServerUnaryCall<unknown, unknown>,
    callback: grpc.sendUnaryData<unknown>,
  ) => {
    try {
      callback(null, { departments: await fetchDepartmentSummary() });
    } catch (err) {
      callback({ code: grpc.status.UNAVAILABLE, message: (err as Error).message });
    }
  },
});

if (process.argv[1] === import.meta.filename) {
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err) => {
    if (err) throw err;
    console.log(`gRPC listening on :${PORT}`);
  });
}
