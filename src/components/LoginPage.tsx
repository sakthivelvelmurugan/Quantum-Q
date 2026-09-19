import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  Search,
} from 'lucide-react';
import { AuthAccount, UserRole, EmployeeProfile } from '../types';
import { DEMO_OWNERS, DEMO_HR_ADMINS, INITIAL_EMPLOYEES } from '../data/mockData';
import { QuantumQLogo } from './QuantumQLogo';
import { colors, radius } from '../design-system/tokens';
import { Button, Badge } from '../design-system';
import { ThemeToggle } from '../context/ThemeContext';

interface LoginPageProps {
  onLogin: (account: AuthAccount, employeeProfile?: EmployeeProfile) => void;
}

const fieldStyle: React.CSSProperties = {
  backgroundColor: colors.burgundy900,
  border: `1px solid ${colors.burgundy600}`,
  color: colors.textPrimary,
  borderRadius: radius.md,
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>('OWNER');
  const [demoRoleFilter, setDemoRoleFilter] = useState<UserRole>('OWNER');
  const [orgIdInput, setOrgIdInput] = useState('INF-SOL-2026');
  const [emailInput, setEmailInput] = useState(DEMO_OWNERS[0].email);
  const [passwordInput, setPasswordInput] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showAllEmployees, setShowAllEmployees] = useState(false);
  const [showDemoLogin, setShowDemoLogin] = useState(false);

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRoleTab(role);
    setDemoRoleFilter(role);
    setErrorMessage(null);

    if (role === 'OWNER') {
      setEmailInput(DEMO_OWNERS[0].email);
    } else if (role === 'HR_ADMIN') {
      setEmailInput(DEMO_HR_ADMINS[0].email);
    } else {
      setEmailInput(INITIAL_EMPLOYEES[0].email);
    }
  };

  const handleDemoRoleFilterChange = (role: UserRole) => {
    setDemoRoleFilter(role);
    setSelectedRoleTab(role);
    setErrorMessage(null);

    if (role === 'OWNER') {
      setEmailInput(DEMO_OWNERS[0].email);
    } else if (role === 'HR_ADMIN') {
      setEmailInput(DEMO_HR_ADMINS[0].email);
    } else {
      setEmailInput(INITIAL_EMPLOYEES[0].email);
    }
  };

  const isFormValid = useMemo(() => {
    return orgIdInput.trim().length > 0 && emailInput.trim().length > 0 && passwordInput.trim().length > 0;
  }, [orgIdInput, emailInput, passwordInput]);

  const executeAuthentication = (account: AuthAccount, empProfile?: EmployeeProfile) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      onLogin(account, empProfile);
    }, 450);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (orgIdInput.trim().toUpperCase() !== 'INF-SOL-2026') {
      setErrorMessage('Invalid Organization ID. Please use the demo tenant ID: INF-SOL-2026 (Infinite Solutions).');
      return;
    }

    const cleanEmail = emailInput.trim().toLowerCase();

    const owner = DEMO_OWNERS.find((o) => o.email.toLowerCase() === cleanEmail);
    if (owner) {
      executeAuthentication(owner);
      return;
    }

    const hr = DEMO_HR_ADMINS.find((h) => h.email.toLowerCase() === cleanEmail);
    if (hr) {
      executeAuthentication(hr);
      return;
    }

    const emp = INITIAL_EMPLOYEES.find((e) => e.email.toLowerCase() === cleanEmail);
    if (emp) {
      const empAccount: AuthAccount = {
        id: emp.id,
        orgId: emp.orgId,
        orgName: 'Infinite Solutions',
        name: emp.name,
        email: emp.email,
        role: 'EMPLOYEE',
        title: emp.currentRole,
        department: emp.department,
        avatarUrl: emp.avatarUrl,
        employeeProfileId: emp.id,
      };
      executeAuthentication(empAccount, emp);
      return;
    }

    setErrorMessage(`Account not found for email "${emailInput}". Please select a pre-verified account from Demo login.`);
  };

  const handleQuickLoginOwner = (owner: AuthAccount) => {
    setOrgIdInput(owner.orgId);
    setEmailInput(owner.email);
    setSelectedRoleTab('OWNER');
    setDemoRoleFilter('OWNER');
    executeAuthentication(owner);
  };

  const handleQuickLoginHR = (hr: AuthAccount) => {
    setOrgIdInput(hr.orgId);
    setEmailInput(hr.email);
    setSelectedRoleTab('HR_ADMIN');
    setDemoRoleFilter('HR_ADMIN');
    executeAuthentication(hr);
  };

  const handleQuickLoginEmployee = (emp: EmployeeProfile) => {
    const empAccount: AuthAccount = {
      id: emp.id,
      orgId: emp.orgId,
      orgName: 'Infinite Solutions',
      name: emp.name,
      email: emp.email,
      role: 'EMPLOYEE',
      title: emp.currentRole,
      department: emp.department,
      avatarUrl: emp.avatarUrl,
      employeeProfileId: emp.id,
    };
    setOrgIdInput(emp.orgId);
    setEmailInput(emp.email);
    setSelectedRoleTab('EMPLOYEE');
    setDemoRoleFilter('EMPLOYEE');
    executeAuthentication(empAccount, emp);
  };

  const filteredEmployees = useMemo(() => {
    return INITIAL_EMPLOYEES.filter(
      (e) =>
        e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.currentRole.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
        e.location.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [employeeSearch]);

  const displayedEmployees = showAllEmployees ? filteredEmployees : filteredEmployees.slice(0, 4);

  const tabBtn = (role: UserRole, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={selectedRoleTab === role}
      onClick={() => handleRoleTabChange(role)}
      className="py-1.5 px-2 text-center text-xs font-medium cursor-pointer"
      style={{
        borderRadius: radius.sm,
        backgroundColor: selectedRoleTab === role ? colors.burgundy500 : 'transparent',
        color: selectedRoleTab === role ? '#FFFFFF' : colors.textSecondary,
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      className="min-h-screen flex flex-col font-sans antialiased"
      style={{ backgroundColor: colors.burgundy900, color: colors.textPrimary }}
    >
      <header className="border-b py-3.5 px-4 sm:px-8" style={{ borderColor: colors.burgundy600, backgroundColor: colors.burgundy950 }}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <QuantumQLogo variant="full" size="md" />
          <ThemeToggle showLabel={true} size="sm" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-16 flex flex-col justify-center">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: colors.textPrimary }}>
          Sign in
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          Use your Infinite Solutions credentials.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-1 p-1 border" style={{ backgroundColor: colors.burgundy800, borderColor: colors.burgundy600, borderRadius: radius.md }}>
          {tabBtn('OWNER', 'Owner')}
          {tabBtn('HR_ADMIN', 'HR')}
          {tabBtn('EMPLOYEE', 'Employee')}
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-5 p-3 text-xs flex items-start space-x-2.5 border"
            style={{ backgroundColor: colors.burgundy800, borderColor: colors.danger, borderRadius: radius.md, color: colors.textPrimary }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: colors.danger }} />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleManualLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="orgId" className="block text-xs font-medium mb-1.5" style={{ color: colors.textSecondary }}>
              Organization ID
            </label>
            <input
              id="orgId"
              name="orgId"
              type="text"
              value={orgIdInput}
              onChange={(e) => {
                setOrgIdInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full h-10 px-3 text-sm outline-none"
              style={fieldStyle}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium mb-1.5" style={{ color: colors.textSecondary }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full h-10 px-3 text-sm outline-none"
              style={fieldStyle}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium mb-1.5" style={{ color: colors.textSecondary }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full h-10 pl-3 pr-10 text-sm outline-none"
                style={fieldStyle}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                style={{ color: colors.textMuted }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !isFormValid}
            className="w-full h-10 mt-2 text-sm space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setShowDemoLogin((v) => !v)}
          className="mt-6 text-xs font-medium cursor-pointer self-start"
          style={{ color: colors.burgundy300 }}
        >
          {showDemoLogin ? 'Hide demo login' : 'Demo login'}
        </button>

        {showDemoLogin && (
          <section className="mt-4 border p-4" style={{ backgroundColor: colors.burgundy800, borderColor: colors.burgundy600, borderRadius: radius.lg }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>Demo accounts</p>
              <Badge variant="outline">Sandbox</Badge>
            </div>

            <div className="flex items-center space-x-1.5 mt-3 mb-3">
              {(['OWNER', 'HR_ADMIN', 'EMPLOYEE'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemoRoleFilterChange(role)}
                  className="px-2.5 py-1 text-[11px] font-medium cursor-pointer border"
                  style={{
                    borderRadius: radius.sm,
                    backgroundColor: demoRoleFilter === role ? colors.burgundy500 : colors.burgundy900,
                    color: demoRoleFilter === role ? '#FFFFFF' : colors.textSecondary,
                    borderColor: colors.burgundy600,
                  }}
                >
                  {role === 'OWNER' ? 'Owners' : role === 'HR_ADMIN' ? 'HR' : 'Employees'}
                </button>
              ))}
            </div>

            {demoRoleFilter === 'OWNER' && (
              <div className="space-y-2">
                {DEMO_OWNERS.map((owner) => (
                  <button
                    key={owner.id}
                    type="button"
                    onClick={() => handleQuickLoginOwner(owner)}
                    className="w-full p-2.5 border cursor-pointer text-left"
                    style={{
                      borderRadius: radius.md,
                      backgroundColor: colors.burgundy900,
                      borderColor: colors.burgundy600,
                    }}
                  >
                    <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>{owner.name}</p>
                    <p className="text-[11px]" style={{ color: colors.textMuted }}>{owner.email}</p>
                  </button>
                ))}
              </div>
            )}

            {demoRoleFilter === 'HR_ADMIN' && (
              <div className="space-y-2">
                {DEMO_HR_ADMINS.map((hr) => (
                  <button
                    key={hr.id}
                    type="button"
                    onClick={() => handleQuickLoginHR(hr)}
                    className="w-full p-2.5 border cursor-pointer text-left"
                    style={{
                      borderRadius: radius.md,
                      backgroundColor: colors.burgundy900,
                      borderColor: colors.burgundy600,
                    }}
                  >
                    <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>{hr.name}</p>
                    <p className="text-[11px]" style={{ color: colors.textMuted }}>{hr.email}</p>
                  </button>
                ))}
              </div>
            )}

            {demoRoleFilter === 'EMPLOYEE' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    placeholder="Search employees"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs outline-none"
                    style={fieldStyle}
                  />
                </div>
                <div className="max-h-[220px] overflow-y-auto space-y-1.5">
                  {displayedEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleQuickLoginEmployee(emp)}
                      className="w-full p-2 border cursor-pointer text-left"
                      style={{
                        borderRadius: radius.md,
                        backgroundColor: colors.burgundy900,
                        borderColor: colors.burgundy600,
                      }}
                    >
                      <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>{emp.name}</p>
                      <p className="text-[10px]" style={{ color: colors.textMuted }}>{emp.currentRole.split('&')[0]}</p>
                    </button>
                  ))}
                </div>
                {filteredEmployees.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setShowAllEmployees(!showAllEmployees)}
                    className="w-full py-1.5 text-center text-xs cursor-pointer"
                    style={{ color: colors.textSecondary }}
                  >
                    {showAllEmployees ? 'Show fewer' : `View all ${filteredEmployees.length}`}
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
