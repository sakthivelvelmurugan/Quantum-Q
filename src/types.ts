export type UserRole = 'OWNER' | 'HR_ADMIN' | 'EMPLOYEE';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  slug: string;
  region: 'us-east' | 'eu-central' | 'ap-south' | 'ap-southeast';
  employeeCount: number;
  industry: string;
  parentPlatform: string; // 'QuantumQ Supreme Platform'
}

export interface AuthAccount {
  id: string;
  orgId: string;
  orgName: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  title: string;
  department: string;
  avatarUrl: string;
  employeeProfileId?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Technical' | 'Architecture' | 'Data & AI' | 'Domain' | 'Leadership';
  type: 'explicit' | 'inferred' | 'transferable';
  confidence: number; // 0-100
  source: 'GitHub' | 'LinkedIn' | 'Slack' | 'LMS' | 'Jira' | 'Peer Endorsement';
  yearsExperience?: number;
  lastActive: string;
  verificationEvidence: string;
}

export interface ProjectExperience {
  id: string;
  name: string;
  role: string;
  duration: string;
  description: string;
  extractedSkills: string[];
  impactMetric: string;
}

export interface WorkHistoryMilestone {
  id: string;
  title: string;
  companyOrTeam: string;
  period: string;
  keyContributions: string[];
}

export interface LearningActivityItem {
  id: string;
  title: string;
  provider: string;
  completedDate: string;
  status: 'completed' | 'in-progress';
  credentialUrl?: string;
}

export interface EmployeeProfile {
  id: string;
  orgId: string;
  name: string;
  email: string;
  avatarUrl: string;
  currentRole: string;
  department: string;
  location: string;
  hireDate: string;
  bio: string;
  skills: SkillItem[];
  projects?: ProjectExperience[];
  workHistory?: WorkHistoryMilestone[];
  learningActivities?: LearningActivityItem[];
  strengthsSummary?: {
    topDomain: string;
    leadershipPotential: string;
    futureReadinessScore: number;
    futureReadinessRole: string;
    keyAchievements: string[];
  };
  connectedAccounts: {
    github: { connected: boolean; username?: string; lastSync?: string; reposAnalyzed?: number };
    linkedin: { connected: boolean; username?: string; lastSync?: string; verifiedSkills?: number };
    slack: { connected: boolean; channels?: number; messagesAnalyzed?: number; lastSync?: string };
    lms: { connected: boolean; coursesCompleted?: number; certsCount?: number; lastSync?: string };
  };
}

export interface TargetRole {
  id: string;
  title: string;
  department: string;
  level: string;
  openings: number;
  summary: string;
  requiredSkills: {
    name: string;
    minimumConfidence: number;
    importance: 'Must-Have' | 'Important' | 'Nice-to-Have';
  }[];
}

export interface GapAnalysisResult {
  targetRoleId: string;
  targetRoleTitle: string;
  matchScore: number; // 0-100
  matchedSkills: { name: string; employeeConfidence: number; requiredConfidence: number }[];
  partiallyMatchingSkills: { name: string; employeeConfidence: number; requiredConfidence: number; gapPoints: number }[];
  missingSkills: { name: string; requiredConfidence: number; importance: string }[];
  recommendedCourses: {
    id: string;
    title: string;
    provider: 'Coursera' | 'Udemy' | 'Internal LMS' | 'DeepLearning.AI';
    duration: string;
    rating: number;
    skillTarget: string;
    url: string;
  }[];
  roadmapPhases: {
    phase: string;
    timeframe: string;
    focus: string;
    milestones: string[];
  }[];
}

export interface CandidateMatch {
  employee: EmployeeProfile;
  matchScore: number;
  fitTier: 'Strong Fit' | 'Moderate Fit' | 'Potential Match';
  matchedSkillsCount: number;
  totalRequired: number;
  explainableReason: string;
  keyStrengths: string[];
  growthOpportunities: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  isThinking?: boolean;
}

export interface CodeFile {
  path: string;
  name: string;
  service: string;
  description: string;
  language: 'java' | 'yaml' | 'xml' | 'sql' | 'dockerfile';
  code: string;
}

// ---------------------------------------------------------------------------
// FIT TIER SHARED CONSTANTS & THRESHOLDS (REQ-2.4)
// ---------------------------------------------------------------------------
export const FIT_TIER_THRESHOLDS = {
  STRONG_FIT_MIN: 78,
  MODERATE_FIT_MIN: 58,
} as const;

