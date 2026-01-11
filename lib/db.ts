import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'agentmart.db');

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  // Create users table (simplified - using wallet address as primary key)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      wallet_address TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);

  // Create agent_history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_history (
      id TEXT PRIMARY KEY,
      wallet_address TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      capability TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'executing', 'completed', 'failed')),
      cost TEXT NOT NULL,
      input_data TEXT NOT NULL,
      output_data TEXT,
      summary TEXT,
      execution_time INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
    )
  `);

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_agent_history_wallet 
    ON agent_history(wallet_address, created_at DESC)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_agent_history_status 
    ON agent_history(status)
  `);

  console.log('✅ Database initialized at:', dbPath);
}

// Initialize on module load
initializeDatabase();

// Prepared statements for better performance
const statements = {
  // User operations
  createUser: db.prepare(`
    INSERT OR IGNORE INTO users (wallet_address)
    VALUES (?)
  `),

  // Agent history operations
  createAgentHistory: db.prepare(`
    INSERT INTO agent_history (
      id, wallet_address, agent_name, capability, status, cost, input_data, output_data, summary, execution_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `),

  updateAgentHistory: db.prepare(`
    UPDATE agent_history
    SET status = ?, output_data = ?, summary = ?, execution_time = ?, updated_at = strftime('%s', 'now')
    WHERE id = ?
  `),

  getAgentHistory: db.prepare(`
    SELECT * FROM agent_history
    WHERE wallet_address = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `),

  getAgentHistoryById: db.prepare(`
    SELECT * FROM agent_history
    WHERE id = ? AND wallet_address = ?
  `),

  getAgentHistoryCount: db.prepare(`
    SELECT COUNT(*) as count FROM agent_history
    WHERE wallet_address = ?
  `),

  getAgentHistoryStats: db.prepare(`
    SELECT 
      COUNT(*) as total_calls,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_calls,
      COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) as failed_calls,
      COALESCE(SUM(CASE WHEN status = 'completed' THEN CAST(cost as REAL) ELSE 0 END), 0) as total_spent
    FROM agent_history
    WHERE wallet_address = ?
  `),

  deleteOldHistory: db.prepare(`
    DELETE FROM agent_history
    WHERE wallet_address = ? AND created_at < ?
  `),
};

export interface AgentHistoryRecord {
  id: string;
  wallet_address: string;
  agent_name: string;
  capability: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  cost: string;
  input_data: string;
  output_data?: string;
  summary?: string;
  execution_time?: number;
  created_at: number;
  updated_at: number;
}

export interface AgentHistoryStats {
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  total_spent: number;
}

export const dbOperations = {
  // User operations
  ensureUser(walletAddress: string) {
    statements.createUser.run(walletAddress);
  },

  // Agent history operations
  createAgentHistory(record: {
    id: string;
    walletAddress: string;
    agentName: string;
    capability: string;
    status: string;
    cost: string;
    inputData: any;
    outputData?: any;
    summary?: string;
    executionTime?: number;
  }) {
    this.ensureUser(record.walletAddress);
    
    statements.createAgentHistory.run(
      record.id,
      record.walletAddress,
      record.agentName,
      record.capability,
      record.status,
      record.cost,
      JSON.stringify(record.inputData),
      record.outputData ? JSON.stringify(record.outputData) : null,
      record.summary || null,
      record.executionTime || null
    );
  },

  updateAgentHistory(id: string, updates: {
    status?: string;
    outputData?: any;
    summary?: string;
    executionTime?: number;
  }) {
    const record = statements.getAgentHistoryById.get(id, '*') as AgentHistoryRecord | undefined;
    if (!record) return;

    statements.updateAgentHistory.run(
      updates.status || record.status,
      updates.outputData ? JSON.stringify(updates.outputData) : record.output_data,
      updates.summary || record.summary,
      updates.executionTime !== undefined ? updates.executionTime : record.execution_time,
      id
    );
  },

  getAgentHistory(walletAddress: string, limit: number = 50, offset: number = 0): AgentHistoryRecord[] {
    const records = statements.getAgentHistory.all(walletAddress, limit, offset) as AgentHistoryRecord[];
    return records.map(record => ({
      ...record,
      input_data: record.input_data,
      output_data: record.output_data,
    }));
  },

  getAgentHistoryById(id: string, walletAddress: string): AgentHistoryRecord | undefined {
    return statements.getAgentHistoryById.get(id, walletAddress) as AgentHistoryRecord | undefined;
  },

  getAgentHistoryCount(walletAddress: string): number {
    const result = statements.getAgentHistoryCount.get(walletAddress) as { count: number };
    return result.count;
  },

  getAgentHistoryStats(walletAddress: string): AgentHistoryStats {
    return statements.getAgentHistoryStats.get(walletAddress) as AgentHistoryStats;
  },

  deleteOldHistory(walletAddress: string, beforeTimestamp: number) {
    statements.deleteOldHistory.run(walletAddress, beforeTimestamp);
  },
};

export default db;

