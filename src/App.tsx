import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { OwnerDashboard } from './components/OwnerDashboard';
import { HRDashboard } from './components/HRDashboard';
import { EmployeeProfileView } from './components/EmployeeProfileView';
import { GapAnalysisView } from './components/GapAnalysisView';
import { WorkforceMatchingView } from './components/WorkforceMatchingView';
import { AiCareerAssistant } from './components/AiCareerAssistant';
import { AuthServiceCodeHub } from './components/AuthServiceCodeHub';
import { AtomChatbot } from './components/AtomChatbot';
import { 
  SUPREME_PLATFORM, 
  INITIAL_ORGANIZATIONS, 
  DEMO_OWNERS, 
  DEMO_HR_ADMINS, 
  INITIAL_EMPLOYEES, 
  TARGET_ROLES 
} from './data/mockData';
import { Organization, AuthAccount, EmployeeProfile, TargetRole } from './types';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainApp() {
  const { isDark } = useTheme();
  // Session storage initialization with fallback
  const [currentUser, setCurrentUser] = useState<AuthAccount | null>(() => {
    try {
      const saved = localStorage.getItem('quantum_q_active_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default to Company Owner (Karthikeyan Natarajan) for immediate demo readiness
    return DEMO_OWNERS[0];
  });

  const [currentOrg] = useState<Organization>(INITIAL_ORGANIZATIONS[0]); // Infinite Solutions (INF-SOL-2026)
  const [allEmployees, setAllEmployees] = useState<EmployeeProfile[]>(INITIAL_EMPLOYEES);
  const [activeEmployee, setActiveEmployee] = useState<EmployeeProfile>(INITIAL_EMPLOYEES[0]);
  const [activeTab, setActiveTab] = useState<string>('owner-dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [atomInitialPrompt, setAtomInitialPrompt] = useState<string | undefined>(undefined);

  // Dynamically select target role based on the active employee's department and specialization
  const employeeTargetRole = useMemo<TargetRole>(() => {
    if (activeEmployee.department.includes('AI') || activeEmployee.skills.some((s) => s.category.includes('Data') || s.name.includes('PyTorch') || s.name.includes('vector'))) {
      return TARGET_ROLES[1] || TARGET_ROLES[0]; // Principal AI/ML Architect
    }
    if (activeEmployee.currentRole.includes('Manager') || activeEmployee.skills.some((s) => s.category.includes('Leadership'))) {
      return TARGET_ROLES[2] || TARGET_ROLES[0]; // Engineering Manager
    }
    return TARGET_ROLES[0]; // Staff Distributed Systems Architect
  }, [activeEmployee.id, activeEmployee.department, activeEmployee.currentRole]);

  // Initial load from persistent server database
  useEffect(() => {
    let isMounted = true;
    async function fetchDatabaseEmployees() {
      try {
        const res = await fetch('/api/employees');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.employees && data.employees.length > 0) {
            setAllEmployees(data.employees);
            setActiveEmployee((current) => {
              const matched = data.employees.find((e: EmployeeProfile) => e.id === current.id);
              return matched || data.employees[0];
            });
          }
        }
      } catch (err) {
        console.warn('Using client fallback dataset, server database not yet reached:', err);
      }
    }
    fetchDatabaseEmployees();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync tab and active subject with role on user login/switch
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('quantum_q_active_user', JSON.stringify(currentUser));
      } catch (e) {
        console.error(e);
      }

      if (currentUser.role === 'OWNER') {
        setActiveTab('owner-dashboard');
      } else if (currentUser.role === 'HR_ADMIN') {
        setActiveTab('hr-dashboard');
      } else {
        // Employee login: automatically anchor to this specific employee
        setActiveTab('employee-profile');
        const matchedEmp = allEmployees.find(
          (e) => e.id === currentUser.employeeProfileId || e.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        if (matchedEmp) {
          setActiveEmployee(matchedEmp);
        }
      }
    }
  }, [currentUser?.id, currentUser?.role]);

  const handleLogin = (account: AuthAccount, empProfile?: EmployeeProfile) => {
    setCurrentUser(account);
    if (empProfile) {
      setActiveEmployee(empProfile);
    } else if (account.role === 'EMPLOYEE') {
      const matched = allEmployees.find((e) => e.id === account.employeeProfileId || e.email === account.email);
      if (matched) setActiveEmployee(matched);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('quantum_q_active_user');
    setCurrentUser(null);
  };

  const handleUpdateActiveEmployee = async (updated: EmployeeProfile) => {
    setActiveEmployee(updated);
    setAllEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    try {
      await fetch(`/api/employees/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Could not persist employee update to server database:', err);
    }
  };

  const handleOpenAtomWithPrompt = (prompt: string) => {
    setAtomInitialPrompt(prompt);
    setActiveTab('atom-advisor');
  };

  // If unauthenticated, show the dedicated Enterprise Login Page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex font-sans antialiased" style={{ backgroundColor: 'var(--color-burgundy-900)', color: 'var(--color-text-primary)' }}>
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        currentUser={currentUser}
        currentOrg={currentOrg}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeEmployee={activeEmployee}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Area (padded on desktop for fixed sidebar) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-h-screen min-w-0" style={{ backgroundColor: 'var(--color-burgundy-900)' }}>
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          activeEmployee={activeEmployee}
          allEmployees={allEmployees}
          onSelectEmployee={(emp) => {
            setActiveEmployee(emp);
            if (activeTab === 'hr-dashboard') {
              setActiveTab('employee-profile');
            }
          }}
          currentOrg={currentOrg}
          onLogout={handleLogout}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenAtom={() => setActiveTab('atom-advisor')}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
          {/* Owner Executive Cockpit */}
          {activeTab === 'owner-dashboard' && (
            <OwnerDashboard
              currentUser={currentUser}
              currentOrg={currentOrg}
              employees={allEmployees}
              onNavigateToHRMatching={() => setActiveTab('hr-matching')}
              onNavigateToProfiles={() => setActiveTab('hr-dashboard')}
              onOpenAtomWithPrompt={handleOpenAtomWithPrompt}
            />
          )}

          {/* HR Talent Directory & Workforce View */}
          {activeTab === 'hr-dashboard' && (
            <HRDashboard
              currentUser={currentUser}
              currentOrg={currentOrg}
              employees={allEmployees}
              onSelectEmployee={(emp) => {
                setActiveEmployee(emp);
                setActiveTab('employee-profile');
              }}
              onNavigateToMatching={() => setActiveTab('hr-matching')}
              onOpenAtomWithPrompt={handleOpenAtomWithPrompt}
            />
          )}

          {/* Employee Dynamic Skill Profile */}
          {activeTab === 'employee-profile' && (
            <EmployeeProfileView
              profile={activeEmployee}
              onUpdateProfile={handleUpdateActiveEmployee}
              onNavigateToGaps={() => setActiveTab('gap-analysis')}
            />
          )}

          {/* Skill Gap Analysis & Mobility Roadmap */}
          {activeTab === 'gap-analysis' && (
            <GapAnalysisView
              employee={activeEmployee}
              onOpenAssistantWithPrompt={handleOpenAtomWithPrompt}
            />
          )}

          {/* Internal Role Matching & Candidate Scoring */}
          {activeTab === 'hr-matching' && <WorkforceMatchingView />}

          {/* Dedicated Atom Career & Talent Intelligence Advisor */}
          {activeTab === 'atom-advisor' && (
            <AiCareerAssistant
              employee={activeEmployee}
              targetRole={employeeTargetRole}
              currentOrg={currentOrg}
              initialPrompt={atomInitialPrompt}
              onClearInitialPrompt={() => setAtomInitialPrompt(undefined)}
            />
          )}

          {/* Platform Architecture & Security Governance (Visible only to Company Owner/CTO) */}
          {activeTab === 'auth-service-code' && currentUser.role === 'OWNER' && (
            <AuthServiceCodeHub />
          )}
        </main>

        {/* Global Floating Chatbot 'Atom' Available All Over The Site */}
        <AtomChatbot
          currentUser={currentUser}
          currentOrg={currentOrg}
          activeEmployee={activeEmployee}
        />

        {/* Enterprise Footer */}
        <footer className="border-t py-4 text-xs" style={{ borderColor: 'var(--color-burgundy-600)', backgroundColor: 'var(--color-burgundy-950)', color: 'var(--color-text-muted)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
            <span>Quantum-Q · Infinite Solutions</span>
            <span>{currentUser.name}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
