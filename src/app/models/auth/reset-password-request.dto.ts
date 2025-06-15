export interface ResetPasswordRequestDto {
    email: string;
    verificationCode: string;
    newPassword: string;
    confirmPassword: string;
  }