import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTickets } from "@/contexts/TicketContext";
import { Ticket } from "@/types/ticket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  PlayCircle,
  CheckCircle,
  CheckCircle2,
  Image as ImageIcon,
  Clock,
  FolderOpen,
  BarChart3,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const { tickets, startAttendance, closeTickets } = useTickets();
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closingNotes, setClosingNotes] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"scheduled" | "progress" | "closed">("scheduled");
  const { toast } = useToast();

  const myTickets = tickets.filter(
    (ticket) => ticket.assignedManager === user?.name
  );

  const scheduledTickets = myTickets.filter(
    (t) => t.status === "Programado/Aguardando"
  );
  const inProgressTickets = myTickets.filter(
    (t) => t.status === "Em Atendimento"
  );
  const closedTickets = myTickets.filter(
    (t) => t.status === "Encerrado/Atendido"
  );

  const currentViewTickets = 
    activeView === "scheduled" ? scheduledTickets :
    activeView === "progress" ? inProgressTickets :
    activeView === "closed" ? closedTickets : [];
  
  const scheduledSelected = selectedTickets.filter((id) => {
    const ticket = tickets.find((t) => t.id === id);
    return ticket?.status === "Programado/Aguardando";
  });
  
  const inProgressSelected = selectedTickets.filter((id) => {
    const ticket = tickets.find((t) => t.id === id);
    return ticket?.status === "Em Atendimento";
  });

  const toggleTicket = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const selectAllCurrentView = () => {
    // Don't allow selecting tickets with "Encerrado/Atendido" status from closed view
    const selectableTickets = currentViewTickets.filter(t => t.status !== "Encerrado/Atendido" || activeView !== "closed");
    const allIds = selectableTickets.map(t => t.id);
    if (selectedTickets.length === allIds.length && allIds.every(id => selectedTickets.includes(id))) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(allIds);
    }
  };

  const handleStartAttendance = () => {
    if (selectedTickets.length === 0) {
      toast({
        title: "Nenhum chamado selecionado",
        description: "Selecione pelo menos um chamado para iniciar",
        variant: "destructive",
      });
      return;
    }

    const validTickets = selectedTickets.filter((id) => {
      const ticket = tickets.find((t) => t.id === id);
      return ticket?.status === "Programado/Aguardando";
    });

    if (validTickets.length === 0) {
      toast({
        title: "Nenhum chamado válido",
        description: "Selecione apenas chamados programados",
        variant: "destructive",
      });
      return;
    }

    startAttendance(validTickets);
    setSelectedTickets([]);

    toast({
      title: "Atendimento iniciado",
      description: `${validTickets.length} chamado(s) em atendimento`,
    });
  };

  const handleOpenCloseDialog = () => {
    if (selectedTickets.length === 0) {
      toast({
        title: "Nenhum chamado selecionado",
        description: "Selecione pelo menos um chamado para encerrar",
        variant: "destructive",
      });
      return;
    }

    const validTickets = selectedTickets.filter((id) => {
      const ticket = tickets.find((t) => t.id === id);
      return ticket?.status === "Em Atendimento";
    });

    if (validTickets.length === 0) {
      toast({
        title: "Nenhum chamado válido",
        description: "Selecione apenas chamados em atendimento",
        variant: "destructive",
      });
      return;
    }

    setCloseDialogOpen(true);
  };

  const handleCloseTickets = () => {
    const validTickets = selectedTickets.filter((id) => {
      const ticket = tickets.find((t) => t.id === id);
      return ticket?.status === "Em Atendimento";
    });

    if (selectedTickets.length === 1) {
      closeTickets(validTickets, closingNotes || undefined, uploadedPhotos.length > 0 ? uploadedPhotos : undefined);
    } else {
      closeTickets(validTickets);
    }

    setSelectedTickets([]);
    setClosingNotes("");
    setUploadedPhotos([]);
    setCloseDialogOpen(false);

    toast({
      title: "Chamados encerrados com sucesso",
      description: `${validTickets.length} chamado(s) aguardando baixa do Gestor Master`,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const photosBase64: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(file);
      
      try {
        const base64 = await base64Promise;
        photosBase64.push(base64);
      } catch (error) {
        console.error("Error converting photo to base64:", error);
        toast({
          title: "Erro ao processar foto",
          description: `Não foi possível processar ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setUploadedPhotos(photosBase64);
    toast({
      title: "Fotos carregadas",
      description: `${photosBase64.length} foto(s) convertida(s) para base64`,
    });
  };

  const calculateSLA = (ticket: Ticket) => {
    if (!ticket.slaStartTime) return "N/A";
    const start = new Date(ticket.slaStartTime).getTime();
    const end = ticket.slaEndTime
      ? new Date(ticket.slaEndTime).getTime()
      : Date.now();
    const hours = Math.floor((end - start) / (1000 * 60 * 60));
    const minutes = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-[calc(100vh-8rem)] w-full">
        <Sidebar collapsible="icon" className="border-r">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-sm">Menu</h2>
            <SidebarTrigger />
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Filas de Chamados</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView("scheduled")}
                      isActive={activeView === "scheduled"}
                      tooltip="Programados"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Programados</span>
                      <span className="ml-auto text-xs bg-status-scheduled/20 text-status-scheduled px-2 py-0.5 rounded-full">
                        {scheduledTickets.length}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView("progress")}
                      isActive={activeView === "progress"}
                      tooltip="Em Atendimento"
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>Em Atendimento</span>
                      <span className="ml-auto text-xs bg-status-progress/20 text-status-progress px-2 py-0.5 rounded-full">
                        {inProgressTickets.length}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView("closed")}
                      isActive={activeView === "closed"}
                      tooltip="Encerrados"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Chamados Encerrados</span>
                      <span className="ml-auto text-xs bg-status-completed/20 text-status-completed px-2 py-0.5 rounded-full">
                        {closedTickets.length}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Meus Chamados</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Gerencie seus atendimentos e encerramentos
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-status-scheduled/10">
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-status-scheduled" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Programados</p>
                  <p className="text-xl md:text-2xl font-bold">{scheduledTickets.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-status-progress/10">
                  <PlayCircle className="h-5 w-5 md:h-6 md:w-6 text-status-progress" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Em Atendimento</p>
                  <p className="text-xl md:text-2xl font-bold">{inProgressTickets.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-status-completed/10">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-status-completed" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Encerrados</p>
                  <p className="text-xl md:text-2xl font-bold">{closedTickets.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-0 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold">
                {activeView === "scheduled" && "Chamados Programados"}
                {activeView === "progress" && "Chamados Em Atendimento"}
                {activeView === "closed" && "Chamados Encerrados"}
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {activeView !== "closed" && (
                  <Button variant="outline" size="sm" onClick={selectAllCurrentView} className="text-xs md:text-sm">
                    {selectedTickets.length === currentViewTickets.length && currentViewTickets.length > 0 ? "Desmarcar" : "Selecionar"}
                  </Button>
                )}
                
                {scheduledSelected.length > 0 && activeView === "scheduled" && (
                  <Button onClick={handleStartAttendance} size="sm" className="text-xs md:text-sm">
                    <PlayCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Iniciar</span> ({scheduledSelected.length})
                  </Button>
                )}

                {inProgressSelected.length > 0 && activeView === "progress" && (
                  <Button variant="secondary" onClick={handleOpenCloseDialog} size="sm" className="text-xs md:text-sm">
                    <CheckCircle className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                    Encerrar ({inProgressSelected.length})
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {currentViewTickets.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum chamado encontrado
                </p>
              ) : (
                currentViewTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={selectedTickets.includes(ticket.id)}
                    onToggle={() => toggleTicket(ticket.id)}
                    calculateSLA={calculateSLA}
                  />
                ))
              )}
            </div>
          </Card>

          <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
            <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Encerrar Chamado(s)</DialogTitle>
                <DialogDescription>
                  {selectedTickets.length === 1
                    ? "Adicione notas e fotos do atendimento (opcional)"
                    : `Encerrando ${selectedTickets.length} chamados em lote`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {selectedTickets.length === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas do Atendimento</Label>
                      <Textarea
                        id="notes"
                        placeholder="Descreva o atendimento realizado..."
                        value={closingNotes}
                        onChange={(e) => setClosingNotes(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photos">Fotos (opcional)</Label>
                      <Input
                        id="photos"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                      />
                      <p className="text-xs text-muted-foreground">
                        Anexe fotos do serviço realizado (serão convertidas para base64)
                      </p>
                      {uploadedPhotos.length > 0 && (
                        <p className="text-sm text-green-600">
                          ✓ {uploadedPhotos.length} foto(s) carregada(s)
                        </p>
                      )}
                    </div>
                  </>
                )}

                {selectedTickets.length > 1 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Em encerramentos em lote, não é possível adicionar notas ou
                      fotos individuais
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCloseDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCloseTickets}>
                  Encerrar {selectedTickets.length > 1 ? `(${selectedTickets.length})` : ""}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

const TicketCard = ({
  ticket,
  isSelected,
  onToggle,
  calculateSLA,
}: {
  ticket: Ticket;
  isSelected: boolean;
  onToggle: () => void;
  calculateSLA: (ticket: Ticket) => string;
}) => {
  const isClosed = ticket.status === "Encerrado/Atendido";
  
  return (
    <Card
      className={`p-3 md:p-4 transition-all ${
        isSelected ? "ring-2 ring-primary shadow-md" : ""
      } ${isClosed ? "opacity-75" : ""}`}
    >
      <div className="flex items-start gap-2 md:gap-4">
        {!isClosed && (
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onToggle}
            className="mt-1"
          />
        )}
        <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 md:gap-2">
            <h4 className="font-semibold text-base md:text-lg break-all">{ticket.osNumber}</h4>
            <StatusBadge status={ticket.status} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
            <div>
              <span className="text-muted-foreground">Síntese:</span>{" "}
              <span className="font-medium">{ticket.synthesis}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Bairro:</span>{" "}
              <span className="font-medium">
                {ticket.complaintAddress.neighborhood}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Data Abertura:</span>{" "}
              <span className="font-medium">{ticket.openDate}</span>
            </div>
            {ticket.slaStartTime && (
              <div>
                <span className="text-muted-foreground">Tempo SLA:</span>{" "}
                <span className="font-medium">{calculateSLA(ticket)}</span>
              </div>
            )}
          </div>

          {ticket.complaintAddress.reference && (
            <div className="text-sm">
              <span className="text-muted-foreground">Referência:</span>{" "}
              <span className="font-medium">
                {ticket.complaintAddress.reference}
              </span>
            </div>
          )}

          {ticket.notes && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground mb-1">Parecer:</p>
              <p>{ticket.notes}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ManagerDashboard;
