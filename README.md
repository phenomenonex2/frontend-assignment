# Frontend Assignment

Live demo for task 1: https://phenomenonex2.github.io/frontend-assignment/

## Task 1: Auto delete todo list

`index.html` in the root. Plain HTML, CSS and JavaScript in one file, no build step. Open it in a browser.

- Click an item in the left list and it moves to the Fruit or Vegetable column.
- After 5 seconds it goes back to the bottom of the left list.
- Click an item in the Fruit or Vegetable column and it goes back to the bottom of the left list right away. Its timer is cancelled.

State is a single `items` array. Each item has a `placed` flag and its own timer. Returning an item moves it to the end of the array, and `render()` redraws the three columns from that array.

## Task 2: Users grouped by department

In `api/`. TypeScript (ES modules) with Express and gRPC.

It fetches all users from `https://dummyjson.com/users?limit=0` and groups them by `company.department`. For each department it returns:

- `male` and `female` counts
- `ageRange` as `"min-max"`
- `hair`, a count per hair color
- `addressUser`, a map of `firstNameLastName` to postal code

```
cd api
npm install
```

| Command | What it does |
| --- | --- |
| `npm run dev` | HTTP server on port 3000 (`PORT` to change it) |
| `npm run dev:grpc` | gRPC server on port 50051 (`GRPC_PORT` to change it) |
| `npm test` | Run the tests |
| `npm run build` | Compile to `dist/` |

HTTP:

- `GET /` is a small page that shows the result as one card per department.
- `GET /users/summary` returns the JSON.

gRPC: `users.UserService/GetDepartmentSummary`, defined in `api/proto/users.proto`.

```
grpcurl -plaintext -import-path api/proto -proto users.proto \
  localhost:50051 users.UserService/GetDepartmentSummary
```

Layout:

- `src/transform.ts` has the grouping function. It goes through the users once.
- `src/summary.ts` fetches the users and calls the grouping function. HTTP and gRPC both use it.
- `src/server.ts` and `src/grpc-server.ts` are the two servers.
- Tests are in `src/*.test.ts` (vitest). The gRPC test starts a real server and mocks the upstream call.

Things to know:

- Nothing is cached. Every request calls dummyjson again.
- Keys in `addressUser` are first and last name joined together, so two people with the same name in one department would overwrite each other.
- In gRPC (proto3) a zero is left out of JSON output. A department with no men has no `male` field there. The HTTP response always has it.
- If dummyjson fails, HTTP returns 502 and gRPC returns `UNAVAILABLE`.
