import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpUtil {
 
  generateOtp(length: number = 5): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  
  createOtp(length: number = 5, expiryMinutes: number = 1) {
    const otp = this.generateOtp(length);
    const otpExpire = Date.now() + expiryMinutes * 60 * 1000; 

    return {
      otp,
      otpExpire,
    };
  }
}
