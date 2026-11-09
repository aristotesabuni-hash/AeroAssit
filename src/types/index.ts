export type UserRole = 'passenger' | 'agent' | 'technician' | 'admin';

export type Language = 'fr' | 'en' | 'sw';

export interface ApprovedDocument {
  id: string;
  title: string;
  category: 'bagages' | 'enregistrement' | 'surete' | 'embarquement' | 'accessibilite' | 'formalites';
  summary: string;
  fullContent: string;
  version: string;
  validatedAt: string;
  validatedBy: string;
  sourceAuthority: string;
  tags: string[];
  flaggedForReview?: boolean;
  flagReason?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  sources?: string[];
  isUnconfirmed?: boolean;
  warningNote?: string;
  language?: Language;
  injectionDetected?: boolean;
}

export interface NetworkEquipment {
  id: string;
  hostname: string;
  vlan: number;
  vlanName: string;
  ip: string;
  mac: string;
  role: string;
  services: string[];
  status: 'nominal' | 'warning' | 'critical' | 'offline';
  lastPingMs?: number;
  openPorts: number[];
  dnsResolves: boolean;
  httpStatus?: number;
  isSimulatedFailure?: boolean;
}

export interface VlanDefinition {
  id: number;
  name: string;
  subnet: string;
  gateway: string;
  description: string;
  equipmentCount: number;
}

export interface ProbeResult {
  id: string;
  timestamp: string;
  targetIp: string;
  targetHostname?: string;
  tool: 'ping' | 'tcp' | 'dns' | 'http' | 'logs';
  port?: number;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  latencyMs?: number;
  output: string;
  whitelisted: boolean;
  reason?: string;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  equipmentId: string;
  hostname: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  acknowledged: boolean;
  resolved: boolean;
  recommendedAction: string;
}

export interface DiagnosticSession {
  targetEquipmentId: string;
  startedAt: string;
  toolCallsCount: number;
  maxToolCalls: number;
  steps: {
    tool: string;
    target: string;
    result: string;
    timestamp: string;
  }[];
  verdict?: string;
  humanActionRequired?: string;
}
