import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  ShieldCheck, 
  Database, 
  Radio, 
  Server,
  FolderTree,
  Terminal
} from 'lucide-react';
import { AUTH_SERVICE_CODE_FILES } from '../data/authServiceCode';
import { CodeFile } from '../types';
import { colors, glows, shadows } from '../design-system/tokens';
import { Card, Badge, Button } from '../design-system';

export const AuthServiceCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(AUTH_SERVICE_CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Architecture Banner */}
      <Card padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="burgundy">Module 1 • System Architecture</Badge>
              <Badge variant="outline">Spring Boot 3 + Redis</Badge>
            </div>
            <h2 className="text-xl font-bold text-[#FFF5F7] tracking-tight mt-1.5">
              Auth Service — Spring Boot 3 & Multi-Tenant Security
            </h2>
            <p className="text-xs text-[#C9A8B0] mt-1 max-w-3xl leading-relaxed">
              Production microservice implementation providing Spring Security 6, JJWT 0.12, Redis-backed atomic refresh token rotation, ThreadLocal tenant scoping, and Kafka domain event streaming.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Button
              onClick={handleCopy}
              variant="primary"
              glow
              size="sm"
              className="space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied File' : 'Copy Active File'}</span>
            </Button>
          </div>
        </div>

        {/* 4 Architecture Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#641A2D]">
          <div className="bg-[#1A080D] p-3.5 rounded-xl border border-[#641A2D]">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FFF5F7]">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <span>Multi-Tenant Scoping</span>
            </div>
            <p className="text-[11px] text-[#C9A8B0] mt-1 leading-relaxed">
              ThreadLocal TenantContext + OncePerRequestFilter guarantees strict org_id isolation.
            </p>
          </div>

          <div className="bg-[#1A080D] p-3.5 rounded-xl border border-[#641A2D]">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FFF5F7]">
              <Database className="w-4 h-4 text-[#C94B6A]" />
              <span>Redis Token Store</span>
            </div>
            <p className="text-[11px] text-[#C9A8B0] mt-1 leading-relaxed">
              Atomic refresh token rotation; replay attack defense with 7-day TTL and instant revocation.
            </p>
          </div>

          <div className="bg-[#1A080D] p-3.5 rounded-xl border border-[#641A2D]">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FFF5F7]">
              <Server className="w-4 h-4 text-[#E58CA2]" />
              <span>Spring Security 6</span>
            </div>
            <p className="text-[11px] text-[#C9A8B0] mt-1 leading-relaxed">
              Stateless session creation, JJWT 0.12 HS256 claims parsing, and method-level RBAC.
            </p>
          </div>

          <div className="bg-[#1A080D] p-3.5 rounded-xl border border-[#641A2D]">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FFF5F7]">
              <Radio className="w-4 h-4 text-[#FBBF24]" />
              <span>Kafka Event Producer</span>
            </div>
            <p className="text-[11px] text-[#C9A8B0] mt-1 leading-relaxed">
              Publishes <span className="font-mono text-[10px] font-semibold text-[#FBBF24]">USER_REGISTERED</span> partitioned by org_id for downstream ingestion.
            </p>
          </div>
        </div>
      </Card>

      {/* Code Browser: Sidebar (4 cols) & Editor (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar: File Tree */}
        <div
          className="lg:col-span-4 rounded-2xl border p-4 flex flex-col h-[680px]"
          style={{
            backgroundColor: colors.burgundy800,
            borderColor: colors.burgundy600,
            boxShadow: shadows.card,
          }}
        >
          <div className="flex items-center space-x-2 pb-3 border-b border-[#641A2D] text-xs font-bold uppercase tracking-wider text-[#FFF5F7]">
            <FolderTree className="w-4 h-4 text-[#C94B6A]" />
            <span>Service Files ({AUTH_SERVICE_CODE_FILES.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 mt-3 pr-1">
            {AUTH_SERVICE_CODE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start space-x-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#800F2F] border-[#C94B6A] text-white shadow-sm'
                      : 'bg-[#1A080D] border-[#641A2D] text-[#C9A8B0] hover:border-[#800F2F] hover:bg-[#250A12] hover:text-[#FFF5F7]'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-[#795C65]'}`} />
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold truncate text-[#FFF5F7]">{file.name}</p>
                    <p className="text-[10px] text-[#795C65] truncate mt-0.5 font-mono">{file.path}</p>
                    <p className="text-[10px] text-[#C9A8B0] truncate mt-0.5">{file.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor: Active File Code View */}
        <div
          className="lg:col-span-8 rounded-2xl border flex flex-col h-[680px] overflow-hidden"
          style={{
            backgroundColor: colors.burgundy950,
            borderColor: colors.burgundy600,
            boxShadow: shadows.card,
          }}
        >
          {/* Header */}
          <div className="p-3.5 bg-[#1A080D] border-b border-[#641A2D] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-1.5 rounded-lg bg-[#310D17] text-[#E08A9D] border border-[#641A2D]">
                <Terminal className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#FFF5F7] font-mono">{selectedFile.name}</span>
                  <Badge variant="outline">{selectedFile.language}</Badge>
                </div>
                <p className="text-[11px] text-[#C9A8B0] mt-0.5">{selectedFile.description}</p>
              </div>
            </div>

            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              className="space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>

          {/* Syntax Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-[#FFF5F7] bg-[#120609]">
            <pre className="grid grid-cols-[auto_1fr] gap-x-4">
              {/* Line numbers */}
              <div className="select-none text-right text-[#795C65] pr-3 border-r border-[#641A2D]">
                {selectedFile.code.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              {/* Code content */}
              <div className="overflow-x-auto whitespace-pre text-[#FFF5F7]">
                {selectedFile.code}
              </div>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
