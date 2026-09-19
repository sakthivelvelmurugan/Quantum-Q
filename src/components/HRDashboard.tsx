import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  ArrowRight, 
  Bot, 
  Sparkles,
  BarChart3,
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AuthAccount, Organization, EmployeeProfile } from '../types';
import { colors, radius, shadows, glows } from '../design-system/tokens';
import { Card, MetricCard, Badge, Button, Input, ProgressBar } from '../design-system';

interface HRDashboardProps {
  currentUser: AuthAccount;
  currentOrg: Organization;
  employees: EmployeeProfile[];
  onSelectEmployee: (emp: EmployeeProfile) => void;
  onNavigateToMatching: () => void;
  onOpenAtomWithPrompt: (prompt: string) => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({
  currentUser,
  currentOrg,
  employees,
  onSelectEmployee,
  onNavigateToMatching,
  onOpenAtomWithPrompt,
}) => {
  const [activeView, setActiveView] = useState<'directory' | 'skill-audit'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    try {
      const res = await fetch('/api/ai/workforce-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: employees.map((e) => ({
            name: e.name,
            currentRole: e.currentRole,
            department: e.department,
            skills: e.skills.map((s) => ({ skill: s.name, confidence: s.confidence, category: s.category })),
          })),
          openRoles: [
            { title: 'Staff Distributed Systems Architect', department: 'Core Infrastructure & Platform' },
            { title: 'Principal Data Engineer', department: 'AI Intelligence & Search' },
            { title: 'Lead Security Architect', department: 'Information Security & Compliance' },
          ],
        }),
      });

      if (!res.ok) throw new Error('Failed to generate workforce insights');
      const data = await res.json();
      setAiInsights(data.insights);
    } catch (err: any) {
      console.error('Workforce insights error:', err);
      setInsightsError('AI analysis unavailable. Retry?');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const departments = [
    'all',
    'Core Infrastructure & Platform',
    'AI Intelligence & Search',
    'Cloud Operations & Resiliency',
    'Distributed Streaming & Ingestion',
    'Design Systems & Web Experience',
    'Information Security & Compliance',
  ];

  const locations = ['all', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'all' || emp.department === selectedDept;
    const matchesLoc = selectedLocation === 'all' || emp.location.includes(selectedLocation);
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDept && matchesLoc && matchesSearch;
  });

  const skillCoverageData = [
    { name: 'Java 17 & Spring Boot 3', count: 18, coverage: 90, status: 'Healthy Supply', category: 'Backend' },
    { name: 'Apache Kafka & Event Streaming', count: 14, coverage: 70, status: 'Healthy Supply', category: 'Streaming' },
    { name: 'PostgreSQL & Query Optimization', count: 16, coverage: 80, status: 'Healthy Supply', category: 'Database' },
    { name: 'PyTorch & Vector Embeddings', count: 9, coverage: 45, status: 'Moderate Supply', category: 'AI & Data' },
    { name: 'Zero-Trust Network & Service Mesh', count: 6, coverage: 30, status: 'Emerging Deficit', category: 'Security' },
    { name: 'Neo4j & Graph Data Modelling', count: 3, coverage: 15, status: 'Critical Deficit', category: 'Database' },
    { name: 'eBPF Kernel Tracing & Cilium', count: 2, coverage: 10, status: 'Critical Deficit', category: 'Platform' },
  ];

  const criticalDeficitAlerts = [
    {
      skill: 'Neo4j & Graph Data Modelling',
      department: 'Core Infrastructure & Platform',
      currentTrained: 3,
      requiredHeadcount: 10,
      riskImpact: 'Impacting Quantum-Q migration and multi-tenant entity resolution services.',
      remediationPlan: 'Sponsored LMS Cohort 1 starting next Monday; pairing 5 senior backend leads with Dinesh Kumar Velusamy.',
    },
    {
      skill: 'Zero-Trust Network & Istio Service Mesh',
      department: 'Cloud Operations & Information Security',
      currentTrained: 6,
      requiredHeadcount: 14,
      riskImpact: 'Prerequisite for SOC-2 Type II audit on Chennai and Coimbatore microservices.',
      remediationPlan: 'Cross-functional guild workshops led by Balaji Parthasarathy.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner Card */}
      <Card padding="lg" className="relative overflow-hidden border-[#641A2D]">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C94B6A 0%, #800F2F 70%, transparent 100%)' }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="burgundy" prefixIcon={<Users className="w-3 h-3 mr-1" />}>
                People Operations Suite • {currentOrg.name}
              </Badge>
              <Badge variant="outline">
                Tenant: {currentOrg.id}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mt-3" style={{ color: colors.textPrimary }}>
              Workforce Talent Intelligence & Internal Mobility
            </h1>
            <p className="text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: colors.textSecondary }}>
              Logged in as {currentUser.name} ({currentUser.title}). Manage 20 indexed tech leads across Tamil Nadu innovation centers, evaluate role matching requisitions, and audit organizational skill supply.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <Button
              variant="primary"
              onClick={onNavigateToMatching}
              className="space-x-1.5"
            >
              <span>Match Open Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                onOpenAtomWithPrompt(
                  `As People Operations Admin for ${currentOrg.name}, provide an executive audit of our critical skill deficits in Neo4j and Zero-Trust Istio mesh across our 20 engineering leads.`
                )
              }
              className="space-x-1.5"
            >
              <Bot className="w-3.5 h-3.5 text-[#C43A58]" />
              <span>Ask Atom AI</span>
            </Button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#641A2D]">
          <MetricCard
            label="Directory Indexed"
            value="20 Tech Leads"
            subtext="100% Tamil engineering profiles"
            accent="burgundy"
          />
          <MetricCard
            label="Open Requisitions"
            value="6 Openings"
            subtext="IC-6, IC-7 & M-1 tiers"
            accent="burgundy"
          />
          <MetricCard
            label="High Fit Matches"
            value="8 Candidates"
            subtext="Match score >= 80%"
            accent="success"
          />
          <MetricCard
            label="Critical Deficits"
            value="2 Areas"
            subtext="Neo4j & Zero-Trust Mesh"
            accent="warning"
          />
        </div>
      </Card>

      {/* Main Tabs Container */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: colors.burgundy800,
          borderColor: colors.burgundy600,
          boxShadow: shadows.card,
        }}
      >
        {/* Sub-Navigation Tabs */}
        <div className="flex items-center border-b border-[#641A2D] bg-[#1A080D]/80 px-4">
          <button
            onClick={() => setActiveView('directory')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeView === 'directory'
                ? 'border-[#C94B6A] text-[#FFF5F7] bg-[#310D17]/50'
                : 'border-transparent text-[#C9A8B0] hover:text-[#FFF5F7]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#C43A58]" />
            <span>Employee Directory ({filteredEmployees.length})</span>
          </button>

          <button
            onClick={() => setActiveView('skill-audit')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeView === 'skill-audit'
                ? 'border-[#C94B6A] text-[#FFF5F7] bg-[#310D17]/50'
                : 'border-transparent text-[#C9A8B0] hover:text-[#FFF5F7]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#C43A58]" />
            <span>AI Workforce Skills Audit & Deficit Heatmap</span>
          </button>
        </div>

        {/* VIEW 1: DIRECTORY TABLE */}
        {activeView === 'directory' && (
          <div>
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-[#641A2D] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1A080D]/40">
              <div className="flex items-center space-x-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#795C65]" />
                  <input
                    type="text"
                    placeholder="Search by name, role, department, or skill..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl text-[#FFF5F7] placeholder-[#795C65] focus:outline-none focus:border-[#C94B6A] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl px-3 py-1.5 text-[#C9A8B0] focus:outline-none focus:border-[#C94B6A] transition-colors"
                >
                  <option value="all">All Departments</option>
                  {departments.filter((d) => d !== 'all').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl px-3 py-1.5 text-[#C9A8B0] focus:outline-none focus:border-[#C94B6A] transition-colors"
                >
                  <option value="all">All Hubs</option>
                  {locations.filter((l) => l !== 'all').map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1A080D]/60 border-b border-[#641A2D] text-[#795C65] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Employee Details</th>
                    <th className="py-3 px-3 font-semibold">Department</th>
                    <th className="py-3 px-3 font-semibold">Location</th>
                    <th className="py-3 px-3 font-semibold">Verified Skills</th>
                    <th className="py-3 px-3 font-semibold">Signals Sync</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#641A2D] text-[#C9A8B0]">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => onSelectEmployee(emp)}
                      className="hover:bg-[#481321]/60 transition-colors duration-150 cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={emp.avatarUrl}
                            alt={emp.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#641A2D] shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-[#FFF5F7] group-hover:text-white transition-colors">{emp.name}</p>
                            <p className="text-[11px] text-[#795C65]">{emp.currentRole}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[#C9A8B0] text-xs font-medium">{emp.department}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center space-x-1 text-[#C9A8B0] text-xs">
                          <MapPin className="w-3 h-3 text-[#C43A58]" />
                          <span>{emp.location.split(',')[0]}</span>
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {emp.skills.slice(0, 3).map((sk) => (
                            <span
                              key={sk.id}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-[#1A080D] text-[#C9A8B0] border border-[#641A2D]"
                            >
                              {sk.name.split(' ')[0]} ({sk.confidence}%)
                            </span>
                          ))}
                          {emp.skills.length > 3 && (
                            <span className="text-[10px] text-[#795C65] font-mono">
                              +{emp.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5 text-[11px] text-[#C9A8B0]">
                          <span className="w-2 h-2 rounded-full bg-[#34D399] shrink-0" />
                          <span>{emp.connectedAccounts.github.lastSync}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-[#310D17] group-hover:bg-[#481321] text-[#FFF5F7] text-xs font-semibold inline-flex items-center space-x-1 transition-colors border border-[#641A2D]">
                          <span>View Profile</span>
                          <ChevronRight className="w-3 h-3 text-[#C94B6A]" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: AI WORKFORCE SKILLS AUDIT & DEFICIT HEATMAP */}
        {activeView === 'skill-audit' && (
          <div className="p-6 space-y-6">
            {/* Heatmap Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#FFF5F7] flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-[#C94B6A]" />
                    <span>Workforce Skill Supply & Coverage Heatmap (20 Tech Leads)</span>
                  </h3>
                  <p className="text-xs text-[#C9A8B0] mt-0.5">
                    Live coverage percentage based on verified explicit and inferred capabilities across engineering guilds.
                  </p>
                </div>
                <Badge variant="success">Audit: Today, 2026</Badge>
              </div>

              <div className="space-y-3">
                {skillCoverageData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#1A080D] border border-[#641A2D] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="sm:w-1/3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#FFF5F7]">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#310D17] border border-[#641A2D] text-[#C9A8B0]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#795C65] mt-0.5">
                        {item.count} of 20 Engineers Proficient
                      </p>
                    </div>

                    <div className="sm:w-1/3 flex items-center space-x-3">
                      <div className="w-full">
                        <ProgressBar value={item.coverage} size="md" />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#FFF5F7] w-10 text-right">
                        {item.coverage}%
                      </span>
                    </div>

                    <div className="sm:w-1/4 text-right">
                      <Badge
                        variant={
                          item.status === 'Healthy Supply'
                            ? 'success'
                            : item.status === 'Moderate Supply'
                            ? 'burgundy'
                            : 'danger'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emerging Skill Deficit Alerts */}
            <div className="pt-6 border-t border-[#641A2D]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-[#FFF5F7] flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
                  <span>Emerging Skill Deficit Alerts & Mitigation Plans</span>
                </h3>

                <Button
                  variant="primary"
                  glow
                  size="sm"
                  onClick={handleGenerateInsights}
                  disabled={isLoadingInsights}
                  className="space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoadingInsights ? 'Analyzing...' : 'Run Atom Workforce Intelligence'}</span>
                </Button>
              </div>

              {/* Loading State */}
              {isLoadingInsights && (
                <div className="p-4 bg-[#1A080D] border border-[#C94B6A]/40 rounded-xl space-y-3 mb-4 animate-pulse">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-[#E58CA2]">
                    <Sparkles className="w-4 h-4 animate-spin text-[#C94B6A]" />
                    <span>Atom is synthesizing organizational skill graphs...</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-5/6 bg-[#481321] rounded" />
                    <div className="h-2.5 w-4/6 bg-[#481321] rounded" />
                  </div>
                </div>
              )}

              {/* Error State */}
              {insightsError && (
                <div className="p-3.5 bg-[#481321] border-l-4 border-l-[#F87171] border border-[#641A2D] rounded-r-xl flex items-center justify-between text-xs text-[#FFF5F7] mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#F87171] shrink-0" />
                    <span>{insightsError}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleGenerateInsights}>
                    Retry
                  </Button>
                </div>
              )}

              {/* Live Analysis Result */}
              {aiInsights && (
                <div
                  className="p-5 rounded-xl space-y-3 mb-4 border"
                  style={{
                    backgroundColor: colors.burgundy850,
                    borderColor: colors.accentRose,
                    boxShadow: glows.rose,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-[#C94B6A]" />
                      <span className="text-xs font-bold text-[#FFF5F7]">Strategic Workforce Insights</span>
                    </div>
                    <Badge variant="burgundy">Live Synthesis</Badge>
                  </div>

                  <p className="text-xs text-[#FFF5F7] leading-relaxed font-medium">
                    {aiInsights.summary}
                  </p>

                  {aiInsights.internalMobilityRecommendations && aiInsights.internalMobilityRecommendations.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[11px] font-bold text-[#E08A9D]">Priority Mobility Actions:</span>
                      <ul className="list-disc pl-4 text-xs text-[#C9A8B0] space-y-1">
                        {aiInsights.internalMobilityRecommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criticalDeficitAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#1A080D] border border-[#641A2D] rounded-xl space-y-2 hover:border-[#800F2F] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#FFF5F7]">{alert.skill}</span>
                      <Badge variant="danger">
                        Supply: {alert.currentTrained} / Target: {alert.requiredHeadcount}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#795C65]">Department: {alert.department}</p>
                    <p className="text-xs text-[#C9A8B0] leading-relaxed">
                      ⚠️ <strong>Risk:</strong> {alert.riskImpact}
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#641A2D] text-xs text-[#34D399] bg-[#120609] p-2.5 rounded-lg border border-[#641A2D]">
                      <strong>Proactive Mitigation:</strong> {alert.remediationPlan}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
