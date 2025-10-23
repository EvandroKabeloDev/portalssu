import { User } from "@/types/ticket";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@ssu.gov",
    password: "123456",
    role: "admin",
    name: "Administrador do Sistema"
  },
  {
    id: "2",
    email: "master@ssu.gov",
    password: "123456",
    role: "master",
    name: "Gestor Master"
  },
  {
    id: "3",
    email: "gerenteA@ssu.gov",
    password: "123456",
    role: "managerA",
    name: "Gerente A - Execução"
  },
  {
    id: "4",
    email: "gerenteB@ssu.gov",
    password: "123456",
    role: "managerB",
    name: "Gerente B - Execução"
  }
];
