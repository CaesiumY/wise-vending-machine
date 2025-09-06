/**
 * 현금 투입 성공 메시지 포맷팅
 */
export function formatSuccessMessage(type: string, data?: { amount?: number; balance?: number }): string {
  if (type === 'cash_inserted') {
    return `${data?.amount || 0}원이 투입되었습니다.\n현재 잔액: ${data?.balance || 0}원`;
  }
  
  return '작업이 완료되었습니다.';
}