import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  Database, 
  LogOut, 
  Command
} from 'lucide-react';
import { AuthAccount, EmployeeProfile, Organization } from '../types';
import { DatabaseStatusModal } from './DatabaseStatusModal';
import { QuantumQLogo } from './QuantumQLogo';
import { colors, radius } from '../design-system/tokens';
import { ThemeToggle } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: string;
  currentUser: AuthAccount;
  activeEmployee: EmployeeProfile;
  allEmployees: EmployeeProfile[];
  onSelectEmployee: (emp: EmployeeProfile) => void;
  currentOrg: Organization;
  onLogout: () => void;
  onOpenMobileSidebar: () => void;
  onOpenAtom: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  activeEmployee,
  allEmployees,
  onSelectEmployee,
  currentOrg,
  onLogout,
  onOpenMobileSidebar,
  onOpenAtom,
  onNavigateTab,
}) => {
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'owner-dashboard':
        return 'Executive Governance';
      case 'hr-dashboard':
        return 'Talent Discovery';
      case 'employee-profile':
        return currentUser.role === 'EMPLOYEE' ? 'My Skill Profile' : `Profile: ${activeEmployee.name}`;
      case 'gap-analysis':
        return currentUser.role === 'EMPLOYEE' ? 'Skill Gap & Roadmap' : `Gap Analysis: ${activeEmployee.name}`;
      case 'hr-matching':
        return 'Role Matching';
      case 'atom-advisor':
        return 'Atom AI Assistant';
      case 'auth-service-code':
        return 'Platform Architecture';
      default:
        return 'Dashboard';
    }
  };

  const controlStyle: React.CSSProperties = {
    backgroundColor: colors.burgundy800,
    border: `1px solid ${colors.burgundy600}`,
    borderRadius: radius.md,
    color: colors.textSecondary,
  };

  return (
    <header
      className="sticky top-0 z-40 h-14 border-b px-4 sm:px-6 flex items-center justify-between"
      style={{
        backgroundColor: colors.burgundy950,
        borderColor: colors.burgundy600,
      }}
    >
      <div className="w-full flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-1.5 rounded-md"
            style={{ color: colors.textSecondary }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <QuantumQLogo size="sm" variant="full" />
            
            <div className="hidden md:block h-5 w-px" style={{ backgroundColor: colors.burgundy600 }} />

            <div className="hidden md:flex items-center space-x-2 text-xs font-medium" style={{ color: colors.textMuted }}>
              <span>{currentOrg.name.split(' ')[0]}</span>
              <span>/</span>
              <span style={{ color: colors.textSecondary }}>{getTabLabel(activeTab)}</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center flex-1 max-w-[400px] mx-4">
          <div
            className="relative flex items-center w-full h-9"
            style={{
              ...controlStyle,
              borderColor: searchFocused ? colors.burgundy500 : colors.burgundy600,
            }}
          >
            <Search className="w-3.5 h-3.5 ml-3 shrink-0" style={{ color: colors.textMuted }} />
            <input
              type="text"
              placeholder="Search employees, skills, or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-transparent px-2.5 text-xs focus:outline-none"
              style={{ color: colors.textPrimary }}
            />
            <div className="mr-2 flex items-center space-x-0.5 px-1.5 py-0.5 text-[10px]" style={{ color: colors.textMuted }}>
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenAtom}
            className="flex items-center h-8 px-2.5 text-xs font-medium cursor-pointer"
            style={controlStyle}
            title="Ask Atom"
          >
            <span className="hidden sm:inline">Ask Atom</span>
            <span className="sm:hidden">Atom</span>
          </button>

          <button
            onClick={() => onNavigateTab ? onNavigateTab('hr-matching') : null}
            className="hidden sm:flex items-center space-x-1 h-8 px-3 text-xs font-medium cursor-pointer"
            style={{
              backgroundColor: colors.burgundy500,
              color: '#FFFFFF',
              borderRadius: radius.md,
            }}
            title="Create or match new target role"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Role</span>
          </button>

          <button
            onClick={() => setIsDbModalOpen(true)}
            className="hidden xl:flex items-center space-x-1.5 h-8 px-2 text-xs font-medium cursor-pointer"
            style={controlStyle}
            title="Inspect Database Storage Engine & Telemetry"
          >
            <Database className="w-3.5 h-3.5" />
            <span>DB</span>
          </button>

          <ThemeToggle size="sm" showLabel={false} />

          <button
            className="relative p-2"
            style={controlStyle}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {currentUser.role !== 'EMPLOYEE' && (
            <div className="hidden lg:flex items-center space-x-1.5 px-2 h-8" style={controlStyle}>
              <span className="text-[10px] uppercase" style={{ color: colors.textMuted }}>Subject</span>
              <select
                value={activeEmployee.id}
                onChange={(e) => {
                  const emp = allEmployees.find((item) => item.id === e.target.value);
                  if (emp) onSelectEmployee(emp);
                }}
                className="bg-transparent text-xs focus:outline-none cursor-pointer max-w-[130px] truncate"
                style={{ color: colors.textPrimary }}
              >
                {allEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id} style={{ backgroundColor: colors.burgundy800, color: colors.textPrimary }}>
                    {emp.name.split(' ')[0]} ({emp.currentRole.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2 pl-2" style={{ borderLeft: `1px solid ${colors.burgundy600}` }}>
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-medium shrink-0"
              style={{ backgroundColor: colors.burgundy700, color: '#FFFFFF' }}
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentUser.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>

            <div className="hidden xl:block text-left">
              <p className="text-xs font-medium leading-none" style={{ color: colors.textPrimary }}>{currentUser.name}</p>
              <p className="text-[10px] mt-0.5 leading-none" style={{ color: colors.textMuted }}>
                {currentUser.role === 'OWNER' ? 'Owner / Exec' : currentUser.role === 'HR_ADMIN' ? 'HR Workforce' : 'Employee IC'}
              </p>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-md cursor-pointer"
              style={{ color: colors.textMuted }}
              title="Log out / Switch persona"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <DatabaseStatusModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
    </header>
  );
};
