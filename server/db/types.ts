import { Organization, AuthAccount, EmployeeProfile, TargetRole, GapAnalysisResult, ChatMessage } from '../../src/types';

export interface ServerFeedbackRecord {
  id: string;
  messageId: string;
  employeeId: string;
  employeeName?: string;
  type: 'positive' | 'negative';
  category: string;
  rating: number;
  comment: string;
  careerOutcome?: string;
  submittedAt: string;
  appliedToContext: boolean;
}

export interface ChatSessionRecord {
  sessionId: string;
  employeeId: string;
  targetRoleId?: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entityType: 'employee' | 'skill' | 'role' | 'gap_analysis' | 'auth';
  entityId: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DatabaseState {
  organizations: Organization[];
  accounts: AuthAccount[];
  employees: EmployeeProfile[];
  targetRoles: TargetRole[];
  gapAnalyses: Record<string, GapAnalysisResult[]>; // employeeId -> gap analysis results
  feedback: ServerFeedbackRecord[];
  chatSessions: Record<string, ChatSessionRecord>; // sessionId -> chat session
  auditLogs: AuditLogRecord[];
  meta: {
    version: string;
    lastSaved: string;
    engine: string;
  };
}

export interface IDatabase {
  readonly driverName: string;
  init(): Promise<void>;
  getStatus(): Promise<{
    driver: string;
    status: string;
    counts: {
      organizations: number;
      accounts: number;
      employees: number;
      targetRoles: number;
      gapAnalyses: number;
      feedback: number;
      chatSessions: number;
      auditLogs: number;
    };
    storageLocation?: string;
    lastSaved?: string;
  }>;

  // Organizations
  getOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | null>;

  // Accounts
  getAccounts(): Promise<AuthAccount[]>;
  getAccountByEmail(email: string): Promise<AuthAccount | null>;

  // Employees
  getEmployees(orgId?: string): Promise<EmployeeProfile[]>;
  getEmployee(id: string): Promise<EmployeeProfile | null>;
  saveEmployee(employee: EmployeeProfile): Promise<EmployeeProfile>;
  patchEmployeeSkills(employeeId: string, skills: EmployeeProfile['skills']): Promise<EmployeeProfile | null>;

  // Target Roles
  getTargetRoles(): Promise<TargetRole[]>;
  getTargetRole(id: string): Promise<TargetRole | null>;
  saveTargetRole(role: TargetRole): Promise<TargetRole>;

  // Gap Analyses
  getGapAnalyses(employeeId: string): Promise<GapAnalysisResult[]>;
  saveGapAnalysis(employeeId: string, analysis: GapAnalysisResult): Promise<void>;

  // Feedback
  getFeedback(tenantId?: string): Promise<ServerFeedbackRecord[]>;
  saveFeedback(record: ServerFeedbackRecord): Promise<ServerFeedbackRecord>;

  // Chat
  getChatSession(sessionId: string): Promise<ChatSessionRecord | null>;
  saveChatMessage(sessionId: string, employeeId: string, message: ChatMessage): Promise<void>;

  // Audit Logs
  logAudit(action: string, entityType: AuditLogRecord['entityType'], entityId: string, metadata?: Record<string, any>): Promise<void>;
  getAuditLogs(limit?: number): Promise<AuditLogRecord[]>;

  // Export / Reset
  exportFullState(): Promise<DatabaseState>;
  resetToInitialSeed(): Promise<void>;
}
