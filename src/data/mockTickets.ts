import { Ticket } from "@/types/ticket";

export const mockTickets: Ticket[] = [
  {
    id: "1",
    osNumber: "SSU 2025/4947",
    openDate: "07/07/2025 14:11",
    synthesis: "CATA BAGULHO",
    requester: {
      name: "VERA SALES BUENO",
      phone: "9 6396-9460",
      cpf: "097.275.638-80",
      address: "ARMANDO BAGNARA, Nº 742, Bairro: ZAIRA, JARDIM, Cidade: MAUÁ, UF: (SP), CEP 09320-670"
    },
    complaintAddress: {
      street: "JOÃO RAMALHO, AVENIDA",
      neighborhood: "JOÃO RAMALHO, VILA",
      number: "1779",
      reference: "Encontra-se um colchão na vaga de deficiente banco caixa econômica federal"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "07/07/2025 14:11", status: "Em Aberto" }
    ]
  },
  {
    id: "2",
    osNumber: "SSU 2025/5577",
    openDate: "06/07/2025 10:12",
    synthesis: "LAVAR RUA",
    requester: {
      name: "SECRETARIA DE SERVIÇOS URBANOS",
      phone: "4512-7786",
      address: "ANTONIA ROSA FIORAVANTI, Nº 1196, Bairro: ROSINA, Cidade: MAUÁ, UF: (SP)"
    },
    complaintAddress: {
      street: "SÃO PEDRO, RUA",
      neighborhood: "GUARANI, VILA",
      number: "ALTURA Nº 80"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "06/07/2025 10:12", status: "Em Aberto" }
    ]
  },
  {
    id: "3",
    osNumber: "SSU 2025/5609",
    openDate: "05/07/2025 09:45",
    synthesis: "CAPINAGEM DE RUA / CANTEIROS",
    requester: {
      name: "JOSÉ SILVA SANTOS",
      phone: "4521-3344",
      cpf: "123.456.789-00"
    },
    complaintAddress: {
      street: "RUA DAS FLORES",
      neighborhood: "ZAIRA, JARDIM",
      number: "234",
      reference: "Próximo ao mercado municipal"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "05/07/2025 09:45", status: "Em Aberto" }
    ]
  },
  {
    id: "4",
    osNumber: "SSU 2025/5629",
    openDate: "04/07/2025 11:20",
    synthesis: "CAPINAGEM DE RUA / CANTEIROS",
    requester: {
      name: "MARIA APARECIDA COSTA",
      phone: "9 8765-4321",
      cpf: "987.654.321-00"
    },
    complaintAddress: {
      street: "AVENIDA PRINCIPAL",
      neighborhood: "ESTRELA, JARDIM",
      number: "567"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "04/07/2025 11:20", status: "Em Aberto" }
    ]
  },
  {
    id: "5",
    osNumber: "SSU 2025/5672",
    openDate: "03/07/2025 15:33",
    synthesis: "LIMPEZA DE ÁREA PÚBLICA / PASSARELA",
    requester: {
      name: "CARLOS EDUARDO MENDES",
      phone: "9 1234-5678",
      cpf: "456.789.123-00"
    },
    complaintAddress: {
      street: "PASSARELA DO CENTRO",
      neighborhood: "NOÊMIA, VILA",
      number: "S/N",
      reference: "Passarela de acesso à estação"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "03/07/2025 15:33", status: "Em Aberto" }
    ]
  },
  {
    id: "6",
    osNumber: "SSU 2025/5680",
    openDate: "02/07/2025 08:22",
    synthesis: "PODA DE ÁRVORE",
    requester: {
      name: "ANTÔNIO CARLOS PEREIRA",
      phone: "9 9876-1234",
      cpf: "234.567.890-11"
    },
    complaintAddress: {
      street: "RUA SETE DE SETEMBRO",
      neighborhood: "FEITAL, JARDIM",
      number: "890",
      reference: "Em frente à escola municipal"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "02/07/2025 08:22", status: "Em Aberto" }
    ]
  },
  {
    id: "7",
    osNumber: "SSU 2025/5695",
    openDate: "01/07/2025 14:55",
    synthesis: "TAPA BURACO",
    requester: {
      name: "FERNANDA OLIVEIRA LIMA",
      phone: "9 5432-8765",
      cpf: "345.678.901-22"
    },
    complaintAddress: {
      street: "AVENIDA INDUSTRIAL",
      neighborhood: "SÔNIA MARIA, JARDIM",
      number: "1234",
      reference: "Próximo ao posto de gasolina"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "01/07/2025 14:55", status: "Em Aberto" }
    ]
  },
  {
    id: "8",
    osNumber: "SSU 2025/5710",
    openDate: "30/06/2025 16:40",
    synthesis: "LIMPEZA DE BUEIRO",
    requester: {
      name: "ROBERTO ALVES SOUZA",
      phone: "9 3456-7890",
      cpf: "567.890.123-33"
    },
    complaintAddress: {
      street: "RUA DOM PEDRO II",
      neighborhood: "CENTRO",
      number: "456",
      reference: "Esquina com Rua Barão de Mauá"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "30/06/2025 16:40", status: "Em Aberto" }
    ]
  },
  {
    id: "9",
    osNumber: "SSU 2025/5725",
    openDate: "29/06/2025 11:15",
    synthesis: "ROÇADA DE TERRENO",
    requester: {
      name: "PATRICIA MENDES SILVA",
      phone: "9 6789-0123",
      cpf: "678.901.234-44"
    },
    complaintAddress: {
      street: "RUA SANTA MARIA",
      neighborhood: "PRIMAVERA, PARQUE",
      number: "789",
      reference: "Terreno baldio ao lado do mercado"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "29/06/2025 11:15", status: "Em Aberto" }
    ]
  },
  {
    id: "10",
    osNumber: "SSU 2025/5740",
    openDate: "28/06/2025 09:30",
    synthesis: "RETIRADA DE ENTULHO",
    requester: {
      name: "LUIZ FERNANDO COSTA",
      phone: "9 7890-1234",
      cpf: "789.012.345-55"
    },
    complaintAddress: {
      street: "AVENIDA DOS TRABALHADORES",
      neighborhood: "ORATÓRIO, PARQUE",
      number: "321",
      reference: "Em frente ao supermercado"
    },
    status: "Em Aberto",
    statusHistory: [
      { date: "28/06/2025 09:30", status: "Em Aberto" }
    ]
  }
];