export interface SandboxTestCase {
  name: string;
  status: 'passed' | 'failed';
  error?: string;
  duration: number;
}

export interface SandboxTestResult {
  passed: number;
  failed: number;
  total: number;
  cases: SandboxTestCase[];
}

export interface SandboxMessage {
  type: 'TEST_RESULTS' | 'ERROR' | 'READY';
  data?: SandboxTestResult;
  error?: string;
}
