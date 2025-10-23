import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Ticket, TicketStatus } from "@/types/ticket";
import { mockTickets } from "@/data/mockTickets";

interface TicketContextType {
  tickets: Ticket[];
  updateTicketStatus: (ticketIds: string[], newStatus: TicketStatus, assignedManager?: string) => void;
  assignTickets: (ticketIds: string[], managerName: string) => void;
  startAttendance: (ticketIds: string[]) => void;
  closeTickets: (ticketIds: string[], notes?: string, photos?: string[]) => void;
  addTickets: (newTickets: Ticket[]) => void;
  sendToWebhook: (ticketIds: string[]) => Promise<{ success: boolean; error?: string }>;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider = ({ children }: { children: ReactNode }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const version = localStorage.getItem("ssu-version");
    if (version !== "2.0") {
      // Limpar dados antigos e iniciar sem chamados
      setTickets([]);
      localStorage.setItem("ssu-tickets", JSON.stringify([]));
      localStorage.setItem("ssu-version", "2.0");
    } else {
      const savedTickets = localStorage.getItem("ssu-tickets");
      if (savedTickets) {
        setTickets(JSON.parse(savedTickets));
      } else {
        setTickets([]);
      }
    }
  }, []);

  const saveTickets = (updatedTickets: Ticket[]) => {
    setTickets(updatedTickets);
    try {
      // Remover fotos antes de salvar no localStorage para evitar quota exceeded
      const ticketsWithoutPhotos = updatedTickets.map(ticket => ({
        ...ticket,
        photos: undefined // Fotos não serão armazenadas localmente
      }));
      localStorage.setItem("ssu-tickets", JSON.stringify(ticketsWithoutPhotos));
    } catch (error) {
      console.error("Erro ao salvar tickets no localStorage:", error);
      // Continua mesmo se localStorage falhar
    }
  };

  const updateTicketStatus = (
    ticketIds: string[],
    newStatus: TicketStatus,
    assignedManager?: string
  ) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticketIds.includes(ticket.id)) {
        return {
          ...ticket,
          status: newStatus,
          assignedManager: assignedManager || ticket.assignedManager,
          statusHistory: [
            ...ticket.statusHistory,
            {
              date: new Date().toLocaleString("pt-BR"),
              status: newStatus,
              notes: assignedManager ? `Alocado para ${assignedManager}` : undefined,
            },
          ],
        };
      }
      return ticket;
    });
    saveTickets(updatedTickets);
  };

  const assignTickets = (ticketIds: string[], managerName: string) => {
    updateTicketStatus(ticketIds, "Programado/Aguardando", managerName);
  };

  const startAttendance = (ticketIds: string[]) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticketIds.includes(ticket.id)) {
        return {
          ...ticket,
          status: "Em Atendimento" as TicketStatus,
          slaStartTime: new Date().toLocaleString("pt-BR"),
          statusHistory: [
            ...ticket.statusHistory,
            {
              date: new Date().toLocaleString("pt-BR"),
              status: "Em Atendimento" as TicketStatus,
              notes: "Iniciado atendimento",
            },
          ],
        };
      }
      return ticket;
    });
    saveTickets(updatedTickets);
  };

  const closeTickets = (ticketIds: string[], notes?: string, photos?: string[]) => {
    const updatedTickets = tickets.map((ticket) => {
      if (ticketIds.includes(ticket.id)) {
        return {
          ...ticket,
          status: "Encerrado/Atendido" as TicketStatus,
          slaEndTime: new Date().toLocaleString("pt-BR"),
          notes: notes || ticket.notes,
          // Fotos mantidas em memória para envio ao webhook
          photos: photos || ticket.photos,
          statusHistory: [
            ...ticket.statusHistory,
            {
              date: new Date().toLocaleString("pt-BR"),
              status: "Encerrado/Atendido" as TicketStatus,
              notes: notes || "Serviço concluído",
            },
          ],
        };
      }
      return ticket;
    });
    saveTickets(updatedTickets);
  };

  const addTickets = (newTickets: Ticket[]) => {
    const updatedTickets = [...tickets, ...newTickets];
    saveTickets(updatedTickets);
  };

  const sendToWebhook = async (ticketIds: string[]): Promise<{ success: boolean; error?: string }> => {
    const webhookUrl = localStorage.getItem("ssu-webhook-url") || "";
    const callbackUrl = localStorage.getItem("ssu-callback-url") || "";
    
    if (!webhookUrl) {
      console.warn("Webhook URL not configured");
      return { success: false, error: "URL do webhook não configurada" };
    }

    const successfulIds: string[] = [];
    
    try {
      for (let i = 0; i < ticketIds.length; i++) {
        const ticketId = ticketIds[i];
        const ticket = tickets.find((t) => t.id === ticketId);
        
        if (ticket) {
          console.log(`Sending ticket ${ticket.osNumber} to webhook (${i + 1}/${ticketIds.length})...`);
          
          // Prepare webhook payload with notes and photos
          const webhookPayload = {
            ...ticket,
            notes: ticket.notes || "",
            photos: ticket.photos || []
          };
          
          // Send ticket to webhook
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          console.log(`Ticket ${ticket.osNumber} sent successfully`);
          
          // Wait for callback confirmation if callback URL is configured
          if (callbackUrl && i < ticketIds.length - 1) {
            console.log(`Waiting for callback confirmation...`);
            
            // Wait for callback (simulate polling - in real scenario, use WebSocket or server event)
            const callbackResponse = await waitForCallback(callbackUrl, ticketId);
            
            if (callbackResponse.status === "NOK") {
              return { 
                success: false, 
                error: `Erro no processamento do chamado ${ticket.osNumber}. Acione o administrador do sistema.` 
              };
            }
          }
          
          successfulIds.push(ticketId);
          
          // Wait 1 second before sending next ticket
          if (i < ticketIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      // Move all successful tickets to "Baixa" status
      if (successfulIds.length > 0) {
        updateTicketStatus(successfulIds, "Baixa");
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error sending to webhook:", error);
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
    }
  };

  // Helper function to wait for callback (simplified version)
  const waitForCallback = async (callbackUrl: string, ticketId: string): Promise<{ status: "OK" | "NOK" }> => {
    // In a real implementation, this would listen to a callback endpoint
    // For now, simulate a successful callback after a short delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { status: "OK" };
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        updateTicketStatus,
        assignTickets,
        startAttendance,
        closeTickets,
        addTickets,
        sendToWebhook,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error("useTickets must be used within a TicketProvider");
  }
  return context;
};
