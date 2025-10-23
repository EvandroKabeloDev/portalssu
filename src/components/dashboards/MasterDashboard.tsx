import { useState } from "react";
import { useTickets } from "@/contexts/TicketContext";
import { Ticket } from "@/types/ticket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  UserPlus, 
  Send,
  BarChart3,
  FolderOpen,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Papa from "papaparse";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MasterDashboard = () => {
  const { tickets, assignTickets, sendToWebhook, addTickets } = useTickets();
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [filterNeighborhoods, setFilterNeighborhoods] = useState<string[]>([]);
  const [filterSyntheses, setFilterSyntheses] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterManagers, setFilterManagers] = useState<string[]>([]);
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<"open" | "scheduled" | "closed" | "baixa" | "managers">("open");
  
  // Reset filters and selections when changing views
  const changeView = (view: "open" | "scheduled" | "closed" | "baixa" | "managers") => {
    setActiveView(view);
    setSelectedTickets([]);
    setFilterNeighborhoods([]);
    setFilterSyntheses([]);
    setFilterStatuses([]);
    setFilterManagers([]);
    setSelectedManager("");
  };
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const neighborhoods = Array.from(
    new Set(tickets.map((t) => t.complaintAddress.neighborhood))
  );
  const syntheses = Array.from(new Set(tickets.map((t) => t.synthesis)));
  const managers = Array.from(
    new Set(tickets.filter((t) => t.assignedManager).map((t) => t.assignedManager!))
  );

  const toggleFilter = (value: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(v => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatuses.length > 0 && !filterStatuses.includes(ticket.status)) return false;
    if (filterNeighborhoods.length > 0 && !filterNeighborhoods.includes(ticket.complaintAddress.neighborhood)) return false;
    if (filterSyntheses.length > 0 && !filterSyntheses.includes(ticket.synthesis)) return false;
    if (filterManagers.length > 0 && (!ticket.assignedManager || !filterManagers.includes(ticket.assignedManager))) return false;
    return true;
  });

  const openTickets = filteredTickets.filter((t) => t.status === "Em Aberto");
  const scheduledTickets = filteredTickets.filter((t) => t.status === "Programado/Aguardando");
  const closedTickets = filteredTickets.filter((t) => t.status === "Encerrado/Atendido");
  const baixaTickets = filteredTickets.filter((t) => t.status === "Baixa");
  const managersTickets = filteredTickets.filter((t) => t.assignedManager);

  const currentViewTickets = 
    activeView === "open" ? openTickets :
    activeView === "scheduled" ? scheduledTickets :
    activeView === "closed" ? closedTickets :
    activeView === "baixa" ? baixaTickets :
    activeView === "managers" ? managersTickets : [];

  const toggleTicket = (ticketId: string) => {
    setSelectedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const selectAllCurrentView = () => {
    const allIds = currentViewTickets.map(t => t.id);
    if (selectedTickets.length === allIds.length && allIds.every(id => selectedTickets.includes(id))) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(allIds);
    }
  };

  const handleAssign = () => {
    if (selectedTickets.length === 0) {
      toast({
        title: "Nenhum chamado selecionado",
        description: "Selecione pelo menos um chamado para atribuir",
        variant: "destructive",
      });
      return;
    }

    if (!selectedManager) {
      toast({
        title: "Gerente não selecionado",
        description: "Selecione um gerente para atribuir os chamados",
        variant: "destructive",
      });
      return;
    }

    assignTickets(selectedTickets, selectedManager);
    setSelectedTickets([]);
    setSelectedManager("");
    
    toast({
      title: "Chamados atribuídos com sucesso",
      description: `${selectedTickets.length} chamado(s) atribuído(s) para ${selectedManager}`,
    });
  };

  const handleSendToWebhook = async () => {
    if (selectedTickets.length === 0) {
      toast({
        title: "Nenhum chamado selecionado",
        description: "Selecione pelo menos um chamado para dar baixa",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    const result = await sendToWebhook(selectedTickets);
    setIsSending(false);
    
    if (result.success) {
      setSelectedTickets([]);
      toast({
        title: "Baixa realizada com sucesso",
        description: `${selectedTickets.length} chamado(s) processado(s) e movidos para a fila Baixa`,
      });
    } else {
      toast({
        title: "Erro ao dar baixa",
        description: result.error || "Verifique a configuração do webhook",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: ";",
        complete: (results) => {
          try {
            const newTickets: Ticket[] = results.data.map((row: any, index: number) => {
              // Parse endereço
              const enderecoCompleto = row['Endereço'] || '';
              const enderecoMatch = enderecoCompleto.match(/^([^,]+)/);
              const street = enderecoMatch ? enderecoMatch[1].trim() : enderecoCompleto;

              // Parse telefone
              const telefone = row['Celular Requerente'] || row['Telefone Requerente'] || '';

              return {
                id: `ticket-${Date.now()}-${index}`,
                osNumber: row['Processo'] || '',
                openDate: row['Data'] || new Date().toISOString().split('T')[0],
                synthesis: row['Serviço'] || '',
                requester: {
                  name: row['Requerente'] || '',
                  phone: telefone,
                  cpf: row['CPF/CNPJ'] || '',
                  address: enderecoCompleto
                },
                complaintAddress: {
                  street: street,
                  neighborhood: row['Bairro'] || '',
                  number: '',
                  reference: row['Localização'] || ''
                },
                status: "Em Aberto" as const,
                statusHistory: [
                  {
                    date: new Date().toISOString(),
                    status: "Em Aberto" as const,
                    notes: "Importado via CSV"
                  }
                ],
                notes: row['Solicitante'] ? `Solicitante: ${row['Solicitante']}` : undefined
              };
            });

            addTickets(newTickets);
            setUploadDialogOpen(false);
            
            toast({
              title: "Arquivo carregado com sucesso",
              description: `${newTickets.length} chamado(s) importado(s)`,
            });
          } catch (error) {
            toast({
              title: "Erro ao processar arquivo",
              description: "Verifique se o formato do arquivo está correto",
              variant: "destructive",
            });
          }
        },
        error: (error) => {
          toast({
            title: "Erro ao ler arquivo",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        title: "Formato não suportado",
        description: "Por favor, use um arquivo CSV",
        variant: "destructive",
      });
    }
  };


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-[calc(100vh-8rem)] w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Filas de Chamados</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => changeView("open")}
                      isActive={activeView === "open"}
                      tooltip="Chamados Abertos"
                    >
                      <FolderOpen className="h-4 w-4" />
                      <span>Chamados Abertos</span>
                      <span className="ml-auto text-xs bg-status-open/20 text-status-open px-2 py-0.5 rounded-full">
                        {openTickets.length}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => changeView("scheduled")}
                      isActive={activeView === "scheduled"}
                      tooltip="Chamados Programados"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Chamados Programados</span>
                      <span className="ml-auto text-xs bg-status-scheduled/20 text-status-scheduled px-2 py-0.5 rounded-full">
                        {scheduledTickets.length}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => changeView("closed")}
                      isActive={activeView === "closed"}
                      tooltip="Chamados Encerrados"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Chamados Encerrados</span>
                      <span className="ml-auto text-xs bg-status-completed/20 text-status-completed px-2 py-0.5 rounded-full">
                        {closedTickets.length}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => changeView("baixa")}
                      isActive={activeView === "baixa"}
                      tooltip="Baixa"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Baixa</span>
                      <span className="ml-auto text-xs bg-status-completed/20 text-status-completed px-2 py-0.5 rounded-full">
                        {baixaTickets.length}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => changeView("managers")}
                      isActive={activeView === "managers"}
                      tooltip="Chamados de Gerentes"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Chamados de Gerentes</span>
                      <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {managersTickets.length}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto p-4 border-t">
            <SidebarTrigger />
          </div>
        </Sidebar>

        <main className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gestão Master</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Distribua e gerencie todos os chamados do sistema
              </p>
            </div>

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-md w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-sm md:text-base">Carregar</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Carregar Arquivo de Chamados</DialogTitle>
                  <DialogDescription>
                    Faça upload de um arquivo CSV, ODS ou PDF com os chamados
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Arquivo</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".csv,.ods,.pdf"
                      onChange={handleFileUpload}
                    />
                    <p className="text-xs text-muted-foreground">
                      Formatos aceitos: CSV, ODS, PDF
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <Card className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                  <FolderOpen className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                  <p className="text-lg md:text-2xl font-bold">{tickets.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-status-open/10">
                  <FolderOpen className="h-4 w-4 md:h-6 md:w-6 text-status-open" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Aberto</p>
                  <p className="text-lg md:text-2xl font-bold">{openTickets.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-status-scheduled/10">
                  <BarChart3 className="h-4 w-4 md:h-6 md:w-6 text-status-scheduled" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Programado</p>
                  <p className="text-lg md:text-2xl font-bold">{scheduledTickets.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-status-completed/10">
                  <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-status-completed" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Encerrado</p>
                  <p className="text-lg md:text-2xl font-bold">{closedTickets.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 md:p-6 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="p-2 md:p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Baixa</p>
                  <p className="text-lg md:text-2xl font-bold">{baixaTickets.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-3 md:p-6">
            <div className="flex flex-row flex-wrap gap-3 md:gap-4 mb-4 md:mb-6">
              {activeView === "managers" && (
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">Nome dos Gerentes</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {filterManagers.length === 0 ? "Todos" : `${filterManagers.length} selecionado(s)`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 pb-2 border-b">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => setFilterManagers([])}
                          >
                            Todos
                          </Button>
                        </div>
                        {managers.map((manager) => (
                          <div key={manager} className="flex items-center space-x-2">
                            <Checkbox
                              checked={filterManagers.includes(manager)}
                              onCheckedChange={() => toggleFilter(manager, filterManagers, setFilterManagers)}
                            />
                            <label className="text-sm cursor-pointer" onClick={() => toggleFilter(manager, filterManagers, setFilterManagers)}>
                              {manager}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">Status</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filterStatuses.length === 0 ? "Todos" : `${filterStatuses.length} selecionado(s)`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-3">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setFilterStatuses([])}
                        >
                          Todos
                        </Button>
                      </div>
                      {["Em Aberto", "Programado/Aguardando", "Em Atendimento", "Encerrado/Atendido", "Baixa"].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filterStatuses.includes(status)}
                            onCheckedChange={() => toggleFilter(status, filterStatuses, setFilterStatuses)}
                          />
                          <label className="text-sm cursor-pointer" onClick={() => toggleFilter(status, filterStatuses, setFilterStatuses)}>
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">Bairro</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filterNeighborhoods.length === 0 ? "Todos" : `${filterNeighborhoods.length} selecionado(s)`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-3 max-h-[300px] overflow-y-auto">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setFilterNeighborhoods([])}
                        >
                          Todos
                        </Button>
                      </div>
                      {neighborhoods.map((neighborhood) => (
                        <div key={neighborhood} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filterNeighborhoods.includes(neighborhood)}
                            onCheckedChange={() => toggleFilter(neighborhood, filterNeighborhoods, setFilterNeighborhoods)}
                          />
                          <label className="text-sm cursor-pointer" onClick={() => toggleFilter(neighborhood, filterNeighborhoods, setFilterNeighborhoods)}>
                            {neighborhood}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">Síntese</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filterSyntheses.length === 0 ? "Todos" : `${filterSyntheses.length} selecionado(s)`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-3 max-h-[300px] overflow-y-auto">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setFilterSyntheses([])}
                        >
                          Todos
                        </Button>
                      </div>
                      {syntheses.map((synthesis) => (
                        <div key={synthesis} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filterSyntheses.includes(synthesis)}
                            onCheckedChange={() => toggleFilter(synthesis, filterSyntheses, setFilterSyntheses)}
                          />
                          <label className="text-sm cursor-pointer text-left" onClick={() => toggleFilter(synthesis, filterSyntheses, setFilterSyntheses)}>
                            {synthesis}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {selectedTickets.length > 0 && activeView === "open" && (
              <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">
                    Atribuir para Gerente
                  </Label>
                  <Select value={selectedManager} onValueChange={setSelectedManager}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um gerente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gerente A - Execução">
                        Gerente A - Execução
                      </SelectItem>
                      <SelectItem value="Gerente B - Execução">
                        Gerente B - Execução
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={handleAssign}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Atribuir ({selectedTickets.length})
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {activeView === "open" && "Chamados Abertos"}
                {activeView === "scheduled" && "Chamados Programados"}
                {activeView === "closed" && "Chamados Encerrados"}
                {activeView === "baixa" && "Fila de Baixa"}
                {activeView === "managers" && "Chamados de Gerentes"}
              </h3>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllCurrentView}>
                  {selectedTickets.length === currentViewTickets.length && currentViewTickets.length > 0 ? "Desmarcar Todos" : "Selecionar Todos"}
                </Button>
                
                {selectedTickets.length > 0 && (activeView === "closed" || activeView === "baixa") && (
                  <Button 
                    variant="secondary" 
                    onClick={handleSendToWebhook}
                    disabled={isSending}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSending ? "Enviando..." : `Dar Baixa (${selectedTickets.filter(id => closedTickets.find(t => t.id === id)).length})`}
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
                  />
                ))
              )}
            </div>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

const TicketCard = ({
  ticket,
  isSelected,
  onToggle,
}: {
  ticket: Ticket;
  isSelected: boolean;
  onToggle: () => void;
}) => {
  const isBaixa = ticket.status === "Baixa";
  
  return (
    <Card className={`p-4 transition-all ${isSelected ? "ring-2 ring-primary shadow-md" : ""} ${isBaixa ? "opacity-75" : ""}`}>
      <div className="flex items-start gap-4">
        <Checkbox 
          checked={isSelected} 
          onCheckedChange={onToggle}
          disabled={isBaixa}
        />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h4 className="font-semibold text-lg">{ticket.osNumber}</h4>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
              <span className="text-muted-foreground">Data:</span>{" "}
              <span className="font-medium">{ticket.openDate}</span>
            </div>
            {ticket.assignedManager && (
              <div>
                <span className="text-muted-foreground">Gerente:</span>{" "}
                <span className="font-medium">{ticket.assignedManager}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MasterDashboard;
