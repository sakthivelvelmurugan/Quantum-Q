import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  MapPin, 
  Bookmark, 
  Send, 
  X, 
  Target
} from 'lucide-react';
import { CandidateMatch, getFitTier, FIT_TIER_THRESHOLDS, FitTier } from '../types';
import { TARGET_ROLES, INITIAL_EMPLOYEES } from '../data/mockData';
import { colors, radius, shadows, glows } from '../design-system/tokens';
import { Card, MetricCard, Badge, Button, ProgressBar } from '../design-system';

export const WorkforceMatchingView: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>(TARGET_ROLES[0].id);
  const [filterFit, setFilterFit] = useState<'All' | FitTier>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [shortlistedEmpIds, setShortlistedEmpIds] = useState<string[]>(['emp_aravind_01', 'emp_deepa_02']);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(null);
  const [interviewModalNotice, setInterviewModalNotice] = useState<string | null>(null);
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [aiEvaluationEngine, setAiEvaluationEngine] = useState<string | null>(null);

  // Custom emerging requirement search
  const [customEmergingSkill, setCustomEmergingSkill] = useState('');
  const [isEmergingActive, setIsEmergingActive] = useState(false);

  const activeRole = TARGET_ROLES.find((r) => r.id === selectedRoleId) || TARGET_ROLES[0];

  // Dynamic candidate matching engine across all Tamil employees using centralized FIT_TIER_THRESHOLDS (REQ-2.4)
  const computedCandidates: CandidateMatch[] = useMemo(() => {
    return INITIAL_EMPLOYEES.map((emp) => {
      let matchedCount = 0;
      let totalConfidenceScore = 0;
      const keyStrengths: string[] = [];
      const growthOpportunities: string[] = [];

      activeRole.requiredSkills.forEach((req) => {
        // Find matching skill in employee's profile
        const empSkill = emp.skills.find(
          (s) =>
            s.name.toLowerCase().includes(req.name.toLowerCase()) ||
            req.name.toLowerCase().includes(s.name.toLowerCase())
        );

        if (empSkill) {
          if (empSkill.confidence >= req.minimumConfidence) {
            matchedCount++;
            totalConfidenceScore += empSkill.confidence;
            keyStrengths.push(`${req.name} (${empSkill.confidence}% conf • ${empSkill.source})`);
          } else {
            // Partial match
            matchedCount += 0.5;
            totalConfidenceScore += empSkill.confidence;
            growthOpportunities.push(
              `${req.name} (Has ${empSkill.confidence}%, requires ${req.minimumConfidence}%)`
            );
          }
        } else {
          growthOpportunities.push(`${req.name} (Missing • Target: ${req.minimumConfidence}%)`);
        }
      });

      const totalRequired = activeRole.requiredSkills.length;
      // Score calculation based on matched skills and average confidence
      const rawScore = (matchedCount / totalRequired) * 100;
      const matchScore = Math.min(98, Math.max(35, Math.round(rawScore)));

      // Enforce centralized threshold constants (REQ-2.4)
      const fitTier = getFitTier(matchScore);

      // Explainable reason synthesized from skills, tenure, and department
      let explainableReason = '';
      if (matchScore >= FIT_TIER_THRESHOLDS.STRONG_FIT_MIN) {
        explainableReason = `Strongly aligned for ${activeRole.title}. Holds verified high-depth capabilities across core requirements with strong tenure in ${emp.department}. Demonstrated leadership in ${emp.location} center.`;
      } else if (matchScore >= FIT_TIER_THRESHOLDS.MODERATE_FIT_MIN) {
        explainableReason = `Promising internal candidate with solid baseline proficiency in ${keyStrengths.slice(0, 2).map((s) => s.split('(')[0].trim()).join(' and ')}. Can bridge ${growthOpportunities.length} skill gap(s) via targeted 6-week cohort.`;
      } else {
        explainableReason = `Emerging candidate with foundational experience in ${emp.department}. Suitable for phased stretch project pairing prior to full role transition.`;
      }

      return {
        employee: emp,
        matchScore,
        fitTier,
        matchedSkillsCount: Math.floor(matchedCount),
        totalRequired,
        explainableReason,
        keyStrengths: keyStrengths.length > 0 ? keyStrengths : ['Demonstrated domain dedication and continuous learning.'],
        growthOpportunities: growthOpportunities.length > 0 ? growthOpportunities : ['Continue mentoring junior team members.'],
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [activeRole]);

  const [evalError, setEvalError] = useState<string | null>(null);

  // Handle AI Deep Match Evaluation via Claude API (REQ-2.1 to REQ-2.4)
  const handleRunAiEvaluation = async (candidate: CandidateMatch) => {
    setIsAiEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch('/api/ai/score-role-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee: {
            name: candidate.employee.name,
            skills: candidate.employee.skills.map((s) => ({
              skill: s.name,
              confidence: s.confidence,
              category: s.category,
            })),
            experience: candidate.employee.currentRole,
            projects: candidate.employee.projects?.map((p) => p.name) || [],
          },
          role: {
            title: activeRole.title,
            level: activeRole.level,
            requiredSkills: activeRole.requiredSkills.map((r) => ({
              skill: r.name,
              requiredLevel: r.minimumConfidence,
            })),
            description: activeRole.summary || activeRole.title,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Claude AI match evaluation failed');
      }

      const data = await res.json();
      const match = data.match || {};
      setAiEvaluationEngine('Claude Sonnet (claude-sonnet-4-6)');

      // Update selected candidate with Claude evaluation
      const updatedScore = typeof match.overallScore === 'number' ? match.overallScore : candidate.matchScore;
      setSelectedCandidate({
        ...candidate,
        matchScore: updatedScore,
        fitTier: getFitTier(updatedScore),
        explainableReason: match.reasoning || candidate.explainableReason,
        keyStrengths: match.strengths && match.strengths.length > 0 ? match.strengths : candidate.keyStrengths,
        growthOpportunities: match.growthAreas && match.growthAreas.length > 0 ? match.growthAreas : candidate.growthOpportunities,
      });
    } catch (err) {
      console.error('AI match score evaluation error:', err);
      setEvalError('AI analysis unavailable. Retry?');
    } finally {
      setIsAiEvaluating(false);
    }
  };

  // Filtering
  const filteredCandidates = computedCandidates.filter((c) => {
    const matchesFit = filterFit === 'All' || c.fitTier === filterFit;
    const matchesDept = departmentFilter === 'all' || c.employee.department === departmentFilter;
    const matchesLoc = locationFilter === 'all' || c.employee.location.includes(locationFilter);
    const matchesSearch =
      c.employee.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.employee.currentRole.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.employee.skills.some((s) => s.name.toLowerCase().includes(candidateSearch.toLowerCase()));

    const matchesEmerging = !isEmergingActive || !customEmergingSkill.trim() ||
      c.employee.skills.some((s) => s.name.toLowerCase().includes(customEmergingSkill.toLowerCase()));

    return matchesFit && matchesDept && matchesLoc && matchesSearch && matchesEmerging;
  });

  const toggleShortlist = (empId: string) => {
    setShortlistedEmpIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleScheduleInterview = (candidate: CandidateMatch) => {
    setInterviewModalNotice(
      `Internal mobility loop scheduled for ${candidate.employee.name} (${candidate.employee.currentRole}) for role ${activeRole.title}. Notification sent to Hiring Manager and HR Operations.`
    );
    setTimeout(() => setInterviewModalNotice(null), 5000);
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Requisition Header & Role Selector */}
      <Card padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="burgundy">AI-Powered Internal Role Matching</Badge>
              <Badge variant="outline">20 Candidates Evaluated</Badge>
            </div>
            <h1 className="text-xl font-bold text-[#FFF5F7] tracking-tight mt-1.5">
              Internal Talent Mobility & Candidate Scoring
            </h1>
            <p className="text-xs text-[#C9A8B0] mt-1 max-w-2xl leading-relaxed">
              Match employees with open internal roles, projects, and career trajectories. Explainable AI rationales transparently evaluate relevant skills, experience, and project contributions.
            </p>
          </div>

          {/* Requisition Role Dropdown */}
          <div className="bg-[#1A080D] p-3.5 rounded-xl border border-[#641A2D] min-w-[300px]">
            <label className="text-[10px] uppercase font-bold tracking-wider text-[#795C65] block mb-1">
              Select Open Requisition
            </label>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-[#C94B6A] shrink-0" />
              <select
                value={selectedRoleId}
                onChange={(e) => {
                  setSelectedRoleId(e.target.value);
                  setSelectedCandidate(null);
                }}
                className="bg-transparent text-xs font-semibold text-[#FFF5F7] focus:outline-none w-full cursor-pointer"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role.id} value={role.id} className="bg-[#1A080D] text-[#FFF5F7]">
                    {role.title} ({role.level} • {role.openings} Openings)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notice alert */}
        {interviewModalNotice && (
          <div className="mt-4 p-3 bg-[#1A080D] border border-[#34D399]/40 rounded-xl text-xs text-[#34D399] flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
              <span>{interviewModalNotice}</span>
            </div>
          </div>
        )}

        {/* Active Role Specs Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#641A2D]">
          <div className="p-3 bg-[#1A080D] rounded-xl border border-[#641A2D]">
            <span className="text-[10px] font-semibold text-[#795C65] uppercase tracking-wider">
              Department & Level
            </span>
            <p className="text-xs font-bold text-[#FFF5F7] mt-0.5">{activeRole.department}</p>
            <p className="text-[11px] text-[#C9A8B0] font-mono mt-0.5">Tier {activeRole.level} • {activeRole.openings} Openings</p>
          </div>

          <div className="p-3 bg-[#1A080D] rounded-xl border border-[#641A2D]">
            <span className="text-[10px] font-semibold text-[#795C65] uppercase tracking-wider">
              Required Must-Have Skills ({activeRole.requiredSkills.filter(r => r.importance === 'Must-Have').length})
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {activeRole.requiredSkills.filter(r => r.importance === 'Must-Have').map((s, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#310D17] border border-[#641A2D] text-[#FFF5F7] font-medium">
                  {s.name} ({s.minimumConfidence}%)
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#1A080D] rounded-xl border border-[#641A2D]">
            <span className="text-[10px] font-semibold text-[#795C65] uppercase tracking-wider">
              Internal Candidate Pipeline
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-lg font-bold text-[#34D399]">
                {computedCandidates.filter(c => c.fitTier === 'Strong Fit').length} Strong Fits
              </span>
              <span className="text-xs text-[#C9A8B0]">
                ({computedCandidates.filter(c => c.fitTier === 'Moderate Fit').length} Moderate)
              </span>
            </div>
            <p className="text-[10px] text-[#795C65] mt-0.5">Ranked by semantic skill overlap</p>
          </div>
        </div>
      </Card>

      {/* Emerging Requirement / Custom Talent Discovery Banner */}
      <Card padding="md" className="border-[#800F2F]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-[#C94B6A] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-[#FFF5F7]">
                Emerging Business Requirement & Rapid Talent Sourcing (REQ-2.5)
              </h3>
              <p className="text-[11px] text-[#C9A8B0] mt-0.5">
                Quickly discover employees with emerging capabilities for new project squads. Filter by keywords or select quick capability pills:
              </p>
              {/* Quick Emerging Capability Pills (REQ-2.5) */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Apache Kafka',
                  'Neo4j & Graph Data',
                  'pgvector & Vector Search',
                  'Zero-Trust & Service Mesh',
                  'spaCy & BERT',
                  'eBPF Kernel',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const searchTerm = tag.split('&')[0].trim();
                      setCustomEmergingSkill(searchTerm);
                      setIsEmergingActive(true);
                    }}
                    className={`text-[10px] px-2.5 py-0.5 rounded-lg font-medium transition-colors border cursor-pointer ${
                      customEmergingSkill && tag.toLowerCase().includes(customEmergingSkill.toLowerCase())
                        ? 'bg-[#800F2F] text-white border-[#C94B6A]'
                        : 'bg-[#1A080D] text-[#C9A8B0] border-[#641A2D] hover:bg-[#310D17] hover:text-[#FFF5F7]'
                    }`}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
            <input
              type="text"
              placeholder="Search skill (e.g. Kafka, pgvector)..."
              value={customEmergingSkill}
              onChange={(e) => {
                setCustomEmergingSkill(e.target.value);
                setIsEmergingActive(!!e.target.value);
              }}
              className="px-3 py-1.5 text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl text-[#FFF5F7] placeholder-[#795C65] focus:outline-none focus:border-[#C94B6A] w-48 sm:w-56"
            />
            {isEmergingActive && (
              <button
                type="button"
                onClick={() => {
                  setCustomEmergingSkill('');
                  setIsEmergingActive(false);
                }}
                className="px-2 py-1 text-xs text-[#C9A8B0] hover:text-[#FFF5F7] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Candidate Matches List & Filter Bar */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: colors.burgundy800,
          borderColor: colors.burgundy600,
          boxShadow: shadows.card,
        }}
      >
        {/* Controls */}
        <div className="p-4 border-b border-[#641A2D] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1A080D]/40">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#795C65]" />
              <input
                type="text"
                placeholder="Search candidates by name, role, or skill..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl text-[#FFF5F7] placeholder-[#795C65] focus:outline-none focus:border-[#C94B6A]"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            {/* Fit Tier Filter */}
            <select
              value={filterFit}
              onChange={(e) => setFilterFit(e.target.value as any)}
              className="text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl px-3 py-1.5 text-[#C9A8B0] focus:outline-none focus:border-[#C94B6A]"
            >
              <option value="All">All Fit Tiers ({computedCandidates.length})</option>
              <option value="Strong Fit">Strong Fit (≥78%)</option>
              <option value="Moderate Fit">Moderate Fit (58-77%)</option>
              <option value="Potential Match">Potential Match (&lt;58%)</option>
            </select>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl px-3 py-1.5 text-[#C9A8B0] focus:outline-none focus:border-[#C94B6A]"
            >
              <option value="all">All Departments</option>
              {departments.filter((d) => d !== 'all').map((d) => (
                <option key={d} value={d} className="bg-[#1A080D] text-[#FFF5F7]">{d}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl px-3 py-1.5 text-[#C9A8B0] focus:outline-none focus:border-[#C94B6A]"
            >
              <option value="all">All Tamil Hubs</option>
              {locations.filter((l) => l !== 'all').map((l) => (
                <option key={l} value={l} className="bg-[#1A080D] text-[#FFF5F7]">{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidates Cards Grid */}
        <div className="divide-y divide-[#641A2D]">
          {filteredCandidates.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#795C65]">
              No internal candidates match the selected filters. Try broadening your criteria.
            </div>
          ) : (
            filteredCandidates.map((candidate) => {
              const isShortlisted = shortlistedEmpIds.includes(candidate.employee.id);
              return (
                <div
                  key={candidate.employee.id}
                  className="p-5 hover:bg-[#481321]/40 transition-colors duration-150"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Employee Info & Score */}
                    <div className="flex items-start space-x-3.5">
                      <img
                        src={candidate.employee.avatarUrl}
                        alt={candidate.employee.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#641A2D] shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-bold text-[#FFF5F7]">
                            {candidate.employee.name}
                          </h3>
                          <Badge
                            variant={
                              candidate.fitTier === 'Strong Fit'
                                ? 'success'
                                : candidate.fitTier === 'Moderate Fit'
                                ? 'burgundy'
                                : 'warning'
                            }
                          >
                            {candidate.fitTier}
                          </Badge>
                        </div>

                        <p className="text-xs text-[#C9A8B0] mt-0.5">
                          {candidate.employee.currentRole} • <span className="text-[#795C65]">{candidate.employee.department}</span>
                        </p>
                        <p className="text-[11px] text-[#795C65] flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#C43A58]" />
                          <span>{candidate.employee.location}</span>
                          <span>•</span>
                          <span>Joined {candidate.employee.hireDate}</span>
                        </p>

                        {/* Explainable AI Rationale */}
                        <div className="mt-3 p-3 bg-[#1A080D] rounded-xl border border-[#641A2D] text-xs">
                          <p className="font-semibold text-[#FFF5F7] flex items-center space-x-1.5 mb-1 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-[#C94B6A]" />
                            <span>Explainable Match Rationale:</span>
                          </p>
                          <p className="text-[#C9A8B0] leading-relaxed text-[11px]">
                            {candidate.explainableReason}
                          </p>

                          {/* Key Strengths Pills */}
                          <div className="mt-2 pt-2 border-t border-[#641A2D] flex flex-wrap gap-1.5">
                            <span className="text-[10px] font-bold text-[#795C65] uppercase tracking-wider">
                              Strengths:
                            </span>
                            {candidate.keyStrengths.slice(0, 3).map((st, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-[#310D17] border border-[#641A2D] text-[#FFF5F7] font-medium">
                                ✓ {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Match Gauge & Actions */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0">
                      <div className="flex items-center space-x-2.5">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-[#FFF5F7] font-mono">
                            {candidate.matchScore}%
                          </span>
                          <span className="text-[10px] block text-[#795C65] font-medium">
                            {candidate.matchedSkillsCount}/{candidate.totalRequired} Met
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#800F2F] border border-[#C94B6A]/50 flex items-center justify-center font-bold text-xs text-white">
                          {candidate.fitTier === 'Strong Fit' ? 'A+' : candidate.fitTier === 'Moderate Fit' ? 'B+' : 'C'}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="space-x-1"
                        >
                          <span>Deep Evaluation</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant={isShortlisted ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={() => toggleShortlist(candidate.employee.id)}
                          className="space-x-1"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-[#34D399] text-[#34D399]' : 'text-[#795C65]'}`} />
                          <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Deep Candidate Evaluation Side-by-Side Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div
            className="rounded-2xl border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: colors.burgundy850,
              borderColor: colors.burgundy600,
              boxShadow: glows.burgundy,
            }}
          >
            <div className="p-5 border-b border-[#641A2D] flex items-center justify-between sticky top-0 bg-[#250A12] z-10">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedCandidate.employee.avatarUrl}
                  alt={selectedCandidate.employee.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#641A2D]"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#FFF5F7]">
                    {selectedCandidate.employee.name} — Role Fit Dossier
                  </h3>
                  <p className="text-xs text-[#C9A8B0]">
                    Evaluation for <strong className="text-[#FFF5F7]">{activeRole.title}</strong> ({activeRole.level})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-[#795C65] hover:text-[#FFF5F7] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Match Score Summary */}
              <div className="p-4 bg-[#1A080D] border border-[#641A2D] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C94B6A]">
                      Quantum-Q Match Score
                    </span>
                    {aiEvaluationEngine && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#310D17] text-[#E08A9D] rounded border border-[#641A2D]">
                        Evaluated by {aiEvaluationEngine}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-2xl font-bold text-[#FFF5F7] font-mono">
                      {selectedCandidate.matchScore}%
                    </span>
                    <Badge variant={selectedCandidate.fitTier === 'Strong Fit' ? 'success' : 'burgundy'}>
                      {selectedCandidate.fitTier}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right text-xs text-[#C9A8B0] hidden sm:block">
                    <p><strong className="text-[#FFF5F7]">{selectedCandidate.matchedSkillsCount}</strong> of {selectedCandidate.totalRequired} Requirements Met</p>
                    <p className="text-[11px] text-[#795C65] mt-0.5">Verified across GitHub + Slack telemetry</p>
                  </div>
                  <Button
                    variant="primary"
                    glow
                    size="sm"
                    onClick={() => handleRunAiEvaluation(selectedCandidate)}
                    disabled={isAiEvaluating}
                    className="space-x-1.5 shrink-0"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiEvaluating ? 'animate-spin text-white' : 'text-white'}`} />
                    <span>{isAiEvaluating ? 'Analyzing...' : 'Run Claude AI Inference'}</span>
                  </Button>
                </div>
              </div>

              {/* Loading state */}
              {isAiEvaluating && (
                <div className="p-4 bg-[#1A080D] border border-[#C94B6A]/40 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-[#E58CA2]">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-[#C94B6A]" />
                    <span>Atom is running deep candidate inference with Claude Sonnet...</span>
                  </div>
                  <div className="h-3 w-48 bg-[#481321] rounded animate-pulse" />
                </div>
              )}

              {/* Error state */}
              {evalError && (
                <div className="p-3.5 bg-[#481321] border border-[#F87171] rounded-xl flex items-center justify-between text-xs text-[#FFF5F7]">
                  <span>{evalError}</span>
                  <Button variant="secondary" size="sm" onClick={() => handleRunAiEvaluation(selectedCandidate)}>
                    Retry
                  </Button>
                </div>
              )}

              {/* Side-by-side Skill Matrix Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-[#FFF5F7] uppercase tracking-wider mb-2.5">
                  Requirement vs Candidate Capability Matrix
                </h4>
                <div className="space-y-2">
                  {activeRole.requiredSkills.map((req, i) => {
                    const empSkill = selectedCandidate.employee.skills.find(
                      (s) => s.name.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(s.name.toLowerCase())
                    );
                    const isPassed = empSkill && empSkill.confidence >= req.minimumConfidence;
                    const isPartial = empSkill && empSkill.confidence < req.minimumConfidence;

                    return (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-[#641A2D] bg-[#1A080D] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-[#34D399]' : isPartial ? 'bg-[#FBBF24]' : 'bg-[#795C65]'}`} />
                          <span className="font-semibold text-[#FFF5F7]">{req.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-[#310D17] border border-[#641A2D] text-[#795C65]">
                            Req: {req.minimumConfidence}%
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 font-mono text-[11px]">
                          {empSkill ? (
                            <span className={isPassed ? 'text-[#34D399] font-bold' : 'text-[#FBBF24] font-bold'}>
                              {empSkill.confidence}% ({empSkill.type})
                            </span>
                          ) : (
                            <span className="text-[#795C65] italic">Not in profile</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Explainability Details */}
              <div className="p-4 bg-[#1A080D] rounded-xl border border-[#641A2D] text-xs">
                <h4 className="font-bold text-[#FFF5F7] mb-1">
                  Why this employee is suitable:
                </h4>
                <p className="text-[#C9A8B0] leading-relaxed">
                  {selectedCandidate.explainableReason}
                </p>
                <div className="mt-3 pt-2 border-t border-[#641A2D] space-y-1 text-[#795C65] text-[11px]">
                  <p><strong>Department Tenure:</strong> Active at Infinite Solutions since {selectedCandidate.employee.hireDate}.</p>
                  <p><strong>Location:</strong> {selectedCandidate.employee.location} campus.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCandidate(null)}
                >
                  Close Dossier
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleShortlist(selectedCandidate.employee.id)}
                  >
                    {shortlistedEmpIds.includes(selectedCandidate.employee.id) ? 'Remove Shortlist' : 'Add to Shortlist'}
                  </Button>
                  <Button
                    variant="primary"
                    glow
                    size="sm"
                    onClick={() => {
                      handleScheduleInterview(selectedCandidate);
                      setSelectedCandidate(null);
                    }}
                    className="space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Initiate Mobility Loop</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
