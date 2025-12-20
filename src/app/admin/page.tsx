"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
    Home,
    Calendar as CalendarIcon,
    Settings,
    LogOut,
    Package,
    Loader2,
    Plus,
    Trash2,
    Check,
    X,
    ExternalLink,
    ImageIcon,
    Upload,
    GripVertical,
    Instagram,
    Facebook,
    AlertCircle,
    Wifi,
    Megaphone,
    Users,
    Tag,
    Phone,
    Mail
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
    getProperty,
    updateProperty,
    getBookings,
    updateBookingStatus,
    deleteBooking,
    cancelExpiredPendingBookings,
    getAddOns,
    createAddOn,
    updateAddOn,
    deleteAddOn,
    getPropertyImages,
    createPropertyImage,
    deletePropertyImage,
    uploadImage,
    reorderPropertyImages,
    getAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getGuests,
    updateGuest,
    addGuestTag,
    removeGuestTag
} from "@/lib/supabase";
import type { Property, Booking, AddOn, PropertyImage, BookingStatus, Amenity, Campaign, Guest } from "@/types/database";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

// TikTok icon
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    );
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [property, setProperty] = useState<Property | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchProperty() {
            const data = await getProperty();
            setProperty(data);
        }
        fetchProperty();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            toast.success("Logged out successfully");
            router.push("/login");
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col">
                <div className="p-6 border-b">
                    {property?.logo_url ? (
                        <Image
                            src={property.logo_url}
                            alt={property.name}
                            width={150}
                            height={50}
                            className="object-contain"
                        />
                    ) : (
                        <h1 className="text-xl font-bold text-primary italic">Casa Bendang Admin</h1>
                    )}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem
                        icon={<Home className="w-5 h-5" />}
                        label="Overview"
                        active={activeTab === "overview"}
                        onClick={() => setActiveTab("overview")}
                    />
                    <SidebarItem
                        icon={<CalendarIcon className="w-5 h-5" />}
                        label="Bookings"
                        active={activeTab === "bookings"}
                        onClick={() => setActiveTab("bookings")}
                    />
                    <SidebarItem
                        icon={<ImageIcon className="w-5 h-5" />}
                        label="Images"
                        active={activeTab === "images"}
                        onClick={() => setActiveTab("images")}
                    />
                    <SidebarItem
                        icon={<Package className="w-5 h-5" />}
                        label="Add-ons"
                        active={activeTab === "addons"}
                        onClick={() => setActiveTab("addons")}
                    />
                    <SidebarItem
                        icon={<Wifi className="w-5 h-5" />}
                        label="Amenities"
                        active={activeTab === "amenities"}
                        onClick={() => setActiveTab("amenities")}
                    />
                    <SidebarItem
                        icon={<Megaphone className="w-5 h-5" />}
                        label="Campaigns"
                        active={activeTab === "campaigns"}
                        onClick={() => setActiveTab("campaigns")}
                    />
                    <SidebarItem
                        icon={<Users className="w-5 h-5" />}
                        label="Guests"
                        active={activeTab === "guests"}
                        onClick={() => setActiveTab("guests")}
                    />
                    <SidebarItem
                        icon={<Settings className="w-5 h-5" />}
                        label="Settings"
                        active={activeTab === "settings"}
                        onClick={() => setActiveTab("settings")}
                    />
                </nav>
                <div className="p-4 border-t space-y-2">
                    <Link href="/" className="block">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                            <ExternalLink className="w-5 h-5" />
                            View Site
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-auto">
                {activeTab === "overview" && <OverviewTab />}
                {activeTab === "settings" && <SettingsTab onUpdate={setProperty} />}
                {activeTab === "addons" && <AddOnsTab />}
                {activeTab === "amenities" && <AmenitiesTab />}
                {activeTab === "campaigns" && <CampaignsTab />}
                {activeTab === "guests" && <GuestsTab />}
                {activeTab === "bookings" && <BookingsTab />}
                {activeTab === "images" && <ImagesTab />}
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                ? "bg-primary text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}

