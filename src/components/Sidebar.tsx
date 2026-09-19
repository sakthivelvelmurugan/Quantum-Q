import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  X,
  LogOut,
} from 'lucide-react';
import { AuthAccount, Organization, EmployeeProfile } from '../types';
import { QuantumQLogo } from './QuantumQLogo';
import { colors, radius } from '../design-system/tokens';
import { ThemeToggle } from '../context/ThemeContext';

interface SidebarProps {
  currentUser: AuthAccount;
  currentOrg: Organization;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeEmployee: EmployeeProfile;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentOrg,
  activeTab,
  onSelectTab,
  onLogout,
  mobileOpen,
  onCloseMobile,
}) => {
  const getNavItems = () => {
    if (currentUser.role === 'OWNER') {
      return [
        { id: 'owner-dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'hr-dashboard', label: 'Talent Discovery', icon: Users },
        { id: 'hr-matching', label: 'Role Matching', icon: Target },
        { id: 'atom-advisor', label: 'Atom', icon: Sparkles },
        { id: 'auth-service-code', label: 'Workforce & Security', icon: ShieldCheck },
      ];
    } else if (currentUser.role === 'HR_ADMIN') {
      return [
        { id: 'hr-dashboard', label: 'Talent Discovery', icon: Users },
        { id: 'hr-matching', label: 'Role Matching', icon: Target },
        { id: 'employee-profile', label: 'Talent Profiles', icon: Users },
        { id: 'gap-analysis', label: 'Skill Gap & Roadmap', icon: TrendingUp },
        { id: 'atom-advisor', label: 'Atom', icon: Sparkles },
      ];
    } else {
      return [
        { id: 'employee-profile', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'gap-analysis', label: 'Skill Gap & Roadmap', icon: TrendingUp },
        { id: 'hr-matching', label: 'Role Matching', icon: Target },
        { id: 'atom-advisor', label: 'Atom', icon: Sparkles },
      ];
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div
      className="flex flex-col h-full font-sans border-r select-none"
      style={{
        backgroundColor: colors.burgundy850,
        borderColor: colors.burgundy600,
        color: colors.textSecondary,
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: colors.burgundy600 }}>
        <div className="flex items-center justify-between">
          <QuantumQLogo variant="full" size="md" />
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded"
            style={{ color: colors.textMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 px-2.5 py-2 rounded-md border" style={{ borderColor: colors.burgundy600, backgroundColor: colors.burgundy900 }}>
          <p className="text-xs font-medium truncate" style={{ color: colors.textPrimary }}>{currentOrg.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className="relative w-full text-left px-3 py-2 text-sm font-medium flex items-center space-x-3 cursor-pointer"
              style={{
                borderRadius: radius.md,
                backgroundColor: isActive ? colors.burgundy700 : 'transparent',
                color: isActive ? colors.textPrimary : colors.textSecondary,
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r-full"
                  style={{ backgroundColor: colors.burgundy500 }}
                />
              )}

              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t" style={{ borderColor: colors.burgundy600 }}>
        <div className="flex items-center space-x-2.5 p-2">
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs shrink-0"
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

          <div className="overflow-hidden flex-1">
            <p className="text-xs font-medium truncate" style={{ color: colors.textPrimary }}>{currentUser.name}</p>
            <p className="text-[10px] truncate mt-0.5" style={{ color: colors.textMuted }}>
              {currentUser.title.split('/')[0]}
            </p>
          </div>
        </div>

        <div className="mt-2">
          <ThemeToggle className="w-full py-1.5 px-3 rounded-md" showLabel={true} size="sm" />
        </div>

        <button
          onClick={onLogout}
          className="mt-2 w-full py-2 px-3 text-xs font-medium flex items-center justify-center space-x-2 cursor-pointer border"
          style={{
            backgroundColor: colors.burgundy800,
            color: colors.textSecondary,
            borderColor: colors.burgundy600,
            borderRadius: radius.md,
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Account</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-30 flex-col">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[85vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
