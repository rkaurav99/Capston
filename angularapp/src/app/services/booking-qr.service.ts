import { Injectable } from '@angular/core';
import * as QRCode from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class BookingQrService {
  async generateBookingQr(payload: { BookingId: number; UserId: number; WorkshopEventId: number; BookingStatus: string }): Promise<string> {
    const securePayload = {
      ref: `BKG-${payload.BookingId}`,
      user: payload.UserId,
      event: payload.WorkshopEventId,
      status: payload.BookingStatus
    };

    return await QRCode.toDataURL(JSON.stringify(securePayload), {
      width: 260,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  }
}
