import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  User, 
  Compass, 
  Users, 
  Code2,
} from 'lucide-react';
import { Organization, UserRole } from '../types';
import { colors, radius } from '../design-system/tokens';
import { QuantumQLogo } from './QuantumQLogo';

interface NavbarProps {
  currentOrg: Organization;
  organizations: Organization[];
  onSelectOrg: (org: Organization) => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: 'profile' | 'gap-analysis' | 'hr-matching' | 'ai-assistant' | 'auth-service-code';
  onSelectTab: (tab: 'profile' | 'gap-analysis' | 'hr-matching' | 'ai-assistant' | 'auth-service-code') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentOrg,
  organizations,
  onSelectOrg,
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
}) => {
  const tabClass = (id: string) => ({
    borderRadius: radius.md,
    backgroundColor: activeTab === id ? colors.burgundy500 : 'transparent',
    color: activeTab === id ? '#FFFFFF' : colors.textSecondary,
  } as React.CSSProperties);

  return (
    <header className="sticky top-0 z-40" style={{ backgroundColor: colors.burgundy950, color: colors.textPrimary, borderBottom: `1px solid ${colors.burgundy600}` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <QuantumQLogo size="sm" variant="full" />

          <nav className="hidden md:flex items-center space-x-1 p-1 border" style={{ backgroundColor: colors.burgundy900, borderColor: colors.burgundy600, borderRadius: radius.md }}>
            <button onClick={() => onSelectTab('profile')} className="px-3 py-1.5 text-xs font-medium flex items-center space-x-1.5" style={tabClass('profile')}>
              <User className="w-3.5 h-3.5" />
              <span>Skill Profile</span>
            </button>
            <button onClick={() => onSelectTab('gap-analysis')} className="px-3 py-1.5 text-xs font-medium flex items-center space-x-1.5" style={tabClass('gap-analysis')}>
              <Compass className="w-3.5 h-3.5" />
              <span>Career & Gap Analysis</span>
            </button>
            <button onClick={() => onSelectTab('hr-matching')} className="px-3 py-1.5 text-xs font-medium flex items-center space-x-1.5" style={tabClass('hr-matching')}>
              <Users className="w-3.5 h-3.5" />
              <span>Workforce Matcher</span>
            </button>
            <button onClick={() => onSelectTab('ai-assistant')} className="px-3 py-1.5 text-xs font-medium flex items-center space-x-1.5" style={tabClass('ai-assistant')}>
              <span>Atom</span>
            </button>
            <button onClick={() => onSelectTab('auth-service-code')} className="px-3 py-1.5 text-xs font-medium flex items-center space-x-1.5" style={tabClass('auth-service-code')}>
              <Code2 className="w-3.5 h-3.5" />
              <span>Auth Service</span>
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <div className="flex items-center border px-2.5 py-1 text-xs" style={{ backgroundColor: colors.burgundy800, borderColor: colors.burgundy600, borderRadius: radius.md, color: colors.textPrimary }}>
              <Building2 className="w-3.5 h-3.5 mr-1.5" style={{ color: colors.textMuted }} />
              <select
                value={currentOrg.id}
                onChange={(e) => {
                  const found = organizations.find((o) => o.id === e.target.value);
                  if (found) onSelectOrg(found);
                }}
                className="bg-transparent font-medium focus:outline-none cursor-pointer pr-2"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center border px-2.5 py-1 text-xs" style={{ backgroundColor: colors.burgundy800, borderColor: colors.burgundy600, borderRadius: radius.md, color: colors.textPrimary }}>
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" style={{ color: colors.textMuted }} />
              <select
                value={currentRole}
                onChange={(e) => onSelectRole(e.target.value as UserRole)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_ADMIN">HR Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