export type FitTier = 'Strong Fit' | 'Moderate Fit' | 'Potential Match';

export function getFitTier(score: number): FitTier {
  if (score >= FIT_TIER_THRESHOLDS.STRONG_FIT_MIN) return 'Strong Fit';
  if (score >= FIT_TIER_THRESHOLDS.MODERATE_FIT_MIN) return 'Moderate Fit';
  return 'Potential Match';
}

// ---------------------------------------------------------------------------
// CONTINUOUSLY EVOLVING SKILL PROFILE DIFF PATCH (REQ-1.5)
// ---------------------------------------------------------------------------
export interface SkillDiffPatch {
  addedSkills?: SkillItem[];
  updatedSkills?: Partial<SkillItem>[];
  strengthsSummaryPatch?: Partial<NonNullable<EmployeeProfile['strengthsSummary']>>;
  telemetrySource?: 'GitHub' | 'Slack' | 'LMS' | 'AI Deep Scan';
  telemetryMetadata?: {
    commitIds?: string[];
    prNumbers?: number[];
    slackChannels?: string[];
    lmsCourses?: string[];
  };
}

export function diffPatchProfile(existing: EmployeeProfile, patch: SkillDiffPatch): EmployeeProfile {
  const currentSkills = [...existing.skills];

  // Apply updates to existing skills
  if (patch.updatedSkills) {
    for (const update of patch.updatedSkills) {
      if (!update.name && !update.id) continue;
      const idx = currentSkills.findIndex(
        (s) => (update.id && s.id === update.id) || (update.name && s.name.toLowerCase() === update.name.toLowerCase())
      );
      if (idx !== -1) {
        currentSkills[idx] = {
          ...currentSkills[idx],
          ...update,
          confidence: update.confidence !== undefined ? Math.max(0, Math.min(100, update.confidence)) : currentSkills[idx].confidence,
          lastActive: update.lastActive || 'Just now (Synced)',
          verificationEvidence: update.verificationEvidence
            ? `${currentSkills[idx].verificationEvidence} • [Update]: ${update.verificationEvidence}`
            : currentSkills[idx].verificationEvidence,
        };
      }
    }
  }

  // Add new skills (or merge if duplicate by name)
  if (patch.addedSkills) {
    for (const added of patch.addedSkills) {
      const existingIdx = currentSkills.findIndex(
        (s) => s.name.toLowerCase() === added.name.toLowerCase()
      );
      if (existingIdx !== -1) {
        currentSkills[existingIdx] = {
          ...currentSkills[existingIdx],
          confidence: Math.max(currentSkills[existingIdx].confidence, added.confidence),
          verificationEvidence: `${currentSkills[existingIdx].verificationEvidence} • [Evidence]: ${added.verificationEvidence}`,
          lastActive: 'Just now (Synced)',
        };
      } else {
        currentSkills.push({
          ...added,
          confidence: Math.max(0, Math.min(100, added.confidence)),
        });
      }
    }
  }

  return {
    ...existing,
    skills: currentSkills,
    strengthsSummary: patch.strengthsSummaryPatch
      ? {
          topDomain: patch.strengthsSummaryPatch.topDomain || existing.strengthsSummary?.topDomain || 'Distributed Systems Architecture',
          leadershipPotential: patch.strengthsSummaryPatch.leadershipPotential || existing.strengthsSummary?.leadershipPotential || 'High',
          futureReadinessScore: patch.strengthsSummaryPatch.futureReadinessScore ?? existing.strengthsSummary?.futureReadinessScore ?? 85,
          futureReadinessRole: patch.strengthsSummaryPatch.futureReadinessRole || existing.strengthsSummary?.futureReadinessRole || 'Staff Architect',
          keyAchievements: patch.strengthsSummaryPatch.keyAchievements || existing.strengthsSummary?.keyAchievements || [],
        }
      : existing.strengthsSummary,
  };
}

// ---------------------------------------------------------------------------
// STRUCTURED CAREER FEEDBACK & RL STORE (REQ-4.4 & REQ-4.5)
// ---------------------------------------------------------------------------
export interface CareerOutcomeFeedback {
  id?: string;
  messageId: string;
  employeeId: string;
  employeeName?: string;
  type: 'positive' | 'negative';
  category: string;
  rating: number; // 1-5 stars
  comment: string;
  careerOutcome?: string; // e.g. "Promoted to IC-6", "Completed Neo4j certification"
  submittedAt: string;
  appliedToContext?: boolean;
}

