import React, { useState } from 'react';
import { MongoConfig } from '../../types';
import { MongoApiService } from '../../services/mongoApi';
import { 
  Database, 
  X, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Loader2, 
  Server, 
  ShieldAlert 
} from 'lucide-react';

interface MongoConfigModalProps {
  config: MongoConfig;
  onSave: (config: MongoConfig) => void;
  onClose: () => void;
}

export const MongoConfigModal: React.FC<MongoConfigModalProps> = ({
  config,
  onSave,
  onClose
}) => {
  const [uri, setUri] = useState(config.uri || '');
  const [database, setDatabase] = useState(config.database || 'pulsechat');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await MongoApiService.testConnection(uri, database);
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    onSave({
      uri: uri.trim(),
      database: database.trim(),
      isConnected: testResult ? testResult.success : config.isConnected,
      lastTested: Date.now()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--color-outline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-container)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                MongoDB Atlas Integration
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                cloud.mongodb.com Database Connection
              </span>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Setup Instructions */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-surface-container)',
              borderRadius: 'var(--md-shape-corner-md)',
              border: '1px solid var(--color-outline)',
              fontSize: '12.5px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Connection Guide (Free M0 Cluster):</span>
              <a
                href="https://cloud.mongodb.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                cloud.mongodb.com <ExternalLink size={12} />
              </a>
            </div>
            <ol style={{ paddingLeft: '18px', margin: 0 }}>
              <li>Create a free cluster on <strong>cloud.mongodb.com</strong>.</li>
              <li>Under <strong>Database Access</strong>, add a user with password.</li>
              <li>Under <strong>Network Access</strong>, add <code>0.0.0.0/0</code> (Allow Access from Anywhere).</li>
              <li>Click <strong>Connect &rarr; Drivers</strong> and paste your connection string below:</li>
            </ol>
          </div>

          {/* Connection URI Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Atlas Connection String (URI)
            </label>
            <input
              type="text"
              placeholder="mongodb+srv://admin:password@cluster.mongodb.net/?retryWrites=true&w=majority"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--md-shape-corner-md)',
                border: '1px solid var(--color-outline)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </div>

          {/* Database Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              Database Name
            </label>
            <input
              type="text"
              placeholder="pulsechat"
              value={database}
              onChange={(e) => setDatabase(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--md-shape-corner-md)',
                border: '1px solid var(--color-outline)',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Test Status Feedback */}
          {testResult && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--md-shape-corner-md)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: testResult.success ? '#10b981' : '#ef4444',
                border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            >
              {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            * Offline-first mode: PulseChat works instantly out of the box using local storage. When you enter an Atlas URI, it automatically enables cluster synchronization and Vercel serverless integration.
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            padding: '14px 22px',
            backgroundColor: 'var(--color-surface-container)',
            borderTop: '1px solid var(--color-outline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={handleTest}
            disabled={isTesting}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--md-shape-corner-md)',
              border: '1px solid var(--color-outline)',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isTesting && <Loader2 size={14} className="animate-spin" />}
            <span>Test Connection</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--md-shape-corner-md)',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="send-btn"
              style={{ padding: '8px 18px' }}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
