import { IDatabase } from './types';
import { JsonFileDatabase } from './jsonStore';
import { FirestoreDatabaseAdapter } from './firestoreAdapter';

let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    const driver = process.env.DB_DRIVER || 'json_file';
    if (driver === 'firestore' && process.env.FIREBASE_PROJECT_ID) {
      console.log('[Database] Selected Google Cloud Firestore driver');
      dbInstance = new FirestoreDatabaseAdapter();
    } else {
      console.log('[Database] Selected JSON File Persistent Storage driver (./data/quantum_db.json)');
      dbInstance = new JsonFileDatabase();
    }
    // Initialize in background
    dbInstance.init().catch((err) => {
      console.error('[Database] Initialization error:', err);
    });
  }
  return dbInstance;
}

export * from './types';
export { JsonFileDatabase } from './jsonStore';
export { FirestoreDatabaseAdapter } from './firestoreAdapter';
