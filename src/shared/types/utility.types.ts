// 액션 결과 타입
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
  errorType?: string
}
