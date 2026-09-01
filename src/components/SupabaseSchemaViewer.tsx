import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Table, 
  Zap, 
  Layers, 
  Key, 
  ArrowLeft,
  Sparkles,
  Download
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSql';

const SCHEMA_TABLES = [
  {
    name: 'users',
    description: 'User profiles linked to Supabase Auth UUID',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', isPk: true },
      { name: 'full_name', type: 'TEXT NOT NULL' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'location', type: 'TEXT' },
      { name: 'rating', type: 'NUMERIC(3,2)' },
      { name: 'review_count', type: 'INTEGER' },
      { name: 'verified', type: 'BOOLEAN' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ]
  },
  {
    name: 'listings',
    description: 'Marketplace product listings with PostGIS/GeoJSON',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', isPk: true },
      { name: 'seller_id', type: 'UUID REFERENCES users(id)', isFk: true },
      { name: 'title', type: 'TEXT NOT NULL' },
      { name: 'description', type: 'TEXT' },
      { name: 'price', type: 'NUMERIC(12,2)' },
      { name: 'category', type: 'TEXT CHECK (enum)' },
      { name: 'condition', type: 'TEXT CHECK (enum)' },
      { name: 'status', type: 'TEXT (active|pending|sold)' },
      { name: 'location_geojson', type: 'JSONB' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ]
  },
  {
    name: 'listing_images',
    description: 'Multiple photos per listing with display order',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', isPk: true },
      { name: 'listing_id', type: 'UUID REFERENCES listings(id)', isFk: true },
      { name: 'image_url', type: 'TEXT NOT NULL' },
      { name: 'display_order', type: 'INTEGER' },
    ]
  },
  {
    name: 'conversations',
    description: 'P2P chat rooms between buyer and seller per listing',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', isPk: true },
      { name: 'listing_id', type: 'UUID REFERENCES listings(id)', isFk: true },
      { name: 'buyer_id', type: 'UUID REFERENCES users(id)', isFk: true },
      { name: 'seller_id', type: 'UUID REFERENCES users(id)', isFk: true },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ]
  },
  {
    name: 'messages',
    description: 'Real-time messages, cash offers & meeting locations',
    columns: [
      { name: 'id', type: 'UUID PRIMARY KEY', isPk: true },
      { name: 'conversation_id', type: 'UUID REFERENCES conversations(id)', isFk: true },
      { name: 'sender_id', type: 'UUID REFERENCES users(id)', isFk: true },
      { name: 'content', type: 'TEXT NOT NULL' },
      { name: 'is_offer', type: 'BOOLEAN' },
      { name: 'offer_amount', type: 'NUMERIC(12,2)' },
      { name: 'meeting_point', type: 'JSONB' },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ]
  },
  {
    name: 'saved_listings',
    description: 'Wishlist junction table for bookmarked items',
    columns: [
      { name: 'user_id', type: 'UUID REFERENCES users(id)', isPk: true, isFk: true },
      { name: 'listing_id', type: 'UUID REFERENCES listings(id)', isPk: true, isFk: true },
      { name: 'created_at', type: 'TIMESTAMPTZ' },
    ]
  },
];

export const SupabaseSchemaViewer: React.FC = () => {
  const { setCurrentView } = useMarketplace();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'diagram' | 'rls'>('sql');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sane_marketplace_supabase_schema.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="border-b border-[#3a3a3a] pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentView('feed')}
            className="flex items-center gap-1 text-xs font-mono text-[#BE1E2F] hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#BE1E2F]/20 text-[#BE1E2F]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Supabase PostgreSQL Schema</h1>
              <p className="text-xs text-white/50">Production-ready DDL, RLS security rules, and Realtime publications</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySql}
            className="btn px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 shadow-md shadow-[#BE1E2F]/20"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied Full SQL!' : 'Copy SQL Script'}</span>
          </button>
          <button
            onClick={handleDownloadSql}
            className="btn-secondary px-3.5 py-2 text-xs rounded-md flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download .sql</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#3a3a3a] pb-3 mb-6">
        {[
          { id: 'sql', label: 'Complete SQL Script', icon: Database },
          { id: 'diagram', label: 'Schema Structure (6 Tables)', icon: Table },
          { id: 'rls', label: 'Row Level Security (RLS)', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[#BE1E2F] text-white shadow-sm shadow-[#BE1E2F]/20'
                  : 'text-white/70 hover:bg-[#2b2b2b] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: COMPLETE SQL SCRIPT */}
      {activeTab === 'sql' && (
        <div className="card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-white/50 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>PostgreSQL 15+ / Supabase DDL Script</span>
            </span>
            <span className="text-xs font-mono text-emerald-400">PostGIS & Realtime Enabled</span>
          </div>

          <pre className="font-['DM_Mono'] text-xs text-white/90 bg-[#151515] p-4 sm:p-6 rounded-lg border border-[#3a3a3a] overflow-x-auto leading-relaxed max-h-[650px]">
            <code>{SUPABASE_SQL_SCHEMA}</code>
          </pre>
        </div>
      )}

      {/* TAB 2: SCHEMA TABLE STRUCTURE */}
      {activeTab === 'diagram' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCHEMA_TABLES.map((table) => (
            <div key={table.name} className="card p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#3a3a3a] pb-2 mb-2">
                  <span className="font-['DM_Mono'] text-sm font-bold text-white flex items-center gap-1.5">
                    <Table className="h-4 w-4 text-[#BE1E2F]" />
                    <span>{table.name}</span>
                  </span>
                  <span className="text-[10px] font-mono rounded bg-[#1a1a1a] px-1.5 py-0.5 text-white/50 border border-[#3a3a3a]">
                    RLS ON
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mb-3">{table.description}</p>
                
                <div className="space-y-1">
                  {table.columns.map((col) => (
                    <div key={col.name} className="flex items-center justify-between text-[11px] font-mono py-1 border-b border-[#2e2e2e]">
                      <span className={`flex items-center gap-1 ${col.isPk ? 'text-amber-400 font-bold' : 'text-white/80'}`}>
                        {col.isPk && <Key className="h-3 w-3" />}
                        {col.name}
                      </span>
                      <span className="text-white/40 text-[10px] truncate max-w-[140px]">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: RLS RULES AUDIT */}
      {activeTab === 'rls' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>Zero Trust Row-Level Security Matrix</span>
          </div>

          <div className="space-y-3">
            {[
              {
                table: 'listings',
                rule: 'Public can read active listings; only authorized seller_id (auth.uid()) can insert, update, or delete their own items.',
              },
              {
                table: 'conversations',
                rule: 'Only buyer_id or seller_id participants can select/read private conversation metadata.',
              },
              {
                table: 'messages',
                rule: 'Only authorized thread participants can view or append messages, cash offers, or pickup locations.',
              },
              {
                table: 'saved_listings',
                rule: 'Strict 1:1 user wishlist isolation (auth.uid() = user_id).',
              },
              {
                table: 'listing-photos (Bucket)',
                rule: 'Public read access; authenticated uploads scoped to item owner validation.',
              },
            ].map((r) => (
              <div key={r.table} className="rounded-lg border border-[#3a3a3a] bg-[#1a1a1a] p-3.5">
                <span className="font-mono text-xs font-bold text-[#BE1E2F] block mb-1">
                  Table: {r.table}
                </span>
                <p className="text-xs text-white/80">{r.rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