function OverviewTab() {
    const [property, setProperty] = useState<Property | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();
                if (propertyData) {
                    setProperty(propertyData);

                    // Auto-cancel expired pending bookings on dashboard load
                    const timeoutHours = propertyData.pending_timeout_hours || 24;
                    const cancelledCount = await cancelExpiredPendingBookings(propertyData.id, timeoutHours);
                    if (cancelledCount > 0) {
                        toast.info(`Auto-cancelled ${cancelledCount} expired pending booking(s)`);
                    }

                    const bookingsData = await getBookings(propertyData.id);
                    setBookings(bookingsData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthBookings = bookings.filter(b => {
        const createdAt = parseISO(b.created_at);
        return isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
    });

    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const maintenanceDays = bookings.filter(b => b.status === 'maintenance').length;

    const estimatedRevenue = confirmedBookings.reduce((sum, b) => sum + b.total_price, 0);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Bookings This Month"
                    value={thisMonthBookings.length.toString()}
                    description={`${pendingBookings.length} pending`}
                />
                <StatCard
                    title="Confirmed"
                    value={confirmedBookings.length.toString()}
                    description="Active bookings"
                />
                <StatCard
                    title="Revenue (Est)"
                    value={`RM ${estimatedRevenue.toLocaleString()}`}
                    description="From confirmed bookings"
                />
                <StatCard
                    title="Maintenance Blocks"
                    value={maintenanceDays.toString()}
                    description="Calendar blocked"
                />
            </div>

            {/* Pending Alerts */}
            {pendingBookings.length > 0 && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                            Pending Bookings - Action Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingBookings.map((booking) => {
                                const createdAt = parseISO(booking.created_at);
                                const timeoutHours = property?.pending_timeout_hours || 24;
                                const expiresAt = new Date(createdAt.getTime() + timeoutHours * 60 * 60 * 1000);
                                const now = new Date();
                                const hoursRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));
                                const isUrgent = hoursRemaining <= 2;

                                return (
                                    <div key={booking.id} className={`flex items-center justify-between p-3 bg-white rounded-lg border ${isUrgent ? 'border-red-300' : 'border-amber-200'}`}>
                                        <div>
                                            <p className="font-medium">{booking.guest_name || "Guest"}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.guest_phone} • {format(parseISO(booking.start_date), "dd MMM")} - {format(parseISO(booking.end_date), "dd MMM")}
                                            </p>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <p className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                                                    {hoursRemaining > 0 ? `${hoursRemaining}h left` : 'Expiring soon!'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">RM{booking.total_price}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => {
                                                        updateBookingStatus(booking.id, 'confirmed').then(() => {
                                                            window.location.reload();
                                                        });
                                                    }}
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                                    onClick={() => {
                                                        updateBookingStatus(booking.id, 'cancelled').then(() => {
                                                            window.location.reload();
                                                        });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    {bookings.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No bookings yet</p>
                    ) : (
                        <div className="space-y-4">
                            {bookings.slice(0, 5).map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{booking.guest_name || "Guest"}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(parseISO(booking.start_date), "dd MMM")} - {format(parseISO(booking.end_date), "dd MMM yyyy")} • {booking.room_count} rooms
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <StatusBadge status={booking.status} />
                                        <p className="text-sm font-medium mt-1">RM{booking.total_price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, description }: { title: string, value: string, description: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: BookingStatus }) {
    const styles: Record<BookingStatus, string> = {
        confirmed: "bg-green-100 text-green-700",
        pending: "bg-amber-100 text-amber-700",
        cancelled: "bg-red-100 text-red-700",
        maintenance: "bg-slate-100 text-slate-700",
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

function SettingsTab({ onUpdate }: { onUpdate: (property: Property) => void }) {
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: "",
        whatsapp_number: "",
        price_3_rooms: 350,
        price_4_rooms: 450,
        price_6_rooms: 650,
        description: "",
        max_guests: 10,
        instagram_url: "",
        facebook_url: "",
        tiktok_url: "",
        logo_url: "",
        pending_timeout_hours: 24,
        footer_description: "",
        google_maps_url: "",
    });

    useEffect(() => {
        async function fetchProperty() {
            try {
                const data = await getProperty();
                if (data) {
                    setProperty(data);
                    setFormData({
                        name: data.name,
                        whatsapp_number: data.whatsapp_number || "",
                        price_3_rooms: data.price_3_rooms,
                        price_4_rooms: data.price_4_rooms,
                        price_6_rooms: data.price_6_rooms,
                        description: data.description || "",
                        max_guests: data.max_guests,
                        instagram_url: data.instagram_url || "",
                        facebook_url: data.facebook_url || "",
                        tiktok_url: data.tiktok_url || "",
                        logo_url: data.logo_url || "",
                        pending_timeout_hours: data.pending_timeout_hours || 24,
                        footer_description: data.footer_description || "",
                        google_maps_url: data.google_maps_url || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching property:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProperty();
    }, []);

    const handleSave = async () => {
        if (!property) return;
        setIsSaving(true);
        try {
            const updated = await updateProperty(property.id, {
                ...formData,
                instagram_url: formData.instagram_url || null,
                facebook_url: formData.facebook_url || null,
                tiktok_url: formData.tiktok_url || null,
                logo_url: formData.logo_url || null,
                pending_timeout_hours: formData.pending_timeout_hours,
            });
            if (updated) {
                setProperty(updated);
                onUpdate(updated);
                toast.success("Settings saved successfully!");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingLogo(true);
        try {
            const url = await uploadImage(file, 'logos');
            if (url) {
                setFormData({ ...formData, logo_url: url });
                toast.success("Logo uploaded!");
            } else {
                toast.error("Failed to upload logo");
            }
        } catch (error) {
            toast.error("Failed to upload logo");
        } finally {
            setIsUploadingLogo(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <h2 className="text-3xl font-bold">General Settings</h2>

            {/* Logo Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Logo</CardTitle>
                    <CardDescription>Upload your property logo (recommended: 300x100px, PNG or SVG)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                        {formData.logo_url ? (
                            <div className="relative">
                                <Image
                                    src={formData.logo_url}
                                    alt="Logo"
                                    width={150}
                                    height={50}
                                    className="object-contain border rounded-lg p-2"
                                />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                                    onClick={() => setFormData({ ...formData, logo_url: "" })}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="w-[150px] h-[50px] border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                                No logo
                            </div>
                        )}
                        <input
                            type="file"
                            ref={logoInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <Button
                            variant="outline"
                            onClick={() => logoInputRef.current?.click()}
                            disabled={isUploadingLogo}
                        >
                            {isUploadingLogo ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload Logo
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Property Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Property Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">WhatsApp Number</label>
                            <Input
                                value={formData.whatsapp_number}
                                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                placeholder="60193452907"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Max Guests</label>
                        <Input
                            type="number"
                            value={formData.max_guests}
                            onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })}
                            className="w-32"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Footer Description</label>
                        <Input
                            placeholder="e.g., Dedicated to providing cozy tropical experiences."
                            value={formData.footer_description}
                            onChange={(e) => setFormData({ ...formData, footer_description: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Shown at the bottom of the website next to your property name.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Room Pricing */}
            <Card>
                <CardHeader>
                    <CardTitle>Room Pricing</CardTitle>
                    <CardDescription>Set prices per night for each room configuration</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">3 Rooms (RM/night)</label>
                            <Input
                                type="number"
                                value={formData.price_3_rooms}
                                onChange={(e) => setFormData({ ...formData, price_3_rooms: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">4 Rooms (RM/night)</label>
                            <Input
                                type="number"
                                value={formData.price_4_rooms}
                                onChange={(e) => setFormData({ ...formData, price_4_rooms: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">6 Rooms (RM/night)</label>
                            <Input
                                type="number"
                                value={formData.price_6_rooms}
                                onChange={(e) => setFormData({ ...formData, price_6_rooms: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
                <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Add your social media profiles (they'll appear on the landing page)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white">
                            <Instagram className="w-5 h-5" />
                        </div>
                        <Input
                            placeholder="https://instagram.com/yourusername"
                            value={formData.instagram_url}
                            onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                            className="flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-600 text-white">
                            <Facebook className="w-5 h-5" />
                        </div>
                        <Input
                            placeholder="https://facebook.com/yourpage"
                            value={formData.facebook_url}
                            onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                            className="flex-1"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-black text-white">
                            <TikTokIcon className="w-5 h-5" />
                        </div>
                        <Input
                            placeholder="https://tiktok.com/@yourusername"
                            value={formData.tiktok_url}
                            onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                            className="flex-1"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Booking Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Booking Settings</CardTitle>
                    <CardDescription>Configure how bookings are handled</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pending Booking Timeout (hours)</label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                value={formData.pending_timeout_hours}
                                onChange={(e) => setFormData({ ...formData, pending_timeout_hours: parseInt(e.target.value) || 24 })}
                                className="w-32"
                                min={1}
                                max={168}
                            />
                            <span className="text-sm text-muted-foreground">
                                Pending bookings will auto-cancel after this time if not confirmed
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Recommended: 24-48 hours. This gives guests time to confirm while keeping your calendar accurate.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Google Maps */}
            <Card>
                <CardHeader>
                    <CardTitle>Location</CardTitle>
                    <CardDescription>Add a Google Maps embed to show your property location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Google Maps Embed Code</label>
                        <textarea
                            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450" ...></iframe>'
                            value={formData.google_maps_url}
                            onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                            className="w-full min-h-[100px] p-3 border rounded-md text-sm font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                            Go to Google Maps → Search your location → Click Share → Embed a map → Copy the HTML iframe code and paste here.
                        </p>
                    </div>
                    {formData.google_maps_url && (
                        <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Preview:</p>
                            <div
                                className="w-full h-[200px] rounded-lg overflow-hidden border"
                                dangerouslySetInnerHTML={{ __html: formData.google_maps_url }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={isSaving} size="lg">
                {isSaving ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    "Save All Changes"
                )}
            </Button>
        </div>
    );
}

function ImagesTab() {
    const [property, setProperty] = useState<Property | null>(null);
    const [images, setImages] = useState<PropertyImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();
                if (propertyData) {
                    setProperty(propertyData);
                    const imagesData = await getPropertyImages(propertyData.id);
                    setImages(imagesData);
                }
            } catch (error) {
                console.error("Error fetching images:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length || !property) return;

        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                const url = await uploadImage(file, 'gallery');
                if (url) {
                    const newImage = await createPropertyImage({
                        property_id: property.id,
                        url,
                        alt_text: file.name.split('.')[0],
                        sort_order: images.length,
                    });
                    if (newImage) {
                        setImages(prev => [...prev, newImage]);
                    }
                }
            }
            toast.success("Images uploaded!");
        } catch (error) {
            toast.error("Failed to upload some images");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (image: PropertyImage) => {
        if (!confirm("Delete this image?")) return;

        const success = await deletePropertyImage(image.id);
        if (success) {
            setImages(images.filter(i => i.id !== image.id));
            toast.success("Image deleted");
        } else {
            toast.error("Failed to delete image");
        }
    };

    const moveImage = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= images.length) return;

        const newImages = [...images];
        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];

        // Update sort_order
        const updates = newImages.map((img, i) => ({ id: img.id, sort_order: i }));
        const success = await reorderPropertyImages(updates);

        if (success) {
            setImages(newImages.map((img, i) => ({ ...img, sort_order: i })));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Gallery Images</h2>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        Upload Images
                    </Button>
                </div>
            </div>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Image Tips</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Recommended size: <strong>1920 x 1080 pixels</strong> (16:9 ratio)</li>
                                <li>Supported formats: JPG, PNG, WebP</li>
                                <li>Maximum 10 images for best performance</li>
                                <li>First image will be the main hero image</li>
                                <li>Drag to reorder or use arrows to change order</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Image Grid */}
            {images.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No images yet. Upload your first image!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                        <Card key={image.id} className="overflow-hidden group relative">
                            <div className="aspect-video relative">
                                <Image
                                    src={image.url}
                                    alt={image.alt_text || 'Property image'}
                                    fill
                                    className="object-cover"
                                />
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                        Main
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {index > 0 && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => moveImage(index, 'up')}
                                    >
                                        ↑
                                    </Button>
                                )}
                                {index < images.length - 1 && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => moveImage(index, 'down')}
                                    >
                                        ↓
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDelete(image)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function AddOnsTab() {
    const [property, setProperty] = useState<Property | null>(null);
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newAddOn, setNewAddOn] = useState({ name: "", price: 0 });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();
                if (propertyData) {
                    setProperty(propertyData);
                    const addOnsData = await getAddOns(propertyData.id);
                    setAddOns(addOnsData);
                }
            } catch (error) {
                console.error("Error fetching add-ons:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleAddNew = async () => {
        if (!property || !newAddOn.name) return;
        setIsAdding(true);
        try {
            const created = await createAddOn({
                property_id: property.id,
                name: newAddOn.name,
                price: newAddOn.price,
            });
            if (created) {
                setAddOns([...addOns, created]);
                setNewAddOn({ name: "", price: 0 });
                toast.success("Add-on created!");
            }
        } catch (error) {
            toast.error("Failed to create add-on");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this add-on?")) return;
        try {
            const success = await deleteAddOn(id);
            if (success) {
                setAddOns(addOns.filter(a => a.id !== id));
                toast.success("Add-on deleted");
            }
        } catch (error) {
            toast.error("Failed to delete add-on");
        }
    };

    const handleToggleActive = async (addon: AddOn) => {
        try {
            const updated = await updateAddOn(addon.id, { is_active: !addon.is_active });
            if (updated) {
                setAddOns(addOns.map(a => a.id === addon.id ? updated : a));
                toast.success(updated.is_active ? "Add-on activated" : "Add-on deactivated");
            }
        } catch (error) {
            toast.error("Failed to update add-on");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Manage Add-ons</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Add New</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="Add-on name"
                            value={newAddOn.name}
                            onChange={(e) => setNewAddOn({ ...newAddOn, name: e.target.value })}
                            className="flex-1"
                        />
                        <Input
                            type="number"
                            placeholder="Price (RM)"
                            value={newAddOn.price || ""}
                            onChange={(e) => setNewAddOn({ ...newAddOn, price: parseInt(e.target.value) || 0 })}
                            className="w-32"
                        />
                        <Button onClick={handleAddNew} disabled={isAdding || !newAddOn.name}>
                            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-slate-50">
                                <th className="text-left p-4 font-bold">Item Name</th>
                                <th className="text-left p-4 font-bold">Price (RM)</th>
                                <th className="text-left p-4 font-bold">Status</th>
                                <th className="text-right p-4 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addOns.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No add-ons yet. Create one above!
                                    </td>
                                </tr>
                            ) : (
                                addOns.map((addon) => (
                                    <tr key={addon.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium">{addon.name}</td>
                                        <td className="p-4">{addon.price}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${addon.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {addon.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleActive(addon)}
                                            >
                                                {addon.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(addon.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}

function AmenitiesTab() {
    const [property, setProperty] = useState<Property | null>(null);
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [newIcon, setNewIcon] = useState("Check");

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();
                if (propertyData) {
                    setProperty(propertyData);
                    const amenitiesData = await getAmenities(propertyData.id);
                    setAmenities(amenitiesData);
                }
            } catch (error) {
                console.error("Error fetching amenities:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleAddNew = async () => {
        if (!newName.trim() || !property) return;

        try {
            const amenity = await createAmenity({
                property_id: property.id,
                name: newName.trim(),
                icon: newIcon || "Check",
            });

            if (amenity) {
                setAmenities([...amenities, amenity]);
                setNewName("");
                setNewIcon("Check");
                toast.success("Amenity added!");
            }
        } catch (error) {
            toast.error("Failed to add amenity");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const success = await deleteAmenity(id);
            if (success) {
                setAmenities(amenities.filter(a => a.id !== id));
                toast.success("Amenity deleted");
            }
        } catch (error) {
            toast.error("Failed to delete amenity");
        }
    };

    const handleToggleActive = async (amenity: Amenity) => {
        try {
            const updated = await updateAmenity(amenity.id, { is_active: !amenity.is_active });
            if (updated) {
                setAmenities(amenities.map(a => a.id === amenity.id ? updated : a));
                toast.success(`Amenity ${updated.is_active ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            toast.error("Failed to update amenity");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const iconOptions = ["Waves", "Mountain", "UtensilsCrossed", "Car", "Wind", "Wifi", "Tv", "WashingMachine", "Check", "Coffee", "Bed", "Bath"];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Amenities</h1>
                <p className="text-muted-foreground">
                    Manage property amenities displayed to customers
                </p>
            </div>

            {/* Add New Amenity */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Amenity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="e.g., Swimming Pool"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1"
                        />
                        <select
                            value={newIcon}
                            onChange={(e) => setNewIcon(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                        >
                            {iconOptions.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                            ))}
                        </select>
                        <Button onClick={handleAddNew} disabled={!newName.trim()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Amenities List */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Amenities ({amenities.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {amenities.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No amenities yet. Add your first amenity above.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {amenities.map((amenity) => (
                                <div
                                    key={amenity.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg ${amenity.is_active ? "bg-white" : "bg-slate-50 opacity-60"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground w-24">
                                            Icon: {amenity.icon}
                                        </span>
                                        <span className="font-medium">{amenity.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant={amenity.is_active ? "outline" : "default"}
                                            size="sm"
                                            onClick={() => handleToggleActive(amenity)}
                                        >
                                            {amenity.is_active ? "Disable" : "Enable"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(amenity.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function CampaignsTab() {
    const [property, setProperty] = useState<Property | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        title: "",
        message: "",
        start_date: "",
        end_date: "",
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();
                if (propertyData) {
                    setProperty(propertyData);
                    const campaignsData = await getCampaigns(propertyData.id);
                    setCampaigns(campaignsData);
                }
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleCreate = async () => {
        if (!newCampaign.title.trim() || !newCampaign.message.trim() || !property) return;
        if (!newCampaign.start_date || !newCampaign.end_date) {
            toast.error("Please set start and end dates");
            return;
        }

        setIsCreating(true);
        try {
            const campaign = await createCampaign({
                property_id: property.id,
                title: newCampaign.title.trim(),
                message: newCampaign.message.trim(),
                start_date: new Date(newCampaign.start_date).toISOString(),
                end_date: new Date(newCampaign.end_date).toISOString(),
            });

            if (campaign) {
                setCampaigns([campaign, ...campaigns]);
                setNewCampaign({ title: "", message: "", start_date: "", end_date: "" });
                toast.success("Campaign created!");
            }
        } catch (error) {
            toast.error("Failed to create campaign");
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleActive = async (campaign: Campaign) => {
        try {
            const updated = await updateCampaign(campaign.id, { is_active: !campaign.is_active });
            if (updated) {
                setCampaigns(campaigns.map(c => c.id === campaign.id ? updated : c));
                toast.success(`Campaign ${updated.is_active ? 'activated' : 'deactivated'}`);
            }
        } catch (error) {
            toast.error("Failed to update campaign");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const success = await deleteCampaign(id);
            if (success) {
                setCampaigns(campaigns.filter(c => c.id !== id));
                toast.success("Campaign deleted");
            }
        } catch (error) {
            toast.error("Failed to delete campaign");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const now = new Date();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
                <p className="text-muted-foreground">
                    Create promotional popups that appear to customers when they visit your site
                </p>
            </div>

            {/* Create New Campaign */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Campaign</CardTitle>
                    <CardDescription>Promotions will display as a popup to visitors during the active period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Campaign Title</label>
                        <Input
                            placeholder="e.g., School Holiday Special - 20% Off!"
                            value={newCampaign.title}
                            onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <textarea
                            placeholder="Describe your promotion..."
                            value={newCampaign.message}
                            onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                            className="w-full min-h-[100px] p-3 border rounded-md"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input
                                type="date"
                                value={newCampaign.start_date}
                                onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <Input
                                type="date"
                                value={newCampaign.end_date}
                                onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleCreate}
                        disabled={!newCampaign.title.trim() || !newCampaign.message.trim() || isCreating}
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Megaphone className="w-4 h-4 mr-2" />
                                Launch Campaign
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Campaigns List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Campaigns ({campaigns.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {campaigns.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No campaigns yet. Create your first campaign above.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {campaigns.map((campaign) => {
                                const startDate = new Date(campaign.start_date);
                                const endDate = new Date(campaign.end_date);
                                const isCurrentlyActive = campaign.is_active && now >= startDate && now <= endDate;
                                const isExpired = now > endDate;
                                const isUpcoming = now < startDate;

                                return (
                                    <div
                                        key={campaign.id}
                                        className={`p-4 border rounded-lg ${isCurrentlyActive
                                            ? "bg-green-50 border-green-200"
                                            : isExpired
                                                ? "bg-slate-50 opacity-60"
                                                : "bg-white"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-lg">{campaign.title}</h3>
                                                    {isCurrentlyActive && (
                                                        <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                                                            LIVE
                                                        </span>
                                                    )}
                                                    {isExpired && (
                                                        <span className="px-2 py-0.5 text-xs bg-slate-400 text-white rounded-full">
                                                            EXPIRED
                                                        </span>
                                                    )}
                                                    {isUpcoming && campaign.is_active && (
                                                        <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                                                            UPCOMING
                                                        </span>
                                                    )}
                                                    {!campaign.is_active && (
                                                        <span className="px-2 py-0.5 text-xs bg-slate-400 text-white rounded-full">
                                                            DISABLED
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground mb-2">{campaign.message}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(startDate, "MMM d, yyyy")} - {format(endDate, "MMM d, yyyy")}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant={campaign.is_active ? "outline" : "default"}
                                                    size="sm"
                                                    onClick={() => handleToggleActive(campaign)}
                                                >
                                                    {campaign.is_active ? "Disable" : "Enable"}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(campaign.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function GuestsTab() {
    const [property, setProperty] = useState<Property | null>(null);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTags, setEditingTags] = useState<string | null>(null);
    const [startTagInput, setStartTagInput] = useState("");

    const PREDEFINED_TAGS = ["VIP", "Repeat", "Family", "Couple", "Messy", "Late Checkout", "Early Checkin"];

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();
                if (propertyData) {
                    setProperty(propertyData);
                    const guestsData = await getGuests(propertyData.id);
                    setGuests(guestsData);
                }
            } catch (error) {
                console.error("Error fetching guests:", error);
                toast.error("Failed to load guests");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleAddTag = async (guestId: string, tag: string) => {
        const guest = guests.find(g => g.id === guestId);
        if (!guest || guest.tags.includes(tag)) return;

        try {
            const updated = await addGuestTag(guestId, guest.tags, tag);
            if (updated) {
                setGuests(guests.map(g => g.id === guestId ? updated : g));
                toast.success(`Tagged as ${tag}`);
            }
        } catch (error) {
            toast.error("Failed to add tag");
        }
    };

    const handleRemoveTag = async (guestId: string, tag: string) => {
        const guest = guests.find(g => g.id === guestId);
        if (!guest) return;

        try {
            const updated = await removeGuestTag(guestId, guest.tags, tag);
            if (updated) {
                setGuests(guests.map(g => g.id === guestId ? updated : g));
                toast.success(`Tag ${tag} removed`);
            }
        } catch (error) {
            toast.error("Failed to remove tag");
        }
    };

    const filteredGuests = guests.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone.includes(searchTerm) ||
        (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Guest CRM</h1>
                <p className="text-muted-foreground">
                    Manage guest profiles, history, and preferences.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Guest List ({guests.length})</CardTitle>
                    <div className="flex gap-4 mt-2">
                        <Input
                            placeholder="Search by name, phone, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredGuests.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No guests found. Guests are automatically added when they book.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {filteredGuests.map((guest) => (
                                <div key={guest.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg">{guest.name}</h3>
                                                <div className="flex gap-1">
                                                    {guest.tags.map(tag => (
                                                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                            {tag}
                                                            <button
                                                                onClick={() => handleRemoveTag(guest.id, tag)}
                                                                className="ml-1 text-blue-600 hover:text-blue-900"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" /> {guest.phone}
                                                </div>
                                                {guest.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4" /> {guest.email}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4" /> Last Stay: {guest.last_stay_date || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4" /> Total Stays: {guest.total_stays}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tagging Interface */}
                                        <div className="flex items-start gap-2">
                                            <div className="dropdown relative group">
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Tag className="w-4 h-4" />
                                                    Add Tag
                                                </Button>
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded shadow-lg hidden group-hover:block z-50">
                                                    {PREDEFINED_TAGS.map(tag => (
                                                        <button
                                                            key={tag}
                                                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                            onClick={() => handleAddTag(guest.id, tag)}
                                                        >
                                                            {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {guest.notes && (
                                        <div className="mt-3 p-2 bg-yellow-50 text-sm border-l-2 border-yellow-400">
                                            <span className="font-semibold text-yellow-800">Note:</span> {guest.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function BookingsTab() {
    const [property, setProperty] = useState<Property | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const propertyData = await getProperty();
                if (propertyData) {
                    setProperty(propertyData);
                    const bookingsData = await getBookings(propertyData.id);
                    setBookings(bookingsData);
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleUpdateStatus = async (id: string, status: BookingStatus) => {
        try {
            const updated = await updateBookingStatus(id, status);
            if (updated) {
                setBookings(bookings.map(b => b.id === id ? updated : b));
                toast.success(`Booking ${status}`);
            }
        } catch (error) {
            toast.error("Failed to update booking");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this booking?")) return;
        try {
            const success = await deleteBooking(id);
            if (success) {
                setBookings(bookings.filter(b => b.id !== id));
                toast.success("Booking deleted");
            }
        } catch (error) {
            toast.error("Failed to delete booking");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">All Bookings</h2>
            <Card>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-slate-50">
                                <th className="text-left p-4 font-bold">Guest</th>
                                <th className="text-left p-4 font-bold">Dates</th>
                                <th className="text-left p-4 font-bold">Rooms</th>
                                <th className="text-left p-4 font-bold">Status</th>
                                <th className="text-left p-4 font-bold">Total</th>
                                <th className="text-right p-4 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No bookings yet
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium">{booking.guest_name || "Guest"}</p>
                                            {booking.guest_phone && (
                                                <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {format(parseISO(booking.start_date), "dd MMM")} - {format(parseISO(booking.end_date), "dd MMM yyyy")}
                                        </td>
                                        <td className="p-4">{booking.room_count} rooms</td>
                                        <td className="p-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="p-4 font-medium">RM{booking.total_price}</td>
                                        <td className="p-4 text-right space-x-1">
                                            {booking.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700"
                                                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                    >
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-amber-600 hover:text-amber-700"
                                                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Cancel
                                                    </Button>
                                                </>
                                            )}
                                            {booking.status === 'confirmed' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-amber-600 hover:text-amber-700"
                                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(booking.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
