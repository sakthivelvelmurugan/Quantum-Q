import fs from 'fs';
import path from 'path';
import {
  IDatabase,
  DatabaseState,
  ServerFeedbackRecord,
  ChatSessionRecord,
  AuditLogRecord,
} from './types';
import {
  INITIAL_ORGANIZATIONS,
  DEMO_OWNERS,
  DEMO_HR_ADMINS,
  INITIAL_EMPLOYEES,
  TARGET_ROLES,
  INITIAL_GAP_ANALYSIS,
} from '../../src/data/mockData';
import {
  Organization,
  AuthAccount,
  EmployeeProfile,
  TargetRole,
  GapAnalysisResult,
  ChatMessage,
} from '../../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'quantum_db.json');

export class JsonFileDatabase implements IDatabase {
  readonly driverName = 'json_file_persistent';
  private state: DatabaseState | null = null;
  private isInitialized = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  async init(): Promise<void> {
    if (this.isInitialized && this.state) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        console.log(`[Database] Loaded persistent state from ${DB_FILE} (${this.state?.employees?.length || 0} employees)`);
      } else {
        console.log(`[Database] No existing database found at ${DB_FILE}. Initializing with seed dataset...`);
        this.state = this.buildInitialSeed();
        await this.persistImmediately();
        console.log(`[Database] Initial database persisted to ${DB_FILE}`);
      }
      this.isInitialized = true;
    } catch (err) {
      console.error(`[Database Error] Failed to initialize persistent JSON database:`, err);
      // Fallback in-memory
      this.state = this.buildInitialSeed();
      this.isInitialized = true;
    }
  }

  private buildInitialSeed(): DatabaseState {
    const allAccounts: AuthAccount[] = [...DEMO_OWNERS, ...DEMO_HR_ADMINS];

    // Seed initial feedback
    const seedFeedback: ServerFeedbackRecord[] = [
      {
        id: 'fb-init-01',
        messageId: 'msg-rec-01',
        employeeId: 'emp_aravind_01',
        employeeName: 'Aravind Swaminathan',
        type: 'positive',
        category: 'Accurate Career Match',
        rating: 5,
        comment: 'Targeting Staff Distributed Systems Architect was 100% on point based on my Kafka and Spring Boot contributions.',
        careerOutcome: 'Promoted to IC-6 Staff Architect nomination shortlist',
        submittedAt: '2026-09-12',
        appliedToContext: true,
      },
      {
        id: 'fb-init-02',
        messageId: 'msg-rec-02',
        employeeId: 'emp_janani_17',
        employeeName: 'Janani Ravichandran',
        type: 'positive',
        category: 'Helpful Learning Suggestion',
        rating: 5,
        comment: 'The recommendation to pair with Vignesh on pgvector embeddings helped me close my vector search gap within 3 weeks.',
        careerOutcome: 'Successfully delivered Vector RAG Microservice in Sprint 34',
        submittedAt: '2026-09-14',
        appliedToContext: true,
      },
      {
        id: 'fb-init-03',
        messageId: 'msg-rec-03',
        employeeId: 'emp_deepa_02',
        employeeName: 'Deepa Murugesan',
        type: 'positive',
        category: 'Skill Gap Clarity',
        rating: 4,
        comment: 'Highlighted the exact missing Zero-Trust mesh protocol requirements before our SOC-2 readiness audit.',
        careerOutcome: 'Certified in Istio Service Mesh Hardening',
        submittedAt: '2026-09-16',
        appliedToContext: true,
      },
    ];

    const initialGapAnalyses: Record<string, GapAnalysisResult[]> = {
      emp_aravind_01: [INITIAL_GAP_ANALYSIS],
    };

    return {
      organizations: INITIAL_ORGANIZATIONS,
      accounts: allAccounts,
      employees: INITIAL_EMPLOYEES,
      targetRoles: TARGET_ROLES,
      gapAnalyses: initialGapAnalyses,
      feedback: seedFeedback,
      chatSessions: {},
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          action: 'DATABASE_INITIALIZED',
          entityType: 'auth',
          entityId: 'SYSTEM',
          timestamp: new Date().toISOString(),
          metadata: { initialEmployees: INITIAL_EMPLOYEES.length },
        },
      ],
      meta: {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
        engine: 'Quantum-Q Persistent Storage Engine (JSON Store)',
      },
    };
  }

  private async persistImmediately(): Promise<void> {
    if (!this.state) return;
    try {
      this.state.meta.lastSaved = new Date().toISOString();
      const content = JSON.stringify(this.state, null, 2);
      const tempPath = `${DB_FILE}.tmp`;
      await fs.promises.writeFile(tempPath, content, 'utf-8');
      await fs.promises.rename(tempPath, DB_FILE);
    } catch (err) {
      console.error('[Database Error] Failed to write DB file:', err);
    }
  }

  private schedulePersist(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistImmediately().catch(console.error);
    }, 150);
  }

  private getState(): DatabaseState {
    if (!this.state) {
      this.state = this.buildInitialSeed();
    }
    return this.state;
  }

  async getStatus() {
    await this.init();
    const state = this.getState();
    return {
      driver: this.driverName,
      status: 'active_persistent',
      counts: {
        organizations: state.organizations.length,
        accounts: state.accounts.length,
        employees: state.employees.length,
        targetRoles: state.targetRoles.length,
        gapAnalyses: Object.keys(state.gapAnalyses).length,
        feedback: state.feedback.length,
        chatSessions: Object.keys(state.chatSessions).length,
        auditLogs: state.auditLogs.length,
      },
      storageLocation: DB_FILE,
      lastSaved: state.meta.lastSaved,
    };
  }

  async getOrganizations(): Promise<Organization[]> {
    await this.init();
    return this.getState().organizations;
  }

  async getOrganization(id: string): Promise<Organization | null> {
    await this.init();
    const found = this.getState().organizations.find((o) => o.id === id);
    return found || null;
  }

  async getAccounts(): Promise<AuthAccount[]> {
    await this.init();
    return this.getState().accounts;
  }

  async getAccountByEmail(email: string): Promise<AuthAccount | null> {
    await this.init();
    const found = this.getState().accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );
    return found || null;
  }

  async getEmployees(orgId?: string): Promise<EmployeeProfile[]> {
    await this.init();
    const list = this.getState().employees;
    if (orgId) {
      return list.filter((e) => e.orgId === orgId);
    }
    return list;
  }

  async getEmployee(id: string): Promise<EmployeeProfile | null> {
    await this.init();
    const found = this.getState().employees.find((e) => e.id === id);
    return found || null;
  }

  async saveEmployee(employee: EmployeeProfile): Promise<EmployeeProfile> {
    await this.init();
    const state = this.getState();
    const index = state.employees.findIndex((e) => e.id === employee.id);
    if (index >= 0) {
      state.employees[index] = { ...state.employees[index], ...employee };
    } else {
      state.employees.push(employee);
    }
    await this.logAudit('SAVE_EMPLOYEE', 'employee', employee.id, { name: employee.name });
    this.schedulePersist();
    return employee;
  }

  async patchEmployeeSkills(employeeId: string, skills: EmployeeProfile['skills']): Promise<EmployeeProfile | null> {
    await this.init();
    const state = this.getState();
    const emp = state.employees.find((e) => e.id === employeeId);
    if (!emp) return null;

    emp.skills = skills;
    await this.logAudit('UPDATE_SKILLS', 'skill', employeeId, { skillCount: skills.length });
    this.schedulePersist();
    return emp;
  }

  async getTargetRoles(): Promise<TargetRole[]> {
    await this.init();
    return this.getState().targetRoles;
  }

  async getTargetRole(id: string): Promise<TargetRole | null> {
    await this.init();
    const found = this.getState().targetRoles.find((r) => r.id === id);
    return found || null;
  }

  async saveTargetRole(role: TargetRole): Promise<TargetRole> {
    await this.init();
    const state = this.getState();
    const idx = state.targetRoles.findIndex((r) => r.id === role.id);
    if (idx >= 0) {
      state.targetRoles[idx] = role;
    } else {
      state.targetRoles.push(role);
    }
    await this.logAudit('SAVE_TARGET_ROLE', 'role', role.id, { title: role.title });
    this.schedulePersist();
    return role;
  }

  async getGapAnalyses(employeeId: string): Promise<GapAnalysisResult[]> {
    await this.init();
    return this.getState().gapAnalyses[employeeId] || [];
  }

  async saveGapAnalysis(employeeId: string, analysis: GapAnalysisResult): Promise<void> {
    await this.init();
    const state = this.getState();
    if (!state.gapAnalyses[employeeId]) {
      state.gapAnalyses[employeeId] = [];
    }
    // Prepend latest analysis
    state.gapAnalyses[employeeId] = [analysis, ...state.gapAnalyses[employeeId].slice(0, 9)];
    await this.logAudit('COMPUTE_GAP_ANALYSIS', 'gap_analysis', employeeId, {
      roleId: analysis.targetRoleId,
      matchScore: analysis.matchScore,
    });
    this.schedulePersist();
  }

  async getFeedback(tenantId?: string): Promise<ServerFeedbackRecord[]> {
    await this.init();
    return this.getState().feedback;
  }

  async saveFeedback(record: ServerFeedbackRecord): Promise<ServerFeedbackRecord> {
    await this.init();
    const state = this.getState();
    state.feedback.unshift(record);
    this.schedulePersist();
    return record;
  }

  async getChatSession(sessionId: string): Promise<ChatSessionRecord | null> {
    await this.init();
    return this.getState().chatSessions[sessionId] || null;
  }

  async saveChatMessage(sessionId: string, employeeId: string, message: ChatMessage): Promise<void> {
    await this.init();
    const state = this.getState();
    if (!state.chatSessions[sessionId]) {
      state.chatSessions[sessionId] = {
        sessionId,
        employeeId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
    }
    state.chatSessions[sessionId].messages.push(message);
    state.chatSessions[sessionId].updatedAt = new Date().toISOString();
    this.schedulePersist();
  }

  async logAudit(action: string, entityType: AuditLogRecord['entityType'], entityId: string, metadata?: Record<string, any>): Promise<void> {
    const state = this.getState();
    state.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      metadata,
    });
    // Keep last 200 logs
    if (state.auditLogs.length > 200) {
      state.auditLogs = state.auditLogs.slice(0, 200);
    }
  }

  async getAuditLogs(limit = 50): Promise<AuditLogRecord[]> {
    await this.init();
    return this.getState().auditLogs.slice(0, limit);
  }

  async exportFullState(): Promise<DatabaseState> {
    await this.init();
    return this.getState();
  }

  async resetToInitialSeed(): Promise<void> {
    this.state = this.buildInitialSeed();
    await this.persistImmediately();
    console.log('[Database] Reset database to pristine initial seed state.');
  }
}
