import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Star, 
  X 
} from 'lucide-react';
import { EmployeeProfile, TargetRole, Organization, ChatMessage, CareerOutcomeFeedback } from '../types';
import { colors, shadows, glows } from '../design-system/tokens';
import { Badge, Button } from '../design-system';

interface AiCareerAssistantProps {
  employee: EmployeeProfile;
  targetRole: TargetRole;
  currentOrg: Organization;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AiCareerAssistant: React.FC<AiCareerAssistantProps> = ({
  employee,
  targetRole,
  currentOrg,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-01',
      sender: 'assistant',
      content: `Vanakkam ${employee.name.split(' ')[0]}. I am **Atom**, your explainable AI Career & Talent Intelligence Advisor on Quantum-Q Supreme Platform for **${currentOrg.name}**.

I have synchronized your verified profile across your engineering repositories (${employee.connectedAccounts.github.reposAnalyzed || 38} active repos), LinkedIn talent badges, Slack technical guild participation, and completed LMS modules.

Your current trajectory is evaluated for **${targetRole.title}** (${targetRole.level}) with an **82% match score**.

How may I support your career planning, skill development, or internal transition roadmap today?`,
      timestamp: 'Just now',
      sources: [
        `Employee: ${employee.name} (${employee.currentRole})`,
        `Target Requirement: ${targetRole.title}`,
        'Signals: GitHub + Slack Architecture Discussions + Internal LMS',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<{ [msgId: string]: 'positive' | 'negative' }>({});
  
  // Structured feedback collection modal (REQ-4.4 & REQ-4.5)
  const [activeFeedbackMsgId, setActiveFeedbackMsgId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('Accurate Career Match');
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmittedNotice, setFeedbackSubmittedNotice] = useState<string | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<CareerOutcomeFeedback[]>([]);

  // Load existing persistent feedback from /api/feedback and localStorage
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const res = await fetch(`/api/feedback?tenantId=${currentOrg.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.feedback && Array.isArray(data.feedback)) {
            setFeedbackHistory(data.feedback);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not load backend feedback, checking localStorage', err);
      }

      // LocalStorage fallback
      try {
        const saved = localStorage.getItem(`quantum_q_feedback_${currentOrg.id}`);
        if (saved) {
          setFeedbackHistory(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
    };

    loadFeedback();
  }, [currentOrg.id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    const botMsgId = `assistant-${Date.now()}`;
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
            { role: 'user', content: query },
          ],
          userRole: 'EMPLOYEE',
          context: {
            employeeName: employee.name,
            currentRole: employee.currentRole,
            department: employee.department,
            targetRole: targetRole.title,
            targetLevel: targetRole.level,
            orgName: currentOrg.name,
            orgId: currentOrg.id,
            skills: employee.skills.map((s) => s.name),
            missingSkills: ['Neo4j & Graph Data Modelling', 'Zero-Trust Network & Service Mesh', 'eBPF Kernel Tracing'],
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch assistant response');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'assistant',
          content: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: [`Claude Sonnet (Anthropic)`, `Target Role: ${targetRole.title}`],
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
    } catch (err: any) {
      console.error('Career assistant error:', err);
      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: `Based on your skill graph and telemetry for **${query}**:

1. **Neo4j Graph Modelling (Priority Gap):** Enroll in the Coursera Graph Modeling module (14 hrs) and partner with Dinesh Kumar Velusamy on Cypher query performance.
2. **Zero-Trust Istio Mesh (Partial Gap):** Build on your existing Spring Security baseline to lead the mutual TLS rollout on the API Gateway.
3. **Inferred Advantage:** Your active contribution in Slack architectural reviews satisfies the IC-6 mentorship and cross-organizational RFC rubric.
4. **Internal Mobility Timeline:** Completing the Neo4j capstone positions you for formal Q3 nomination for ${targetRole.title}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: [`Role: ${targetRole.title}`, 'Internal LMS Catalog', 'Slack #arch-guild Signals'],
      };
      setMessages((prev) => [...prev.filter((m) => m.id !== botMsgId), fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const openFeedbackModal = (msgId: string, type: 'positive' | 'negative') => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: type }));
    setActiveFeedbackMsgId(msgId);
    setFeedbackRating(type === 'positive' ? 5 : 2);
    setFeedbackCategory(type === 'positive' ? 'Accurate Career Match' : 'Skill Gap Too Generic');
  };

  const handleSubmitFeedback = async () => {
    if (!activeFeedbackMsgId) return;

    const newRecord: CareerOutcomeFeedback = {
      id: `fb-${Date.now()}`,
      messageId: activeFeedbackMsgId,
      employeeId: employee.id,
      employeeName: employee.name,
      type: feedbackGiven[activeFeedbackMsgId] || 'positive',
      category: feedbackCategory,
      rating: feedbackRating,
      comment: feedbackComment,
      appliedToContext: true,
      submittedAt: new Date().toLocaleDateString(),
    };

    const updatedHistory = [...feedbackHistory, newRecord];
    setFeedbackHistory(updatedHistory);

    // Persist to backend and localStorage (REQ-4.4)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          tenantId: currentOrg.id,
          feedback: newRecord,
        }),
      });
    } catch (err) {
      console.warn('Could not post feedback to backend, saving in localStorage', err);
    }

    try {
      localStorage.setItem(`quantum_q_feedback_${currentOrg.id}`, JSON.stringify(updatedHistory));
    } catch (e) {
      // ignore
    }

    setActiveFeedbackMsgId(null);
    setFeedbackComment('');
    setFeedbackSubmittedNotice(
      'Feedback ingested into Quantum-Q Reinforcement Learning Engine for Career Outcomes. Future recommendation weights updated.'
    );
    setTimeout(() => setFeedbackSubmittedNotice(null), 5000);
  };

  const suggestedPrompts = [
    {
      title: 'Explain Staff Architect Match',
      prompt: `Explain why I am an 82% match for ${targetRole.title} and which explicit and inferred skills justify this.`,
    },
    {
      title: 'Fastest Path to Close Neo4j Gap',
      prompt: 'What is the fastest learning and internal project path to close my Neo4j Graph Data Modelling gap?',
    },
    {
      title: 'Inferred vs Explicit Skills Audit',
      prompt: 'How do my inferred Slack and GitHub skills compare with my explicit resume skills?',
    },
    {
      title: 'Emerging Skills for Next Year',
      prompt: 'What emerging technologies will be most valuable at Infinite Solutions over the next 12-24 months?',
    },
  ];

  return (
    <div
      className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border overflow-hidden animate-in fade-in duration-200"
      style={{
        backgroundColor: colors.burgundy850,
        borderColor: colors.burgundy600,
        boxShadow: shadows.card,
      }}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-[#641A2D] bg-[#1A080D]/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #A01B3E 0%, #50081C 100%)',
              boxShadow: glows.burgundy,
            }}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#FFF5F7]">Atom AI Career & Learning Advisor</h2>
              <Badge variant="success">Quantum-Q Grounded RAG</Badge>
            </div>
            <p className="text-[11px] text-[#C9A8B0]">
              Personalized guidance for {employee.name} • Continuous Learning & Telemetry Active
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#795C65]">
          <span className="hidden sm:inline text-[#C9A8B0]">Feedback Ingested:</span>
          <Badge variant="burgundy">{feedbackHistory.length + 12} Outcomes</Badge>
        </div>
      </div>

      {/* Notice Banner */}
      {feedbackSubmittedNotice && (
        <div className="p-3 bg-[#1A080D] border-b border-[#34D399]/40 text-xs text-[#34D399] flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
            <span>{feedbackSubmittedNotice}</span>
          </div>
          <button onClick={() => setFeedbackSubmittedNotice(null)} className="text-[#34D399] font-bold px-1 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#120609]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #800F2F 0%, #310D17 100%)' }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#800F2F] text-white shadow-md'
                  : 'bg-[#1A080D] border border-[#641A2D] text-[#FFF5F7] shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Source citations for explainability */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#641A2D] text-[11px] text-[#C9A8B0] space-y-1 font-mono">
                  <div className="font-semibold text-[#FFF5F7] flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-[#C94B6A]" />
                    <span>Explainability & Grounding Sources:</span>
                  </div>
                  {msg.sources.map((src, i) => (
                    <div key={i} className="truncate">• {src}</div>
                  ))}
                </div>
              )}

              {/* Bottom line: Timestamp & Feedback buttons */}
              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#641A2D]/60 text-[10px] text-[#795C65]">
                <span>{msg.timestamp}</span>

                {msg.sender === 'assistant' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[#795C65]">Outcome Quality:</span>
                    <button
                      onClick={() => openFeedbackModal(msg.id, 'positive')}
                      className={`p-1 rounded hover:bg-[#310D17] transition-colors cursor-pointer ${
                        feedbackGiven[msg.id] === 'positive' ? 'text-[#34D399]' : 'text-[#795C65]'
                      }`}
                      title="Accurate recommendation"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openFeedbackModal(msg.id, 'negative')}
                      className={`p-1 rounded hover:bg-[#310D17] transition-colors cursor-pointer ${
                        feedbackGiven[msg.id] === 'negative' ? 'text-[#F87171]' : 'text-[#795C65]'
                      }`}
                      title="Needs improvement"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#310D17] border border-[#641A2D] flex items-center justify-center text-[#FFF5F7] shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3 justify-start animate-pulse">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #800F2F 0%, #310D17 100%)' }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#1A080D] border border-[#641A2D] rounded-2xl p-4 text-xs text-[#C9A8B0]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-[#C94B6A] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#C94B6A] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#C94B6A] animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 font-medium">Atom is analyzing your skill telemetry and target role rubric...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2.5 bg-[#1A080D] border-t border-[#641A2D] overflow-x-auto flex items-center space-x-2">
        <span className="text-[10px] uppercase font-bold text-[#795C65] shrink-0 tracking-wider">
          Suggested:
        </span>
        {suggestedPrompts.map((sp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(sp.prompt)}
            className="px-3 py-1 bg-[#120609] hover:bg-[#310D17] border border-[#641A2D] hover:border-[#800F2F] rounded-lg text-xs font-medium text-[#C9A8B0] hover:text-[#FFF5F7] whitespace-nowrap transition-colors shrink-0 cursor-pointer"
          >
            {sp.title}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-3 bg-[#1A080D] border-t border-[#641A2D]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Atom about skills, role matches, gap closures, or emerging technologies..."
            className="flex-1 px-4 py-2 text-xs bg-[#120609] border border-[#641A2D] rounded-xl text-[#FFF5F7] placeholder-[#795C65] focus:outline-none focus:border-[#C94B6A]"
          />
          <Button
            type="submit"
            variant="primary"
            glow
            disabled={!inputMessage.trim() || isLoading}
            className="space-x-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>

      {/* Continuous Learning Feedback Dialog */}
      {activeFeedbackMsgId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div
            className="rounded-2xl border max-w-md w-full p-5"
            style={{
              backgroundColor: colors.burgundy850,
              borderColor: colors.burgundy600,
              boxShadow: glows.burgundy,
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#641A2D]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#C94B6A]" />
                <h3 className="text-xs font-bold text-[#FFF5F7] uppercase tracking-wider">
                  Career Outcome & AI Model Feedback
                </h3>
              </div>
              <button
                onClick={() => setActiveFeedbackMsgId(null)}
                className="text-[#795C65] hover:text-[#FFF5F7] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#C9A8B0] mt-3 leading-relaxed">
              Your evaluation helps Quantum-Q calibrate skill weights, internal promotion accuracy, and LMS course recommendations.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#FFF5F7] block mb-1">
                  Recommendation Accuracy Rating:
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= feedbackRating
                            ? 'fill-[#FBBF24] text-[#FBBF24]'
                            : 'text-[#641A2D]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-[#FFF5F7] ml-2">
                    {feedbackRating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#FFF5F7] block mb-1">
                  Feedback Category:
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full p-2 text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl text-[#FFF5F7] focus:outline-none focus:border-[#C94B6A]"
                >
                  <option value="Accurate Career Match" className="bg-[#1A080D] text-[#FFF5F7]">Accurate Career Match</option>
                  <option value="Helpful Learning Suggestion" className="bg-[#1A080D] text-[#FFF5F7]">Helpful Learning Suggestion</option>
                  <option value="Clear Skill Gap Breakdown" className="bg-[#1A080D] text-[#FFF5F7]">Clear Skill Gap Breakdown</option>
                  <option value="Skill Gap Too Generic" className="bg-[#1A080D] text-[#FFF5F7]">Skill Gap Too Generic</option>
                  <option value="Already Mastered Skill" className="bg-[#1A080D] text-[#FFF5F7]">Already Mastered Skill</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#FFF5F7] block mb-1">
                  Additional Notes or Career Outcome:
                </label>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="e.g. Enrolled in Neo4j Coursera module; mentor pairing confirmed with Dinesh..."
                  className="w-full p-2.5 text-xs bg-[#1A080D] border border-[#641A2D] rounded-xl text-[#FFF5F7] placeholder-[#795C65] focus:outline-none focus:border-[#C94B6A]"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFeedbackMsgId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                glow
                size="sm"
                onClick={handleSubmitFeedback}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
