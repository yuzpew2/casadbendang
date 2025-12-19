import { format } from 'date-fns';

interface GenerateWhatsAppLinkProps {
    propertyId: string;
    propertyName: string;
    startDate: Date;
    endDate: Date;
    nights: number;
    guests: number;
    totalPrice: number;
    addOns: { name: string; price: number }[];
    whatsappNumber: string;
}

export function generateWhatsAppLink({
    propertyName,
    startDate,
    endDate,
    nights,
    guests,
    totalPrice,
    addOns,
    whatsappNumber,
}: GenerateWhatsAppLinkProps) {
    const startStr = format(startDate, 'dd MMM yyyy');
    const endStr = format(endDate, 'dd MMM yyyy');

    const addOnsText = addOns.length > 0
        ? `\nAdd-ons: ${addOns.map(a => `${a.name} (RM${a.price})`).join(', ')}`
        : '';

    const message = `Hi, I'd like to book ${propertyName} from ${startStr} to ${endStr} (${nights} nights) for ${guests} guests.${addOnsText}\n\nQuote: RM${totalPrice}\n\nIs it available?`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}
