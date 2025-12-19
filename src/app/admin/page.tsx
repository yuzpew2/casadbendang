"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
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
    ExternalLink
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
    getAddOns,
    createAddOn,
    updateAddOn,
    deleteAddOn
} from "@/lib/supabase";
import type { Property, Booking, AddOn, BookingStatus } from "@/types/database";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const router = useRouter();

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
                    <h1 className="text-xl font-bold text-primary italic">Casa Bendang Admin</h1>
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
                        icon={<Package className="w-5 h-5" />}
                        label="Add-ons"
                        active={activeTab === "addons"}
                        onClick={() => setActiveTab("addons")}
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
                {activeTab === "settings" && <SettingsTab />}
                {activeTab === "addons" && <AddOnsTab />}
                {activeTab === "bookings" && <BookingsTab />}
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

    // Calculate stats
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

            {/* Recent Bookings Preview */}
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
                                            {format(parseISO(booking.start_date), "dd MMM")} - {format(parseISO(booking.end_date), "dd MMM yyyy")}
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

function SettingsTab() {
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        whatsapp_number: "",
        price_per_night: 0,
        cleaning_fee: 0,
        description: "",
        max_guests: 10,
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
                        price_per_night: data.price_per_night,
                        cleaning_fee: data.cleaning_fee,
                        description: data.description || "",
                        max_guests: data.max_guests,
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
            const updated = await updateProperty(property.id, formData);
            if (updated) {
                setProperty(updated);
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
            <Card>
                <CardHeader>
                    <CardTitle>Property Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Property Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">WhatsApp Number (e.g., 60193452907)</label>
                        <Input
                            value={formData.whatsapp_number}
                            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price Per Night (RM)</label>
                            <Input
                                type="number"
                                value={formData.price_per_night}
                                onChange={(e) => setFormData({ ...formData, price_per_night: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cleaning Fee (RM)</label>
                            <Input
                                type="number"
                                value={formData.cleaning_fee}
                                onChange={(e) => setFormData({ ...formData, cleaning_fee: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Max Guests</label>
                            <Input
                                type="number"
                                value={formData.max_guests}
                                onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Property Description</label>
                        <textarea
                            className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </CardContent>
            </Card>
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

            {/* Add New Form */}
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

            {/* Add-ons List */}
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
                                <th className="text-left p-4 font-bold">Guests</th>
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
                                        <td className="p-4">{booking.num_guests}</td>
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
