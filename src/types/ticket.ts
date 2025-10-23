export type TicketStatus = 
  | "Em Aberto" 
  | "Programado/Aguardando" 
  | "Em Atendimento" 
  | "Encerrado/Atendido"
  | "Baixa";

export type UserRole = "admin" | "master" | "managerA" | "managerB";

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface StatusHistory {
  date: string;
  status: TicketStatus;
  notes?: string;
}

export interface Ticket {
  id: string;
  osNumber: string;
  openDate: string;
  synthesis: string;
  requester: {
    name: string;
    phone?: string;
    cpf?: string;
    address?: string;
  };
  complaintAddress: {
    street: string;
    neighborhood: string;
    number?: string;
    reference?: string;
  };
  status: TicketStatus;
  assignedManager?: string;
  statusHistory: StatusHistory[];
  notes?: string;
  photos?: string[];
  slaStartTime?: string;
  slaEndTime?: string;
}
