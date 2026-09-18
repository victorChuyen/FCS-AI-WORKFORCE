/**
 * Format Firebase Auth errors into friendly, actionable Vietnamese messages.
 * Never expose raw Firebase error objects to end-users.
 */
export function getFriendlyAuthErrorMessage(errorCodeOrMessage: string): string {
  const code = errorCodeOrMessage.toLowerCase();

  if (code.includes('auth/invalid-credential') || code.includes('invalid credential')) {
    return 'Email hoặc mật khẩu không chính xác.';
  }
  if (code.includes('auth/wrong-password')) {
    return 'Mật khẩu không chính xác.';
  }
  if (code.includes('auth/user-not-found')) {
    return 'Không tìm thấy tài khoản với email này.';
  }
  if (code.includes('auth/user-disabled')) {
    return 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Có quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau ít phút.';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'Email này đã được sử dụng cho một tài khoản khác.';
  }
  if (code.includes('auth/weak-password')) {
    return 'Mật khẩu quá yếu (yêu cầu tối thiểu 6 ký tự).';
  }
  if (code.includes('auth/invalid-email')) {
    return 'Định dạng email không hợp lệ.';
  }
  if (code.includes('auth/popup-closed-by-user') || code.includes('popup closed')) {
    return 'Cửa sổ đăng nhập Google đã được đóng trước khi hoàn tất.';
  }
  if (code.includes('auth/cancelled-popup-request')) {
    return 'Yêu cầu xác thực đăng nhập đã được làm mới.';
  }
  if (code.includes('auth/network-request-failed')) {
    return 'Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra lại kết nối mạng.';
  }
  if (code.includes('auth/requires-recent-login')) {
    return 'Vui lòng đăng nhập lại để thực hiện thao tác bảo mật này.';
  }

  return 'Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.';
}
