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
    } = params;

    const formattedStart = format(startDate, 'dd MMM yyyy');
    const formattedEnd = format(endDate, 'dd MMM yyyy');

    let message = `Hi, I'd like to book *${propertyName}* from *${formattedStart}* to *${formattedEnd}* (${nights} nights) for ${guests} guests with ${roomCount} rooms.\n\n`;

    if (addOns.length > 0) {
        message += `*Add-ons:*\n`;
        addOns.forEach(addon => {
            message += `- ${addon.name}: RM${addon.price}\n`;
        });
        message += '\n';
    }

    message += `*Total Quote:* RM${totalPrice}\n\n`;
    message += `Is it available?`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}
