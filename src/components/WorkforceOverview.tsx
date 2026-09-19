import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Briefcase, 
  ArrowUpRight, 
  Layers, 
  Building2,
  Calendar,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Organization, EmployeeProfile } from '../types';

interface WorkforceOverviewProps {
  currentOrg: Organization;
  employees: EmployeeProfile[];
  onNavigateToProfiles: () => void;
  onNavigateToMatching: () => void;
  onNavigateToGaps: () => void;
}

export const WorkforceOverview: React.FC<WorkforceOverviewProps> = ({
  currentOrg,
  employees,
  onNavigateToProfiles,
  onNavigateToMatching,
  onNavigateToGaps,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Key workforce stats
  const totalVerifiedSkills = employees.reduce((acc, emp) => acc + emp.skills.length, 0);
  const inferredSkillsCount = employees.reduce(
    (acc, emp) => acc + emp.skills.filter((s) => s.type === 'inferred').length,
    0
  );
  const explicitSkillsCount = employees.reduce(
    (acc, emp) => acc + emp.skills.filter((s) => s.type === 'explicit').length,
    0
  );
  const transferableCount = employees.reduce(
    (acc, emp) => acc + emp.skills.filter((s) => s.type === 'transferable').length,
    0
  );

  const departments = [
    {
      name: 'Core Infrastructure & Platform',
      headcount: 42,
      skillsIdentified: 248,
      readinessIndex: '88%',
      topGap: 'Zero-Trust Istio Mesh',
      internalMobilityPipeline: '4 candidates',
    },
    {
      name: 'AI Intelligence & Search',
      headcount: 28,
      skillsIdentified: 194,
      readinessIndex: '94%',
      topGap: 'GPU Cluster Orchestration',
      internalMobilityPipeline: '6 candidates',
    },
    {
      name: 'Architecture Review Board',
      headcount: 14,
      skillsIdentified: 120,
      readinessIndex: '91%',
      topGap: 'eBPF Kernel Profiling',
      internalMobilityPipeline: '2 candidates',
    },
    {
      name: 'Cloud Operations & SRE',
      headcount: 36,
      skillsIdentified: 210,
      readinessIndex: '83%',
      topGap: 'Distributed OpenTelemetry',
      internalMobilityPipeline: '3 candidates',
    },
  ];

  const emergingSkillDemands = [
    {
      skill: 'Neo4j & Graph Data Modelling',
      category: 'Data & Architecture',
      orgDemand: 'High (3 active openings)',
      currentSupply: '2 verified engineers',
      gapSeverity: 'Critical',
      action: 'LMS Coursera Cohort Provisioned',
    },
    {
      skill: 'Zero-Trust Network & Service Mesh',
      category: 'Security Architecture',
      orgDemand: 'High (Q4 Compliance Mandate)',
      currentSupply: '4 engineers (2 partially trained)',
      gapSeverity: 'Moderate',
      action: 'Targeted Internal Apprenticeship',
    },
    {
      skill: 'eBPF Kernel Profiling & Cilium',
      category: 'Systems & Infrastructure',
      orgDemand: 'Moderate (Next-Gen Observability)',
      currentSupply: '1 engineer',
      gapSeverity: 'Emerging',
      action: 'LMS Self-Paced Module Enrolled',
    },
    {
      skill: 'pgvector & Dense Vector Embeddings',
      category: 'AI & Data Infrastructure',
      orgDemand: 'High (Talent & Product Search)',
      currentSupply: '3 verified engineers',
      gapSeverity: 'Stable',
      action: 'Knowledge Sharing Guild Active',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1D4ED8] border border-blue-200">
                Tenant: {currentOrg.name}
              </span>
              <span className="text-xs text-[color:var(--color-text-muted)] font-mono">Region: {currentOrg.region}</span>
            </div>
            <h2 className="text-xl font-bold text-[color:var(--color-text-primary)] tracking-tight mt-1.5">
              Workforce Skills & Talent Availability Dashboard
            </h2>
            <p className="text-xs text-[color:var(--color-text-secondary)] mt-1 max-w-2xl">
              Real-time talent intelligence analyzing employee experience, multi-source signals (GitHub, Slack, LMS, LinkedIn), discovering hidden competencies, and tracking organization-wide skill health.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onNavigateToMatching}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors flex items-center space-x-2 shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Review Internal Role Matching</span>
            </button>
          </div>
        </div>

        {/* 4 Core Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E2E8F0]">
          <div className="bg-[#F8FAFF] p-4 rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] font-medium text-[color:var(--color-text-secondary)] uppercase tracking-wider">
              Total Cataloged Skills
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-[color:var(--color-text-primary)]">{totalVerifiedSkills}</span>
              <span className="text-xs font-medium text-emerald-800">+12% this month</span>
            </div>
            <p className="text-[11px] text-[color:var(--color-text-secondary)] mt-1">
              Across {employees.length} indexed sample engineering profiles
            </p>
          </div>

          <div className="bg-[#F8FAFF] p-4 rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] font-medium text-[color:var(--color-text-secondary)] uppercase tracking-wider">
              Discovered Hidden Skills
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-[#1D4ED8]">{inferredSkillsCount}</span>
              <span className="text-xs font-medium text-[color:var(--color-text-secondary)]">Inferred via Slack & Git</span>
            </div>
            <p className="text-[11px] text-[color:var(--color-text-secondary)] mt-1">
              {Math.round((inferredSkillsCount / totalVerifiedSkills) * 100)}% of total skill graph discovered beyond resumes
            </p>
          </div>

          <div className="bg-[#F8FAFF] p-4 rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] font-medium text-[color:var(--color-text-secondary)] uppercase tracking-wider">
              Internal Mobility Readiness
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-[color:var(--color-text-primary)]">82.4%</span>
              <span className="text-xs font-medium text-emerald-800">High Match</span>
            </div>
            <p className="text-[11px] text-[color:var(--color-text-secondary)] mt-1">
              Average readiness score for IC-6 & IC-7 open requisitions
            </p>
          </div>

          <div className="bg-[#F8FAFF] p-4 rounded-lg border border-[#E2E8F0]">
            <p className="text-[11px] font-medium text-[color:var(--color-text-secondary)] uppercase tracking-wider">
              Transferable Capabilities
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-[color:var(--color-text-primary)]">{transferableCount}</span>
              <span className="text-xs font-medium text-[color:var(--color-text-secondary)]">Leadership & RFC</span>
            </div>
            <p className="text-[11px] text-[color:var(--color-text-secondary)] mt-1">
              Mentorship, Incident Command & Architecture RFC signals
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Department Readiness Table & Emerging Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Readiness Table (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[color:var(--color-text-primary)]">
                Department Talent Bench & Readiness Matrix
              </h3>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                Continuous capability tracking across organizational business units
              </p>
            </div>
            <button
              onClick={onNavigateToProfiles}
              className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] flex items-center space-x-1"
            >
              <span>View Employee Profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--color-burgundy-850)] border-b border-[#E2E8F0] text-[color:var(--color-text-secondary)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-3 font-semibold">Headcount</th>
                  <th className="py-3 px-3 font-semibold">Readiness</th>
                  <th className="py-3 px-4 font-semibold">Top Skill Gap</th>
                  <th className="py-3 px-3 font-semibold">Mobility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[color:var(--color-text-secondary)]">
                {departments.map((dept, idx) => (
                  <tr key={idx} className="hover:bg-[var(--color-burgundy-850)]/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-[color:var(--color-text-primary)]">
                      {dept.name}
                    </td>
                    <td className="py-3 px-3 text-[color:var(--color-text-secondary)] font-mono">
                      {dept.headcount}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {dept.readinessIndex}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[color:var(--color-text-secondary)]">
                      {dept.topGap}
                    </td>
                    <td className="py-3 px-3 text-[color:var(--color-text-secondary)]">
                      {dept.internalMobilityPipeline}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Emerging Critical Skill Gaps (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[color:var(--color-text-primary)]">
                Emerging Organizational Skill Gaps
              </h3>
              <p className="text-xs text-[color:var(--color-text-muted)]">
                Predicted deficits based on upcoming technical initiatives
              </p>
            </div>
            <button
              onClick={onNavigateToGaps}
              className="text-xs font-semibold text-[#1D4ED8] hover:text-[#1E40AF] flex items-center space-x-1"
            >
              <span>Gap Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 divide-y divide-[#E2E8F0]">
            {emergingSkillDemands.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[color:var(--color-text-primary)] text-xs">{item.skill}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                      item.gapSeverity === 'Critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.gapSeverity === 'Moderate'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : item.gapSeverity === 'Emerging'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.gapSeverity} Deficit
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[color:var(--color-text-muted)] mt-1">
                  <span>Demand: {item.orgDemand}</span>
                  <span className="font-mono">Supply: {item.currentSupply}</span>
                </div>

                <div className="mt-1.5 flex items-center space-x-1 text-[11px] text-[#1D4ED8] font-medium">
                  <CheckCircle2 className="w-3 h-3 text-[#1D4ED8]" />
                  <span>Action: {item.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
