import React, { useState, useMemo, useEffect } from 'react';
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  Bot, 
  Check, 
  Sparkles,
  Compass,
  Users,
  RefreshCw
} from 'lucide-react';
import { TargetRole, EmployeeProfile, GapAnalysisResult } from '../types';
import { TARGET_ROLES } from '../data/mockData';
import { colors, radius, shadows, glows } from '../design-system/tokens';
import { Card, MetricCard, Badge, Button, ProgressBar } from '../design-system';

interface GapAnalysisViewProps {
  employee: EmployeeProfile;
  onOpenAssistantWithPrompt: (prompt: string) => void;
}

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({
  employee,
  onOpenAssistantWithPrompt,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(TARGET_ROLES[0].id);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(['crs-01']);
  
  // Interactive milestone completion tracker
  const [completedMilestoneIds, setCompletedMilestoneIds] = useState<string[]>([
    'm-01-1', // Milestone 1 checked by default
  ]);

  const activeRole = TARGET_ROLES.find((r) => r.id === selectedRoleId) || TARGET_ROLES[0];

  // AI-powered states (POST /api/ai/skill-gap, POST /api/ai/learning-resources, POST /api/ai/career-roadmap, POST /api/ai/emerging-skills)
  const [aiGapAnalysis, setAiGapAnalysis] = useState<any>(null);
  const [aiLearningResources, setAiLearningResources] = useState<any[]>([]);
  const [aiRoadmap, setAiRoadmap] = useState<any>(null);
  const [aiEmergingSkills, setAiEmergingSkills] = useState<any[]>([]);

  const [isLoadingGap, setIsLoadingGap] = useState(false);
  const [gapError, setGapError] = useState<string | null>(null);

  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  const fetchAiGapAndLearning = async () => {
    setIsLoadingGap(true);
    setGapError(null);
    try {
      const gapRes = await fetch('/api/ai/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeSkills: employee.skills.map((s) => ({
            skill: s.name,
            confidence: s.confidence,
            category: s.category,
          })),
          targetRole: {
            title: activeRole.title,
            level: activeRole.level,
            requiredSkills: activeRole.requiredSkills.map((r) => ({
              skill: r.name,
              requiredLevel: r.minimumConfidence,
              importance: r.importance,
            })),
          },
          targetRoleRequiredSkills: activeRole.requiredSkills.map((r) => ({
            skill: r.name,
            requiredLevel: r.minimumConfidence,
            importance: r.importance,
          })),
        }),
      });

      if (!gapRes.ok) throw new Error('Skill gap analysis failed');
      const gapData = await gapRes.json();
      const resolvedGap = gapData.gapAnalysis || gapData.gap;
      setAiGapAnalysis(resolvedGap);

      // Persist to server database
      fetch('/api/gap-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          analysis: {
            targetRoleId: activeRole.id,
            targetRoleTitle: activeRole.title,
            matchScore: resolvedGap?.overallReadiness || resolvedGap?.matchScore || 75,
            matchedSkills: resolvedGap?.fullyMatched || [],
            partiallyMatchingSkills: resolvedGap?.partiallyMatched || [],
            missingSkills: resolvedGap?.missingSkills || resolvedGap?.missing || [],
          },
        }),
      }).catch((e) => console.warn('Could not persist gap analysis to database:', e));

      const missing =
        resolvedGap?.missingSkills?.map((s: any) => s.skill) ||
        resolvedGap?.missing?.map((s: any) => s.skill) ||
        activeRole.requiredSkills.map((r) => r.name);

      const learnRes = await fetch('/api/ai/learning-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missingSkills: missing.slice(0, 3),
          currentLevel: employee.currentRole,
          targetRole: activeRole.title,
        }),
      });

      if (learnRes.ok) {
        const learnData = await learnRes.json();
        setAiLearningResources(learnData.resources || []);
      }
    } catch (err: any) {
      console.error('AI gap analysis error:', err);
      setGapError('AI analysis unavailable. Retry?');
    } finally {
      setIsLoadingGap(false);
    }
  };

  const fetchAiRoadmapAndEmerging = async () => {
    setIsLoadingRoadmap(true);
    setRoadmapError(null);
    try {
      const [roadmapRes, emergingRes] = await Promise.all([
        fetch('/api/ai/career-roadmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee: {
              name: employee.name,
              currentRole: employee.currentRole,
              skills: employee.skills.map((s) => ({ skill: s.name, confidence: s.confidence, category: s.category })),
            },
            targetRole: {
              title: activeRole.title,
              level: activeRole.level,
              requiredSkills: activeRole.requiredSkills.map((r) => ({ skill: r.name, requiredLevel: r.minimumConfidence })),
            },
            timeframeMonths: 6,
          }),
        }),
        fetch('/api/ai/emerging-skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationDomain: employee.department || 'Distributed Systems & Cloud Architecture',
            domain: employee.department || 'Distributed Systems & Cloud Architecture',
            currentRole: employee.currentRole,
          }),
        }),
      ]);

      if (!roadmapRes.ok) throw new Error('Career roadmap generation failed');
      const roadmapData = await roadmapRes.json();
      setAiRoadmap(roadmapData.roadmap);

      if (emergingRes.ok) {
        const emergingData = await emergingRes.json();
        setAiEmergingSkills(emergingData.emergingSkills || emergingData.forecast || []);
      }
    } catch (err: any) {
      console.error('AI roadmap error:', err);
      setRoadmapError('AI analysis unavailable. Retry?');
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  useEffect(() => {
    fetchAiGapAndLearning();
    fetchAiRoadmapAndEmerging();
  }, [selectedRoleId, employee.id]);

  // Dynamically compute gaps between active employee's skills and the target role
  const computedGapData = useMemo(() => {
    const matchedSkills: { name: string; employeeConfidence: number; requiredConfidence: number }[] = [];
    const partiallyMatchingSkills: { name: string; employeeConfidence: number; requiredConfidence: number; gapPoints: number }[] = [];
    const missingSkills: { name: string; requiredConfidence: number; importance: string }[] = [];

    activeRole.requiredSkills.forEach((req) => {
      const empSkill = employee.skills.find(
        (s) =>
          s.name.toLowerCase().includes(req.name.toLowerCase()) ||
          req.name.toLowerCase().includes(s.name.toLowerCase())
      );

      if (empSkill) {
        if (empSkill.confidence >= req.minimumConfidence) {
          matchedSkills.push({
            name: req.name,
            employeeConfidence: empSkill.confidence,
            requiredConfidence: req.minimumConfidence,
          });
        } else {
          partiallyMatchingSkills.push({
            name: req.name,
            employeeConfidence: empSkill.confidence,
            requiredConfidence: req.minimumConfidence,
            gapPoints: req.minimumConfidence - empSkill.confidence,
          });
        }
      } else {
        missingSkills.push({
          name: req.name,
          requiredConfidence: req.minimumConfidence,
          importance: req.importance,
        });
      }
    });

    const totalReq = activeRole.requiredSkills.length;
    const matchScore = Math.round(((matchedSkills.length + partiallyMatchingSkills.length * 0.5) / totalReq) * 100);

    return {
      matchScore: Math.min(96, Math.max(35, matchScore)),
      matchedSkills,
      partiallyMatchingSkills,
      missingSkills,
    };
  }, [employee, activeRole]);

  // Recommended courses and mentorship activities mapped to the active role
  const recommendedCurriculum = useMemo(() => {
    return [
      {
        id: 'crs-01',
        title: 'Graph Data Modeling with Neo4j 5.x & Cypher Query Tuning',
        provider: 'Coursera & Neo4j Academy',
        duration: '14 hours (Self-paced)',
        rating: 4.9,
        skillTarget: 'Neo4j & Graph Data Modelling',
        internalMentor: 'Dinesh Kumar Velusamy (Data Platform Lead)',
        url: '#neo4j-course',
      },
      {
        id: 'crs-02',
        title: 'Enterprise Zero-Trust Service Mesh with Istio & SPIFFE',
        provider: 'Udemy & Cloud Native Institute',
        duration: '10 hours (3 projects)',
        rating: 4.8,
        skillTarget: 'Zero-Trust Network & Service Mesh',
        internalMentor: 'Balaji Parthasarathy (Lead Security Architect)',
        url: '#istio-course',
      },
      {
        id: 'crs-03',
        title: 'Linux Kernel Observability with eBPF & Cilium in Kubernetes',
        provider: 'Linux Foundation',
        duration: '8 hours',
        rating: 4.7,
        skillTarget: 'eBPF Kernel Tracing & Cilium',
        internalMentor: 'Suresh Kumar Duraisamy (Principal SRE)',
        url: '#ebpf-course',
      },
    ];
  }, [activeRole]);

  // Emerging skill forecasts for Infinite Solutions
  const emergingSkillForecasts = [
    {
      skill: 'Graph RAG & Dynamic Knowledge Graphs',
      projectedHorizon: 'Next 6-12 Months',
      businessDriver: 'Enabling enterprise-wide semantic search over employee capabilities and codebases.',
      relevance: 'High Impact for IC-6 and IC-7 architects.',
    },
    {
      skill: 'eBPF Kernel Observability & Cilium Mesh',
      projectedHorizon: 'Next 12-18 Months',
      businessDriver: 'Replacing heavy sidecar proxies with kernel-level packet filtering for 40% less overhead.',
      relevance: 'Priority for Platform and Infrastructure teams.',
    },
    {
      skill: 'Zero-Trust SPIFFE Workload Attestation',
      projectedHorizon: 'Next 6 Months',
      businessDriver: 'SOC-2 Type II audit requirement across multi-tenant microservice clusters.',
      relevance: 'Mandatory governance competency.',
    },
  ];

  // Career development roadmap phases
  const roadmapPhases = [
    {
      phase: 'Phase 1: High-Priority Gap Closure',
      timeframe: 'Months 1 - 2',
      focus: 'Complete Graph Data Modeling in Neo4j and pair on Infinite Solutions Skill Graph',
      milestones: [
        { id: 'm-01-1', text: 'Complete Coursera Neo4j Graph Data Modeling course (verified by LMS webhook)' },
        { id: 'm-01-2', text: 'Author internal tech memo on Cypher schema design for skill relationships' },
        { id: 'm-01-3', text: 'Pair with Dinesh Kumar Velusamy (Data Platform Lead) on query execution plans' },
      ],
    },
    {
      phase: 'Phase 2: Enterprise Service Mesh & Security',
      timeframe: 'Months 3 - 4',
      focus: 'Advance Service Mesh & Zero-Trust competencies from baseline to 85%+',
      milestones: [
        { id: 'm-02-1', text: 'Collaborate with Balaji Parthasarathy on SPIFFE workload attestation RFC' },
        { id: 'm-02-2', text: 'Lead rollout of mutual TLS (mTLS) enforcement on Auth Service gateway' },
      ],
    },
    {
      phase: 'Phase 3: Promotion Readiness Review',
      timeframe: 'Months 5 - 6',
      focus: 'Demonstrate cross-org Staff Architect impact and submit dossier to CTO Meenakshi Sundaram',
      milestones: [
        { id: 'm-03-1', text: 'Sponsor an RFC for company-wide event streaming governance' },
        { id: 'm-03-2', text: 'Present at Architecture Review Board on zero-downtime database failover' },
        { id: 'm-03-3', text: 'Submit formal promotion dossier supported by SkillGraph readiness score (90%+)' },
      ],
    },
  ];

  const toggleMilestone = (id: string) => {
    setCompletedMilestoneIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleEnroll = (courseId: string) => {
    if (!enrolledCourseIds.includes(courseId)) {
      setEnrolledCourseIds([...enrolledCourseIds, courseId]);
    }
  };

  const totalMilestonesCount = roadmapPhases.reduce((acc, p) => acc + p.milestones.length, 0);
  const roadmapProgress = Math.round((completedMilestoneIds.length / totalMilestonesCount) * 100);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Target Role Selection */}
      <Card padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="burgundy">Skill Gap Analysis & Career Mobility</Badge>
              <span className="text-xs font-semibold text-[#C9A8B0]">
                Profile: <strong className="text-[#FFF5F7]">{employee.name}</strong> ({employee.currentRole})
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#FFF5F7] tracking-tight mt-1.5">
              Target Role Progression & Learning Path
            </h1>
            <p className="text-xs text-[#C9A8B0] mt-1 max-w-2xl leading-relaxed">
              Identify missing capabilities between your current profile and target roles. Receive personalized course recommendations, internal mentorship pairings, and structured milestone roadmaps.
            </p>
          </div>

          {/* Role Dropdown */}
          <div className="bg-[#1A080D] p-3.5 rounded-xl border border-[#641A2D] min-w-[300px]">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#795C65] block mb-1">
              Select Desired Target Role
            </label>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-[#C94B6A] shrink-0" />
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#FFF5F7] focus:outline-none w-full cursor-pointer"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role.id} value={role.id} className="bg-[#1A080D] text-[#FFF5F7]">
                    {role.title} ({role.level})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Overview Fit Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#641A2D]">
          <MetricCard
            label="Overall Match Score"
            value={`${aiGapAnalysis?.matchScore ?? computedGapData.matchScore}%`}
            trend={{
              value: (aiGapAnalysis?.matchScore ?? computedGapData.matchScore) >= 75 ? "High Match" : "Developing",
              isPositive: (aiGapAnalysis?.matchScore ?? computedGapData.matchScore) >= 75,
            }}
          />

          <MetricCard
            label="Fully Matched Skills"
            value={`${computedGapData.matchedSkills.length}`}
            subtext={`of ${activeRole.requiredSkills.length} required`}
          />

          <MetricCard
            label="Identified Skill Gaps"
            value={`${computedGapData.missingSkills.length + computedGapData.partiallyMatchingSkills.length}`}
            subtext={`${computedGapData.missingSkills.length} missing • ${computedGapData.partiallyMatchingSkills.length} partial`}
          />

          <div className="bg-[#1A080D] p-4 rounded-xl border border-[#641A2D]">
            <p className="text-[11px] font-medium text-[#795C65] uppercase tracking-wider">
              Roadmap Progress
            </p>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-[#FFF5F7]">{roadmapProgress}%</span>
              <span className="text-xs font-semibold text-[#C9A8B0]">
                {completedMilestoneIds.length}/{totalMilestonesCount} Milestones
              </span>
            </div>
            <div className="mt-2.5">
              <ProgressBar value={roadmapProgress} size="sm" />
            </div>
          </div>
        </div>

        {/* AI Gap Analysis Loading Skeleton */}
        {isLoadingGap && (
          <div className="mt-4 p-4 rounded-xl bg-[#1A080D] border border-[#C94B6A]/40 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#E58CA2]">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-[#C94B6A]" />
              <span>Atom is evaluating capability requirements...</span>
            </div>
            <div className="h-3 w-72 bg-[#481321] rounded animate-pulse" />
          </div>
        )}

        {/* Error State */}
        {gapError && (
          <div className="mt-4 p-3.5 bg-[#481321] border border-[#F87171] rounded-xl flex items-center justify-between text-xs text-[#FFF5F7]">
            <span>{gapError}</span>
            <Button variant="secondary" size="sm" onClick={fetchAiGapAndLearning}>
              Retry
            </Button>
          </div>
        )}

        {/* AI Gap Diagnosis Banner */}
        {!isLoadingGap && aiGapAnalysis?.summary && (
          <div className="mt-4 p-3.5 bg-[#1A080D] border border-[#C94B6A]/50 rounded-xl flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-[#C94B6A] mt-0.5 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-[#E08A9D] uppercase tracking-wider block">
                Claude Sonnet Gap Diagnosis
              </span>
              <p className="text-xs text-[#C9A8B0] mt-0.5 leading-relaxed">
                {aiGapAnalysis.summary}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Side-by-Side Detailed Breakdown: Matched vs Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fully Matched Capabilities */}
        <Card padding="md">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#641A2D]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <h3 className="text-xs font-bold text-[#FFF5F7] uppercase tracking-wider">
                Fully Matched Capabilities ({computedGapData.matchedSkills.length})
              </h3>
            </div>
            <Badge variant="success">Verified & Audit Ready</Badge>
          </div>

          <div className="mt-4 space-y-2.5">
            {computedGapData.matchedSkills.length === 0 ? (
              <p className="text-xs text-[#795C65] py-3">No fully matching skills for this target role.</p>
            ) : (
              computedGapData.matchedSkills.map((sk, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#1A080D] border border-[#641A2D] rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#FFF5F7]">{sk.name}</h4>
                    <p className="text-[11px] text-[#795C65] mt-0.5">
                      Required threshold: {sk.requiredConfidence}% • Verified from telemetry
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-[#34D399]">
                      {sk.employeeConfidence}%
                    </span>
                    <span className="text-[10px] block text-[#795C65]">Exceeds req</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Missing & Partially Matching Skills (The Gaps) */}
        <Card padding="md">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#641A2D]">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
              <h3 className="text-xs font-bold text-[#FFF5F7] uppercase tracking-wider">
                Capabilities to Bridge ({computedGapData.missingSkills.length + computedGapData.partiallyMatchingSkills.length})
              </h3>
            </div>
            <Badge variant="warning">Action Required</Badge>
          </div>

          <div className="mt-4 space-y-2.5">
            {/* Partial Matches */}
            {computedGapData.partiallyMatchingSkills.map((sk, idx) => (
              <div
                key={`partial-${idx}`}
                className="p-3 bg-[#1A080D] border border-[#FBBF24]/30 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-[#FFF5F7]">{sk.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
                      Δ Gap: +{sk.gapPoints} pts ({sk.requiredConfidence}% req - {sk.employeeConfidence}% curr)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C9A8B0] mt-1 font-mono">
                    Current: {sk.employeeConfidence}% • Target required: {sk.requiredConfidence}%
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenAssistantWithPrompt(`How can I close the ${sk.gapPoints}-point gap in ${sk.name} for ${activeRole.title}?`)}
                  className="shrink-0 ml-2"
                >
                  Plan Fix
                </Button>
              </div>
            ))}

            {/* Missing Skills */}
            {computedGapData.missingSkills.map((sk, idx) => (
              <div
                key={`missing-${idx}`}
                className="p-3 bg-[#1A080D] border border-[#F87171]/30 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-[#FFF5F7]">{sk.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">
                      Δ Gap: +{sk.requiredConfidence} pts ({sk.requiredConfidence}% req - 0% curr)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C9A8B0] mt-1 font-mono">
                    Target required: {sk.requiredConfidence}% • No prior repository or LMS record ({sk.importance})
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onOpenAssistantWithPrompt(`Give me a detailed learning and mentorship plan to learn ${sk.name} from scratch.`)}
                  className="shrink-0 ml-2"
                >
                  Plan Fix
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Emerging Skills Forecast for Infinite Solutions */}
      <Card padding="lg" className="border-[#800F2F]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#641A2D]">
          <div>
            <Badge variant="burgundy">Predictive Talent Intelligence</Badge>
            <h3 className="text-sm font-bold text-[#FFF5F7] mt-1.5 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#C94B6A]" />
              <span>Emerging Skills Forecast (Next 12–24 Months)</span>
            </h3>
          </div>
          <p className="text-xs text-[#C9A8B0] max-w-md">
            Identified organizational demands predicted by Quantum-Q based on technology roadmap and client contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {(aiEmergingSkills.length > 0 ? aiEmergingSkills : emergingSkillForecasts).map((f: any, i: number) => (
            <div
              key={i}
              className="p-4 bg-[#1A080D] rounded-xl border border-[#641A2D] flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-[#E08A9D] bg-[#310D17] px-2 py-0.5 rounded border border-[#641A2D]">
                  {f.horizonMonths ? `${f.horizonMonths} Months Horizon` : f.projectedHorizon}
                </span>
                <h4 className="text-xs font-bold text-[#FFF5F7] mt-2">{f.skill}</h4>
                <p className="text-[11px] text-[#C9A8B0] mt-1 leading-relaxed">
                  {f.strategicImportance || f.businessDriver}
                </p>
              </div>
              <p className="text-[10px] font-semibold text-[#34D399] mt-3 pt-2 border-t border-[#641A2D]">
                ⚡ {f.recommendedAction || f.relevance}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommended Courses & Mentorship Pairing */}
      <Card padding="lg">
        <div className="flex items-center justify-between pb-4 border-b border-[#641A2D]">
          <div>
            <h3 className="text-sm font-bold text-[#FFF5F7] flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#C94B6A]" />
              <span>Personalized Curriculum & Internal Mentorship Pairings</span>
            </h3>
            <p className="text-xs text-[#C9A8B0] mt-0.5">
              AI-tailored courses and internal senior engineer pairing to close your specific gap areas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {aiLearningResources.length > 0
            ? aiLearningResources.flatMap((rec: any, rIdx: number) =>
                (rec.resources || []).map((course: any, cIdx: number) => {
                  const courseId = `ai-crs-${rIdx}-${cIdx}`;
                  const isEnrolled = enrolledCourseIds.includes(courseId);
                  return (
                    <div
                      key={courseId}
                      className="p-4 bg-[#1A080D] border border-[#641A2D] rounded-xl flex flex-col justify-between hover:border-[#800F2F] transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-[#310D17] text-[#FFF5F7] border border-[#641A2D]">
                            {course.provider || 'Coursera'}
                          </span>
                          <Badge variant="burgundy">{course.difficulty || 'Advanced'}</Badge>
                        </div>

                        <h4 className="text-xs font-bold text-[#FFF5F7] leading-snug">{course.title}</h4>
                        <p className="text-[11px] text-[#795C65] mt-1">Duration: {course.duration || '10 hours'}</p>
                        {course.whyRecommended && (
                          <p className="text-[11px] text-[#C9A8B0] mt-2 italic bg-[#120609] p-2 rounded-lg border border-[#641A2D]">
                            "{course.whyRecommended}"
                          </p>
                        )}
                        
                        {/* Internal Mentor Pairing */}
                        <div className="mt-3 p-2 bg-[#120609] rounded-lg border border-[#641A2D] text-[11px]">
                          <span className="font-semibold text-[#FFF5F7] flex items-center space-x-1">
                            <Users className="w-3 h-3 text-[#C94B6A]" />
                            <span>Focus:</span>
                          </span>
                          <p className="text-[#C9A8B0] mt-0.5">{rec.mentorshipFocus || rec.skill}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#641A2D] flex items-center justify-between">
                        <span className="text-[10px] font-medium text-[#795C65]">Target: {rec.skill}</span>
                        <Button
                          variant={isEnrolled ? 'secondary' : 'primary'}
                          glow={!isEnrolled}
                          size="sm"
                          onClick={() => handleEnroll(courseId)}
                          className="space-x-1"
                        >
                          {isEnrolled ? (
                            <>
                              <Check className="w-3 h-3 text-[#34D399]" />
                              <span>Enrolled in LMS</span>
                            </>
                          ) : (
                            <span>Enroll in Course</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )
            : recommendedCurriculum.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                return (
                  <div
                    key={course.id}
                    className="p-4 bg-[#1A080D] border border-[#641A2D] rounded-xl flex flex-col justify-between hover:border-[#800F2F] transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-[#310D17] text-[#FFF5F7] border border-[#641A2D]">
                          {course.provider}
                        </span>
                        <span className="text-xs font-bold text-[#FBBF24]">★ {course.rating}</span>
                      </div>

                      <h4 className="text-xs font-bold text-[#FFF5F7] leading-snug">{course.title}</h4>
                      <p className="text-[11px] text-[#795C65] mt-1">Duration: {course.duration}</p>
                      
                      {/* Internal Mentor Pairing */}
                      <div className="mt-3 p-2 bg-[#120609] rounded-lg border border-[#641A2D] text-[11px]">
                        <span className="font-semibold text-[#FFF5F7] flex items-center space-x-1">
                          <Users className="w-3 h-3 text-[#C94B6A]" />
                          <span>Internal Pairing Mentor:</span>
                        </span>
                        <p className="text-[#C9A8B0] mt-0.5">{course.internalMentor}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#641A2D] flex items-center justify-between">
                      <span className="text-[10px] font-medium text-[#795C65]">Target: {course.skillTarget.split('&')[0]}</span>
                      <Button
                        variant={isEnrolled ? 'secondary' : 'primary'}
                        glow={!isEnrolled}
                        size="sm"
                        onClick={() => handleEnroll(course.id)}
                        className="space-x-1"
                      >
                        {isEnrolled ? (
                          <>
                            <Check className="w-3 h-3 text-[#34D399]" />
                            <span>Enrolled in LMS</span>
                          </>
                        ) : (
                          <span>Enroll in Course</span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
        </div>
      </Card>

      {/* Multi-Phase Mobility Roadmap with Interactive Milestones */}
      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#641A2D]">
          <div>
            <h3 className="text-sm font-bold text-[#FFF5F7] flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#C94B6A]" />
              <span>Personalized Career Development & Mobility Roadmap</span>
            </h3>
            <p className="text-xs text-[#C9A8B0] mt-0.5">
              Track your milestones to ensure readiness for promotion to <strong className="text-[#FFF5F7]">{activeRole.title}</strong>.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenAssistantWithPrompt(`As Atom, review my career mobility roadmap for ${activeRole.title} and recommend next steps.`)}
            className="space-x-1.5 self-start sm:self-auto"
          >
            <Bot className="w-3.5 h-3.5 text-[#C94B6A]" />
            <span>Consult Atom Coach</span>
          </Button>
        </div>

        {/* Loading state */}
        {isLoadingRoadmap && (
          <div className="mt-6 p-4 bg-[#1A080D] border border-[#C94B6A]/40 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#E58CA2]">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-[#C94B6A]" />
              <span>Atom is generating milestones...</span>
            </div>
            <div className="h-3 w-48 bg-[#481321] rounded animate-pulse" />
          </div>
        )}

        {/* Error state */}
        {roadmapError && (
          <div className="mt-6 p-3.5 bg-[#481321] border border-[#F87171] rounded-xl flex items-center justify-between text-xs text-[#FFF5F7]">
            <span>{roadmapError}</span>
            <Button variant="secondary" size="sm" onClick={fetchAiRoadmapAndEmerging}>
              Retry
            </Button>
          </div>
        )}

        <div className="space-y-6 mt-6">
          {((aiRoadmap?.phases?.length ? aiRoadmap.phases : roadmapPhases) as any[]).map((phase: any, pIdx: number) => (
            <div key={pIdx} className="p-4 bg-[#1A080D] rounded-xl border border-[#641A2D]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <h4 className="text-xs font-bold text-[#FFF5F7] flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#800F2F] text-white text-[10px] flex items-center justify-center font-bold">
                    {pIdx + 1}
                  </span>
                  <span>{phase.phase || phase.title || `Phase ${pIdx + 1}`}</span>
                </h4>
                <span className="text-[11px] font-mono font-semibold text-[#795C65]">{phase.timeframe || phase.duration}</span>
              </div>
              <p className="text-xs text-[#C9A8B0] mb-3">{phase.focus}</p>

              <div className="space-y-2">
                {(phase.milestones || []).map((m: any, mIdx: number) => {
                  const mId = typeof m === 'string' ? `m-${pIdx}-${mIdx}` : (m.id || `m-${pIdx}-${mIdx}`);
                  const mText = typeof m === 'string' ? m : (m.text || m.title || m.description);
                  const isDone = completedMilestoneIds.includes(mId);
                  return (
                    <div
                      key={mId}
                      onClick={() => toggleMilestone(mId)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-start space-x-3 ${
                        isDone
                          ? 'bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]'
                          : 'bg-[#120609] border-[#641A2D] hover:bg-[#310D17] text-[#C9A8B0]'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-[#34D399] border-[#34D399] text-black' : 'border-[#641A2D]'
                      }`}>
                        {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={`text-xs leading-relaxed ${isDone ? 'line-through opacity-60' : ''}`}>
                        {mText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
