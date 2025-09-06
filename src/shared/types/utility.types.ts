// 유틸리티 타입들
export type Nullable<T> = T | null

// 액션 결과 타입
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  errorType?: string
}

// 검증 결과 타입
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// 모니터링 정보 타입
export interface MonitoringInfo {
  uptime: number
  errorCount: number
  transactionCount: number
  lastError?: string
  lastErrorTime?: Date
}