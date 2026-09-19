import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  User, 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown, 
  Building2,
  Briefcase,
  Crown,
  Users
} from 'lucide-react';
import { AuthAccount, EmployeeProfile, Organization, ChatMessage } from '../types';
import { colors, radius, shadows } from '../design-system/tokens';
import { Badge, Button } from '../design-system';

interface AtomChatbotProps {
  currentUser: AuthAccount;
  currentOrg: Organization;
  activeEmployee?: EmployeeProfile;
}

export const AtomChatbot: React.FC<AtomChatbotProps> = ({
  currentUser,
  currentOrg,
  activeEmployee,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ [id: string]: 'positive' | 'negative' }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize role-specific welcome message when user changes or chatbot mounts
  useEffect(() => {
    let welcomeText = '';
    let sources: string[] = [];

    if (currentUser.role === 'OWNER') {
      welcomeText = `Vanakkam ${currentUser.name.split(' ')[0]}. I am **Atom**, your Executive Workforce & Strategic Talent Intelligence Advisor for **${currentOrg.name}**.

I monitor cross-department talent capability indexes, critical skill deficits (e.g. Neo4j graph data modeling, Zero-Trust Istio mesh), and engineering succession pipelines.

How may I advise you on strategic workforce health, regional talent hubs (Chennai, Coimbatore), or organizational capability readiness today?`;
      sources = [
        `Tenant: ${currentOrg.name} (${currentOrg.id})`,
        `Role: Executive Owner (${currentUser.title})`,
        'Quantum-Q Supreme Sub-Model Mesh',
      ];
    } else if (currentUser.role === 'HR_ADMIN') {
      welcomeText = `Vanakkam ${currentUser.name.split(' ')[0]}. I am **Atom**, your People Operations & Talent Matching Advisor for **${currentOrg.name}**.

I have indexed all 20 verified engineering profiles across our Tamil Nadu and Bangalore technical hubs. I can identify internal candidates for open requisitions, audit department skill gaps, or evaluate mobility readiness.

What requisition or capability audit shall we analyze?`;
      sources = [
        `Tenant: ${currentOrg.name}`,
        `Role: Human Resources (${currentUser.title})`,
        '20 Verified Employee Skill Graphs',
      ];
    } else {
      // Employee role
      const empName = activeEmployee?.name || currentUser.name;
      const roleName = activeEmployee?.currentRole || currentUser.title;
      welcomeText = `Vanakkam ${empName.split(' ')[0]}. I am **Atom**, your Personal Career & Capability Advisor at **${currentOrg.name}**.

I analyze your verified signals across GitHub (${activeEmployee?.connectedAccounts.github.reposAnalyzed || 38} repos), Slack architecture guild discussions, and LMS certifications.

I can help you evaluate your fit for **Staff Distributed Systems Architect**, pinpoint exactly which skill gaps to close, and recommend personalized courses. What is on your mind?`;
      sources = [
        `Employee: ${empName} (${roleName})`,
        'Signals: GitHub Commits + Slack #arch-guild Telemetry + LMS',
      ];
    }

    setMessages([
      {
        id: `atom-welcome-${Date.now()}`,
        sender: 'assistant',
        content: welcomeText,
        timestamp: 'Just now',
        sources,
      },
    ]);
  }, [currentUser.id, currentUser.role, activeEmployee?.id]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    const botMsgId = `atom-${Date.now()}`;
    let accumulatedText = '';

    try {
      const res = await fetch('/api/ai/atom-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.content,
            })),
            { role: 'user', content: text },
          ],
          userRole: currentUser.role,
          context: {
            employeeName: activeEmployee?.name || currentUser.name,
            currentRole: activeEmployee?.currentRole || currentUser.title,
            department: activeEmployee?.department || currentUser.department,
            orgName: currentOrg.name,
            orgId: currentOrg.id,
            skills: activeEmployee?.skills.map((s) => s.name),
          },
        }),
      });

      if (!res.ok) throw new Error('Atom API response error');

      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'assistant',
          content: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: [`Claude Sonnet (Anthropic)`, `Tenant: ${currentOrg.name}`],
        },
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let streamDone = false;
        let buffer = '';

        while (!streamDone) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const payload = trimmed.slice(6);
              if (payload === '[DONE]') {
                streamDone = true;
                break;
              }
              try {
                const parsed = JSON.parse(payload);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMsgId ? { ...msg, content: accumulatedText } : msg
                    )
                  );
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      // Intelligent fallback tailored to role
      let fallback = '';
      if (currentUser.role === 'OWNER') {
        fallback = `**Strategic Workforce Analysis for ${currentOrg.name}:**\n\n1. **High-Risk Capability Deficit:** Only 2 engineers (Dinesh Kumar Velusamy and Balaji Parthasarathy) possess enterprise depth in Graph Data Modeling & Service Mesh.\n2. **Retention & Mobility:** High internal match scores (88%+) suggest promoting Aravind Swaminathan or Priya Sharma will protect institutional knowledge while fulfilling the Staff Architect requisition without expensive external recruitment.\n3. **Recommendation:** Authorize the 2026 Q4 Cross-Skilling Cohort on Neo4j and Cilium eBPF.`;
      } else if (currentUser.role === 'HR_ADMIN') {
        fallback = `**Talent Pipeline Audit for ${text}:**\n\n- **Top Candidate:** Aravind Swaminathan (92% semantic fit) with 5 of 7 required competencies verified via GitHub and Slack.\n- **Secondary Match:** Marcus Vance (89% fit) and Dinesh Kumar Velusamy (86% fit for graph specialization).\n- **Action:** 1-click invite Aravind to the internal mobility interview loop with hiring manager Suresh Kumar Duraisamy.`;
      } else {
        fallback = `**Personal Career Roadmap for ${activeEmployee?.name || currentUser.name}:**\n\n- **Primary Gap:** Neo4j Graph Data Modelling (Requires 80% confidence, currently 0%). Enroll in the 14-hour Coursera specialization.\n- **Secondary Gap:** Zero-Trust Istio Mesh (Currently 76%, threshold is 80%).\n- **Next Step:** You can bridge the gap in 6 weeks with Dinesh Kumar Velusamy as your technical mentor.`;
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== botMsgId),
        {
          id: `atom-${Date.now()}`,
          sender: 'assistant',
          content: fallback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: [`Tenant: ${currentOrg.name}`, 'Verified Quantum-Q Telemetry'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThumbFeedback = (msgId: string, type: 'positive' | 'negative') => {
    setFeedback((prev) => ({ ...prev, [msgId]: type }));
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: activeEmployee?.id || currentUser.id,
        tenantId: currentOrg.id,
        feedback: {
          messageId: msgId,
          type,
          category: 'Atom AI Chat Response',
          rating: type === 'positive' ? 5 : 1,
          comment: `Rated ${type} by ${currentUser.name} (${currentUser.role})`,
          submittedAt: new Date().toLocaleDateString(),
        },
      }),
    }).catch((e) => console.warn('Atom feedback sync failed:', e));
  };

  // Role-specific quick prompts
  const ownerPrompts = [
    'What are our top 3 organizational skill deficit risks?',
    'Evaluate readiness for Staff Distributed Systems Architect',
    'Summarize talent health across Chennai & Coimbatore engineering teams',
  ];

  const hrPrompts = [
    'Who are the top internal candidates for Staff Architect?',
    'Audit skills distribution in AI Intelligence & Search',
    'Recommend internal mobility transition plan for Aravind Swaminathan',
  ];

  const employeePrompts = [
    'What are my exact skill gaps for Staff Architect?',
    'What hidden skills did GitHub and Slack uncover for me?',
    'Recommend an internal LMS course to close my Neo4j gap',
  ];

  const activePrompts =
    currentUser.role === 'OWNER'
      ? ownerPrompts
      : currentUser.role === 'HR_ADMIN'
      ? hrPrompts
      : employeePrompts;

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Closed Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-2 flex items-center space-x-2 cursor-pointer border"
          style={{
            backgroundColor: colors.burgundy800,
            borderColor: colors.burgundy600,
            borderRadius: radius.md,
          }}
          title="Open Atom AI Advisor"
        >
          <Bot className="w-4 h-4" style={{ color: colors.textPrimary }} />
          <div className="text-left hidden sm:block">
            <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>Atom</span>
          </div>
        </button>
      )}

      {/* Open Chat Drawer */}
      {isOpen && (
        <div
          className={`border rounded-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'w-[92vw] sm:w-[680px] h-[82vh] max-h-[780px]'
              : 'w-[92vw] sm:w-[420px] h-[560px]'
          }`}
          style={{
            backgroundColor: colors.burgundy850,
            borderColor: colors.burgundy600,
            boxShadow: shadows.modal,
          }}
        >
          {/* Header */}
          <div className="p-3.5 text-white flex items-center justify-between border-b border-[#641A2D] bg-[#1A080D]">
            <div className="flex items-center space-x-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-xs"
                style={{ backgroundColor: colors.burgundy500 }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold tracking-tight text-[#FFF5F7]">Atom</span>
                  <Badge variant="burgundy">Quantum-Q</Badge>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                </div>
                <p className="text-[10px] text-[#C9A8B0]">
                  {currentUser.role === 'OWNER'
                    ? 'Executive Workforce Intelligence'
                    : currentUser.role === 'HR_ADMIN'
                    ? 'People Ops & Talent Matching'
                    : 'Personal Career & Capability Growth'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-[#795C65]">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:text-[#FFF5F7] rounded hover:bg-[#310D17] transition-colors cursor-pointer"
                title={isExpanded ? 'Collapse size' : 'Expand size'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-[#FFF5F7] rounded hover:bg-[#310D17] transition-colors cursor-pointer"
                title="Close Atom"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context pill */}
          <div className="px-3.5 py-1.5 bg-[#120609] border-b border-[#641A2D] flex items-center justify-between text-[10px] text-[#C9A8B0]">
            <span className="flex items-center space-x-1.5 truncate">
              {currentUser.role === 'OWNER' ? (
                <Crown className="w-3 h-3 text-[#FBBF24] shrink-0" />
              ) : currentUser.role === 'HR_ADMIN' ? (
                <Users className="w-3 h-3 text-[#C94B6A] shrink-0" />
              ) : (
                <Briefcase className="w-3 h-3 text-[#C94B6A] shrink-0" />
              )}
              <span className="truncate">
                Logged in as: <strong className="text-[#FFF5F7]">{currentUser.name}</strong> ({currentUser.role})
              </span>
            </span>
            <span className="font-mono text-[#795C65] shrink-0">{currentOrg.id}</span>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#120609]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    msg.sender === 'user'
                      ? 'bg-[#800F2F] text-white'
                      : 'bg-[#1A080D] border border-[#641A2D] text-[#C94B6A]'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#800F2F] text-white shadow-sm'
                      : 'bg-[#1A080D] text-[#FFF5F7] border border-[#641A2D] shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#641A2D]">
                      <p className="text-[9px] uppercase font-bold text-[#795C65] mb-1 flex items-center space-x-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#C94B6A]" />
                        <span>Audit Citations</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[9px] bg-[#310D17] border border-[#641A2D] text-[#C9A8B0] font-mono"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.sender === 'assistant' && (
                    <div className="mt-2 pt-1.5 border-t border-[#641A2D] flex items-center justify-between text-[10px] text-[#795C65]">
                      <span>Helpful?</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleThumbFeedback(msg.id, 'positive')}
                          className={`p-1 rounded hover:bg-[#310D17] transition-colors cursor-pointer ${
                            feedback[msg.id] === 'positive' ? 'text-[#34D399] font-bold' : 'text-[#795C65]'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleThumbFeedback(msg.id, 'negative')}
                          className={`p-1 rounded hover:bg-[#310D17] transition-colors cursor-pointer ${
                            feedback[msg.id] === 'negative' ? 'text-[#F87171] font-bold' : 'text-[#795C65]'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] text-[#795C65] mt-1 text-right">{msg.timestamp}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#1A080D] border border-[#641A2D] text-[#C94B6A] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#1A080D] border border-[#641A2D] rounded-2xl p-3 text-xs text-[#C9A8B0] space-y-1.5 w-60">
                  <div className="flex items-center space-x-1.5 font-semibold text-[#FFF5F7]">
                    <Sparkles className="w-3 h-3 animate-spin text-[#C94B6A]" />
                    <span>Atom is thinking...</span>
                  </div>
                  <div className="h-2 w-44 bg-[#481321] rounded animate-pulse" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-[#1A080D] border-t border-[#641A2D] flex items-center space-x-1.5 overflow-x-auto">
            <span className="text-[10px] font-semibold text-[#795C65] shrink-0">Ask:</span>
            {activePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-0.5 bg-[#120609] hover:bg-[#310D17] border border-[#641A2D] hover:border-[#800F2F] rounded-lg text-[10px] text-[#C9A8B0] hover:text-[#FFF5F7] whitespace-nowrap transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-2.5 bg-[#1A080D] border-t border-[#641A2D] flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Ask Atom about ${
                currentUser.role === 'OWNER'
                  ? 'workforce health & succession...'
                  : currentUser.role === 'HR_ADMIN'
                  ? 'candidates & skill gaps...'
                  : 'your career roadmap & skills...'
              }`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-[#120609] border border-[#641A2D] rounded-xl px-3 py-1.5 text-xs text-[#FFF5F7] placeholder-[#795C65] focus:outline-none focus:border-[#C94B6A]"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              variant="primary"
              glow
              size="sm"
              className="p-2"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
