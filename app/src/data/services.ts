import type { ServiceRequest, ServiceRequestStatus, ServiceType } from '../types';

function seededRandom(seed: number): number {
  return Math.abs(Math.sin(seed) * 10000) % 1;
}

const serviceItems: { type: ServiceType; title: string; professional: string }[] = [
  { type: 'juridico', title: 'Revisão de contrato social', professional: 'Dr. Marcos Almeida' },
  { type: 'contabil', title: 'Declaração de imposto MEI', professional: 'Contadora Ana Beatriz' },
  { type: 'juridico', title: 'Consultoria sobre LGPD', professional: 'Dra. Carla Vieira' },
  { type: 'contabil', title: 'Abertura de CNPJ', professional: 'Contador Ricardo Lopes' },
  { type: 'juridico', title: 'Registro de marca', professional: 'Dr. Marcos Almeida' },
  { type: 'contabil', title: 'Planejamento tributário', professional: 'Contadora Ana Beatriz' },
  { type: 'juridico', title: 'Contrato de prestação de serviços', professional: 'Dra. Carla Vieira' },
  { type: 'contabil', title: 'Balanço patrimonial anual', professional: 'Contador Ricardo Lopes' },
  { type: 'juridico', title: 'Consulta sobre direito do consumidor', professional: 'Dr. Marcos Almeida' },
  { type: 'contabil', title: 'Emissão de nota fiscal', professional: 'Contadora Ana Beatriz' },
  { type: 'juridico', title: 'Análise de contrato com fornecedor', professional: 'Dra. Carla Vieira' },
  { type: 'contabil', title: 'Regularização fiscal', professional: 'Contador Ricardo Lopes' },
  { type: 'juridico', title: 'Defesa em processo de consumidor', professional: 'Dr. Marcos Almeida' },
  { type: 'contabil', title: 'Consultoria para troca de regime tributário', professional: 'Contadora Ana Beatriz' },
  { type: 'juridico', title: 'Elaboração de termos de uso', professional: 'Dra. Carla Vieira' },
];

const associados = [
  { id: 'assoc-003', name: 'Carlos Mendes' },
  { id: 'assoc-005', name: 'Juliana Costa' },
  { id: 'assoc-007', name: 'Fernanda Souza' },
  { id: 'assoc-008', name: 'Ricardo Alves' },
  { id: 'assoc-010', name: 'Bruno Rocha' },
  { id: 'assoc-012', name: 'Tatiana Martins' },
  { id: 'assoc-015', name: 'Eduardo Nascimento' },
  { id: 'assoc-018', name: 'Patrícia Gomes' },
];

const statuses: ServiceRequestStatus[] = ['aberto', 'em-andamento', 'concluido', 'cancelado'];

export const serviceRequests: ServiceRequest[] = serviceItems.map((s, i) => {
  const seed = i + 1;
  const dayOffset = Math.floor(seededRandom(seed * 3) * 60);
  const date = new Date(2025, 4, 1);
  date.setDate(date.getDate() + dayOffset);
  const assoc = associados[i % associados.length];
  const statusIdx = Math.floor(seededRandom(seed * 7) * 4);
  const status = statuses[statusIdx];

  return {
    id: `srv-${String(i + 1).padStart(3, '0')}`,
    type: s.type,
    title: s.title,
    description: `Solicitação de ${s.type === 'juridico' ? 'serviço jurídico' : 'serviço contábil'}: ${s.title}`,
    associadoId: assoc.id,
    associadoName: assoc.name,
    professionalName: s.professional,
    status,
    scheduledAt: status === 'em-andamento' || status === 'concluido' ? new Date(date.getTime() + 86400000 * 3).toISOString() : null,
    documents: seededRandom(seed * 11) > 0.5 ? ['documento.pdf', 'anexo.pdf'] : [],
    rating: status === 'concluido' ? Math.floor(seededRandom(seed * 13) * 3) + 3 : null,
    createdAt: date.toISOString(),
  };
});
