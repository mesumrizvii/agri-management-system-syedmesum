// All backend resources in one place: name -> API path.
import { makeApi } from "./api/makeApi";
import { makeResource } from "./resourceSlice";

const paths = {
  crops: "/crops",
  orders: "/orders",
  buyers: "/buyers",
  tasks: "/tasks",
  expenses: "/expenses",
  inventory: "/inventory",
  workers: "/workers",
  attendance: "/attendance",
  equipment: "/equipment",
  maintenance: "/maintenance",
  activity: "/activity",
};

export const resources = Object.fromEntries(
  Object.entries(paths).map(([name, path]) => [name, makeResource(name, makeApi(path))])
);

// users: GET /users answers { data: { users: [...] } }
resources.users = makeResource("users", makeApi("/users", "users"));
