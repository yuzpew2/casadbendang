import { format } from 'date-fns';
import type { RoomCount } from '@/types/database';

interface WhatsAppParams {
    propertyId: string;
    propertyName: string;
    startDate: Date;
    endDate: Date;
    nights: number;
    guests: number;
    roomCount: RoomCount;
    totalPrice: number;
    addOns: { name: string; price: number }[];
    whatsappNumber: string;
    guestName: string;
    guestPhone: string;
    bookingRef: string;
}

export function generateWhatsAppLink(params: WhatsAppParams): string {
    const {
        propertyName,
        startDate,
        endDate,
        nights,
        guests,
        roomCount,
        totalPrice,
        addOns,
        whatsappNumber,
        guestName,
        guestPhone,
        bookingRef,
    } = params;

    const formattedStart = format(startDate, 'dd MMM yyyy');
    const formattedEnd = format(endDate, 'dd MMM yyyy');

    let message = `*BOOKING REQUEST*\n`;
    message += `Ref: #${bookingRef}\n\n`;
    message += `Hi, I'd like to book *${propertyName}*\n\n`;
    message += `*Guest Details:*\n`;
    message += `Name: ${guestName}\n`;
    message += `Phone: ${guestPhone}\n\n`;
    message += `*Booking Details:*\n`;
    message += `📅 Check-in: ${formattedStart}\n`;
    message += `📅 Check-out: ${formattedEnd}\n`;
    message += `🌙 ${nights} night(s)\n`;
    message += `🚪 ${roomCount} rooms\n`;
    message += `👥 ${guests} guest(s)\n\n`;

    if (addOns.length > 0) {
        message += `*Add-ons:*\n`;
        addOns.forEach(addon => {
            message += `• ${addon.name}: RM${addon.price}\n`;
        });
        message += '\n';
    }

    message += `💰 *Total: RM${totalPrice}*\n\n`;
    message += `Is this available? Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}
