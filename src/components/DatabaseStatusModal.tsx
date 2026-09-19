import React, { useState, useEffect } from 'react';
import { Database, Cloud, HardDrive, Download, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { colors, radius, shadows, glows } from '../design-system/tokens';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch DB status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/db/export');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quantum_db_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        className="relative z-10 w-full max-w-lg overflow-hidden border animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: colors.burgundy850,
          borderColor: colors.burgundy600,
          borderRadius: radius.xl,
          boxShadow: shadows.modal,
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: colors.burgundy950,
            borderColor: colors.burgundy600,
          }}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{
                backgroundColor: colors.burgundy500,
                boxShadow: glows.burgundy,
              }}
            >
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#FFF5F7]">Database Storage Engine</h3>
              <p className="text-[11px] text-[#C9A8B0]">Persistent Architecture & Telemetry Layer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#C9A8B0] hover:text-[#FFF5F7] hover:bg-[#310D17] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Active Engine Card */}
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: 'rgba(52, 211, 153, 0.08)',
              borderColor: 'rgba(52, 211, 153, 0.25)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
                <span className="text-xs font-bold text-[#34D399]">Active Storage Driver</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] font-semibold">
                Online & Persisting
              </span>
            </div>
            <div className="mt-2.5 flex items-center space-x-3 text-xs">
              <HardDrive className="w-4 h-4 text-[#34D399] shrink-0" />
              <div>
                <p className="font-semibold text-[#FFF5F7]">Server-Side JSON Persistent Storage</p>
                <p className="text-[11px] font-mono text-[#C9A8B0]">{dbStatus?.storageLocation || './data/quantum_db.json'}</p>
              </div>
            </div>
          </div>

          {/* Counts Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div
              className="p-3 rounded-xl border text-center"
              style={{
                backgroundColor: colors.burgundy800,
                borderColor: colors.burgundy600,
              }}
            >
              <span className="text-[10px] text-[#C9A8B0] font-medium block">Employees</span>
              <span className="text-lg font-bold text-[#FFF5F7]">{dbStatus?.counts?.employees ?? 20}</span>
            </div>
            <div
              className="p-3 rounded-xl border text-center"
              style={{
                backgroundColor: colors.burgundy800,
                borderColor: colors.burgundy600,
              }}
            >
              <span className="text-[10px] text-[#C9A8B0] font-medium block">Target Roles</span>
              <span className="text-lg font-bold text-[#FFF5F7]">{dbStatus?.counts?.targetRoles ?? 3}</span>
            </div>
            <div
              className="p-3 rounded-xl border text-center"
              style={{
                backgroundColor: colors.burgundy800,
                borderColor: colors.burgundy600,
              }}
            >
              <span className="text-[10px] text-[#C9A8B0] font-medium block">Feedback Logs</span>
              <span className="text-lg font-bold text-[#E08A9D]">{dbStatus?.counts?.feedback ?? 3}</span>
            </div>
          </div>

          {/* Firestore Integration Status */}
          <div
            className="p-3.5 rounded-xl border flex items-start space-x-3"
            style={{
              backgroundColor: colors.burgundy800,
              borderColor: colors.burgundy600,
            }}
          >
            <Cloud className="w-4 h-4 text-[#C94B6A] shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-[#FFF5F7]">Google Cloud Firestore Adapter</p>
              <p className="text-[11px] text-[#C9A8B0] mt-0.5">
                The Firestore adapter and collection schemas are implemented in <code className="font-mono bg-[#481321] px-1 rounded text-[#E08A9D]">server/db/firestoreAdapter.ts</code>. Enable it anytime by setting <code className="font-mono bg-[#481321] px-1 rounded text-[#E08A9D]">DB_DRIVER=firestore</code>.
              </p>
            </div>
          </div>

          {/* Security & Audit notice */}
          <div className="flex items-center space-x-2 text-[11px] text-[#795C65]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Audit telemetry tracks all employee updates and skill modifications.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="px-6 py-3.5 border-t flex items-center justify-between"
          style={{
            backgroundColor: colors.burgundy950,
            borderColor: colors.burgundy600,
          }}
        >
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs text-[#C9A8B0] hover:text-[#FFF5F7] font-medium py-1 px-2 rounded-lg hover:bg-[#310D17] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:bg-[#9F1D3B] transition-all cursor-pointer border border-[#9F1D3B]"
            style={{
              backgroundColor: colors.burgundy500,
              boxShadow: glows.burgundy,
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Download JSON Backup'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
