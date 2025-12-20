import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-playfair",
});

export const metadata: Metadata = {
    title: "Casa Bendang | Homestay Booking",
    description: "Modern Tropical Homestay in Malaysia",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${playfair.variable}`}>
                {children}
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}

