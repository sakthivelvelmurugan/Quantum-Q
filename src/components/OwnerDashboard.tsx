import React from 'react';
import { 
  Crown, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  Bot,
  Sparkles,
  Award
} from 'lucide-react';
import { AuthAccount, Organization, EmployeeProfile } from '../types';
import { colors, radius, shadows, glows } from '../design-system/tokens';
import { Card, MetricCard, Badge, Button, ProgressBar } from '../design-system';

interface OwnerDashboardProps {
  currentUser: AuthAccount;
  currentOrg: Organization;
  employees: EmployeeProfile[];
  onNavigateToHRMatching: () => void;
  onNavigateToProfiles: () => void;
  onOpenAtomWithPrompt: (prompt: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  currentOrg,
  employees,
  onNavigateToHRMatching,
  onNavigateToProfiles,
  onOpenAtomWithPrompt,
}) => {
  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Executive Hero & Header */}
      <Card padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="burgundy">
                Executive Governance • {currentOrg.name}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mt-3" style={{ color: colors.textPrimary }}>
              Good morning, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: colors.textSecondary }}>
              Real-time talent governance and capability health for {currentUser.title}. Oversee organizational skill readiness, cross-hub engineering capacity, critical technical deficits, and executive succession planning.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Button
              variant="primary"
              onClick={() =>
                onOpenAtomWithPrompt(
                  `As Company Owner of ${currentOrg.name}, what are our highest priority engineering skill risks and how should we allocate Q4 cross-skilling budget?`
                )
              }
              className="space-x-2"
            >
              <span>Consult Atom for Executive Briefing</span>
            </Button>
          </div>
        </div>

        {/* 4 Core Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#641A2D]">
          <MetricCard
            label="Total Personnel"
            value={currentOrg.employeeCount.toLocaleString()}
            subtext="20 Tamil Tech Leads indexed"
            icon={<Users className="w-5 h-5" />}
            accent="burgundy"
            trend={{ value: '4.8% YoY', isPositive: true }}
          />

          <MetricCard
            label="Internal Skill Coverage"
            value="94.2%"
            subtext="Tier-1 production services covered"
            icon={<ShieldCheck className="w-5 h-5" />}
            accent="success"
            trend={{ value: '2.1%', isPositive: true }}
          />

          <MetricCard
            label="Internal Mobility Savings"
            value="₹1.84 Cr"
            subtext="14 internal promotions vs agency"
            icon={<TrendingUp className="w-5 h-5" />}
            accent="burgundy"
            trend={{ value: '₹32L saved', isPositive: true }}
          />

          <MetricCard
            label="Critical Skill Deficits"
            value="3 Deficits"
            subtext="Neo4j, Istio mTLS, eBPF"
            icon={<AlertTriangle className="w-5 h-5" />}
            accent="warning"
          />
        </div>
      </Card>

      {/* 2-Column Grid: Deficit Index & Regional Talent Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Critical Organizational Skill Deficit Index (7 cols) */}
        <div
          className="lg:col-span-7 rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: colors.burgundy800,
            borderColor: colors.burgundy600,
            boxShadow: shadows.card,
          }}
        >
          <div className="p-5 border-b border-[#641A2D] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#FFF5F7]">
                Critical Organizational Skill Deficit Index
              </h2>
              <p className="text-xs text-[#C9A8B0] mt-0.5">
                High-impact competencies where current internal supply is below business demand
              </p>
            </div>
            <Badge variant="warning">Active Monitoring</Badge>
          </div>

          <div className="divide-y divide-[#641A2D]">
            {/* Deficit 1 */}
            <div className="p-4 hover:bg-[#481321] transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#FFF5F7]">
                    Neo4j & Enterprise Graph Data Modelling
                  </h3>
                  <p className="text-[11px] text-[#C9A8B0] mt-0.5">
                    Required for unified customer relationship and talent intelligence graph queries
                  </p>
                </div>
                <Badge variant="danger">Gap: -6 Engineers</Badge>
              </div>
              <div className="flex items-center space-x-3 mt-3 text-xs text-[#C9A8B0]">
                <span className="flex items-center space-x-1 text-[#34D399]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Supply: <strong>2 Experts</strong></span>
                </span>
                <span className="text-[#641A2D]">•</span>
                <span>Target: <strong className="text-[#FFF5F7]">8 Engineers</strong></span>
                <span className="text-[#641A2D]">•</span>
                <span className="text-[#E08A9D]">Cohort 1: 4 in Coursera LMS</span>
              </div>
            </div>

            {/* Deficit 2 */}
            <div className="p-4 hover:bg-[#481321] transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#FFF5F7]">
                    Zero-Trust Network & Istio Service Mesh
                  </h3>
                  <p className="text-[11px] text-[#C9A8B0] mt-0.5">
                    Required for strict mutual TLS pod-to-pod and PCI-DSS compliance
                  </p>
                </div>
                <Badge variant="warning">Gap: -5 Engineers</Badge>
              </div>
              <div className="flex items-center space-x-3 mt-3 text-xs text-[#C9A8B0]">
                <span className="flex items-center space-x-1 text-[#34D399]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Supply: <strong>3 Experts</strong></span>
                </span>
                <span className="text-[#641A2D]">•</span>
                <span>Target: <strong className="text-[#FFF5F7]">8 Engineers</strong></span>
                <span className="text-[#641A2D]">•</span>
                <span className="text-[#E08A9D]">Cohort 2: 3 in Istio Labs</span>
              </div>
            </div>

            {/* Deficit 3 */}
            <div className="p-4 hover:bg-[#481321] transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#FFF5F7]">
                    Linux Kernel Tracing with eBPF & Cilium
                  </h3>
                  <p className="text-[11px] text-[#C9A8B0] mt-0.5">
                    Needed for sub-millisecond network tracing without sidecar proxy overhead
                  </p>
                </div>
                <Badge variant="warning">Gap: -4 Engineers</Badge>
              </div>
              <div className="flex items-center space-x-3 mt-3 text-xs text-[#C9A8B0]">
                <span className="flex items-center space-x-1 text-[#34D399]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Supply: <strong>1 Expert</strong></span>
                </span>
                <span className="text-[#641A2D]">•</span>
                <span>Target: <strong className="text-[#FFF5F7]">5 Engineers</strong></span>
                <span className="text-[#641A2D]">•</span>
                <span className="text-[#E08A9D]">Internal SRE mentorship active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Engineering Talent Hubs (5 cols) */}
        <div
          className="lg:col-span-5 rounded-2xl border p-5 flex flex-col justify-between"
          style={{
            backgroundColor: colors.burgundy800,
            borderColor: colors.burgundy600,
            boxShadow: shadows.card,
          }}
        >
          <div>
            <div className="pb-3 border-b border-[#641A2D] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#FFF5F7]">Regional Talent Hubs</h2>
                <p className="text-xs text-[#C9A8B0]">Headcount & capability distribution</p>
              </div>
              <MapPin className="w-4 h-4 text-[#C94B6A]" />
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="p-3 bg-[#1A080D] rounded-xl border border-[#641A2D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFF5F7]">Chennai Headquarters</span>
                  <span className="text-xs font-mono font-bold text-[#E08A9D]">1,120 Personnel</span>
                </div>
                <p className="text-[11px] text-[#795C65] mt-0.5">
                  Core Cloud Platform, AI Intelligence Labs, SRE & Observability
                </p>
                <div className="mt-2.5">
                  <ProgressBar value={61} size="sm" />
                </div>
              </div>

              <div className="p-3 bg-[#1A080D] rounded-xl border border-[#641A2D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFF5F7]">Coimbatore Innovation Campus</span>
                  <span className="text-xs font-mono font-bold text-[#E08A9D]">480 Personnel</span>
                </div>
                <p className="text-[11px] text-[#795C65] mt-0.5">
                  Distributed Systems, Graph Data Engineering, NLP Research
                </p>
                <div className="mt-2.5">
                  <ProgressBar value={26} size="sm" />
                </div>
              </div>

              <div className="p-3 bg-[#1A080D] rounded-xl border border-[#641A2D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFF5F7]">Madurai Remote & Hybrid Hub</span>
                  <span className="text-xs font-mono font-bold text-[#E08A9D]">140 Personnel</span>
                </div>
                <p className="text-[11px] text-[#795C65] mt-0.5">
                  Quality Engineering Mesh, Design Systems, Frontend Architecture
                </p>
                <div className="mt-2.5">
                  <ProgressBar value={8} size="sm" />
                </div>
              </div>

              <div className="p-3 bg-[#1A080D] rounded-xl border border-[#641A2D]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFF5F7]">Tiruchirappalli, Salem & Tirunelveli</span>
                  <span className="text-xs font-mono font-bold text-[#E08A9D]">100 Personnel</span>
                </div>
                <p className="text-[11px] text-[#795C65] mt-0.5">
                  Mobile Engineering, Cloud Network Peering, Compliance Audits
                </p>
                <div className="mt-2.5">
                  <ProgressBar value={5} size="sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#641A2D] flex items-center justify-between text-xs text-[#C9A8B0]">
            <span>Connected to Supreme Platform:</span>
            <span className="font-semibold text-[#FFF5F7]">Quantum-Q AP-South Mesh</span>
          </div>
        </div>
      </div>

      {/* Succession Planning & Technical Leadership Pipeline */}
      <Card padding="lg" className="border-[#641A2D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#641A2D]">
          <div>
            <h2 className="text-sm font-bold text-[#FFF5F7] flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span>Technical Leadership Succession & Promotion Pipeline</span>
            </h2>
            <p className="text-xs text-[#C9A8B0] mt-0.5">
              Identified internal successors ready for promotion into key architectural roles
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToHRMatching}
            className="flex items-center space-x-1 text-xs text-[#C43A58] hover:text-[#FFF5F7]"
          >
            <span>View All Open Requisitions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-[#1A080D] rounded-xl border border-[#641A2D] hover:border-[#800F2F] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FFF5F7]">Staff Distributed Systems Architect</span>
              <Badge variant="success">IC-6 Ready</Badge>
            </div>
            <p className="text-[11px] text-[#C9A8B0] mt-1.5">
              Successor: <strong className="text-[#FFF5F7]">Aravind Swaminathan</strong> (92% Fit)
            </p>
            <div className="mt-3 text-xs text-[#C9A8B0] space-y-1">
              <p>• Verified Java, Spring Boot, and Kafka depth</p>
              <p>• Closing Neo4j gap in LMS Cohort 1</p>
            </div>
          </div>

          <div className="p-4 bg-[#1A080D] rounded-xl border border-[#641A2D] hover:border-[#800F2F] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FFF5F7]">Principal AI/ML Infrastructure Architect</span>
              <Badge variant="success">IC-7 Ready</Badge>
            </div>
            <p className="text-[11px] text-[#C9A8B0] mt-1.5">
              Successor: <strong className="text-[#FFF5F7]">Vignesh Palanivel</strong> (94% Fit)
            </p>
            <div className="mt-3 text-xs text-[#C9A8B0] space-y-1">
              <p>• Architected pgvector HNSW search</p>
              <p>• Mentors 4 applied AI engineers in Coimbatore</p>
            </div>
          </div>

          <div className="p-4 bg-[#1A080D] rounded-xl border border-[#641A2D] hover:border-[#800F2F] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FFF5F7]">Engineering Manager - Platform</span>
              <Badge variant="success">M-1 Ready</Badge>
            </div>
            <p className="text-[11px] text-[#C9A8B0] mt-1.5">
              Successor: <strong className="text-[#FFF5F7]">Suresh Kumar Duraisamy</strong> (96% Fit)
            </p>
            <div className="mt-3 text-xs text-[#C9A8B0] space-y-1">
              <p>• 8 years coaching experience at Infinite Solutions</p>
              <p>• 94% sprint milestone reliability index</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
