/**
 * Firebase를 사용하는 API 모듈
 */
export * from './firebaseApi';

/**
 * API 기본 URL (레거시 호환성)
 * TODO: 모든 페이지에서 firebaseApi 직접 사용으로 변경 필요
 */
export const getApiUrl = (): string => {
  return 'about:blank'; // 사용 금지
};
