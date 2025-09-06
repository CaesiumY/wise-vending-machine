import type { CashDenomination, ProductType } from '@/shared/types/common.types';

/**
 * 금액을 한국 통화 형식으로 포맷팅
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/**
 * 간단한 금액 포맷팅 (원 단위)
 */
export function formatAmount(amount: number): string {
  return `${amount}원`;
}

/**
 * 시간을 포맷팅 (HH:MM:SS)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 날짜를 포맷팅 (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 날짜와 시간을 모두 포맷팅
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * 남은 시간을 포맷팅 (MM:SS)
 */
export function formatRemainingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 투입된 현금 목록을 포맷팅
 */
export function formatCashList(cashList: CashDenomination[]): string {
  if (cashList.length === 0) return '투입된 현금이 없습니다.';
  
  const grouped = cashList.reduce((acc, amount) => {
    acc[amount] = (acc[amount] || 0) + 1;
    return acc;
  }, {} as Record<CashDenomination, number>);
  
  return Object.entries(grouped)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([amount, count]) => `${formatAmount(Number(amount))} x${count}`)
    .join(', ');
}

/**
 * 거스름돈 구성을 포맷팅
 */
export function formatChangeBreakdown(
  breakdown: Record<CashDenomination, number>
): string {
  const items = Object.entries(breakdown)
    .filter(([_, count]) => count > 0)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([amount, count]) => `${formatAmount(Number(amount))} x${count}`);
    
  return items.length > 0 ? items.join(', ') : '거스름돈 없음';
}

/**
 * 상품 정보를 포맷팅
 */
export function formatProductInfo(productId: ProductType, price: number, stock: number): string {
  const productNames: Record<ProductType, string> = {
    cola: '콜라',
    water: '물',
    coffee: '커피'
  };
  
  const stockStatus = stock > 0 ? `(재고 ${stock}개)` : '(품절)';
  return `${productNames[productId]} ${formatAmount(price)} ${stockStatus}`;
}

/**
 * 구매 결과 메시지 포맷팅
 */
export function formatPurchaseMessage(
  productName: string, 
  price: number, 
  change: number
): string {
  let message = `${productName}을(를) 구매했습니다.\n결제 금액: ${formatAmount(price)}`;
  
  if (change > 0) {
    message += `\n거스름돈: ${formatAmount(change)}을 받아가세요.`;
  }
  
  return message;
}

/**
 * 오류 메시지 템플릿
 */
export function formatErrorMessage(errorType: string, details?: string): string {
  const templates: Record<string, string> = {
    fake_money_detected: '위조화폐가 감지되었습니다.',
    change_shortage: '거스름돈이 부족합니다.',
    out_of_stock: '선택하신 음료가 품절되었습니다.',
    dispense_failure: '음료 배출에 실패했습니다.',
    system_maintenance: '시스템 점검 중입니다.',
    card_reader_fault: '카드를 인식할 수 없습니다.',
    network_error: '네트워크 오류가 발생했습니다.',
  };
  
  let message = templates[errorType] || '알 수 없는 오류가 발생했습니다.';
  
  if (details) {
    message += `\n${details}`;
  }
  
  return message;
}

/**
 * 성공 메시지 템플릿
 */
export function formatSuccessMessage(type: string, data?: { amount?: number; balance?: number; productName?: string; price?: number; change?: number; breakdown?: Record<string, number> }): string {
  switch (type) {
    case 'cash_inserted':
      return `${formatAmount(data?.amount || 0)}이 투입되었습니다.\n현재 잔액: ${formatAmount(data?.balance || 0)}`;
    
    case 'purchase_completed':
      return formatPurchaseMessage(data?.productName || '', data?.price || 0, data?.change || 0);
    
    case 'cash_returned':
      return `${formatAmount(data?.amount || 0)}을 반환했습니다.`;
    
    case 'change_dispensed':
      return `거스름돈 ${formatAmount(data?.amount || 0)}을 받아가세요.\n${formatChangeBreakdown(data?.breakdown as Record<CashDenomination, number> || { 100: 0, 500: 0, 1000: 0, 5000: 0, 10000: 0 })}`;
    
    default:
      return '작업이 완료되었습니다.';
  }
}

/**
 * 버튼 라벨 포맷팅
 */
export function formatButtonLabel(
  productName: string, 
  price: number, 
  isAvailable: boolean,
  reason?: string
): string {
  if (!isAvailable && reason) {
    return `${productName}\n${formatAmount(price)}\n(${reason})`;
  }
  
  return `${productName}\n${formatAmount(price)}`;
}


