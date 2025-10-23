import { Badge } from "@/components/ui/badge";
import { TicketStatus } from "@/types/ticket";
import { Clock, AlertCircle, PlayCircle, CheckCircle } from "lucide-react";

interface StatusBadgeProps {
  status: TicketStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case "Em Aberto":
        return {
          icon: AlertCircle,
          className: "bg-status-open/10 text-status-open border-status-open/20",
          label: "Em Aberto"
        };
      case "Programado/Aguardando":
        return {
          icon: Clock,
          className: "bg-status-scheduled/10 text-status-scheduled border-status-scheduled/20",
          label: "Programado"
        };
      case "Em Atendimento":
        return {
          icon: PlayCircle,
          className: "bg-status-progress/10 text-status-progress border-status-progress/20",
          label: "Em Atendimento"
        };
      case "Encerrado/Atendido":
        return {
          icon: CheckCircle,
          className: "bg-status-completed/10 text-status-completed border-status-completed/20",
          label: "Concluído"
        };
      case "Baixa":
        return {
          icon: CheckCircle,
          className: "bg-green-500/10 text-green-600 border-green-500/20",
          label: "Baixa"
        };
      default:
        return {
          icon: AlertCircle,
          className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          label: status
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} font-medium`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
