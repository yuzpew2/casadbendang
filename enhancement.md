Here is the comprehensive implementation plan and code to add the **Campaign Module**, **Guest CRM**, **Social Wall**, **Google Maps**, and **Reviews Manager** to your Casa Bendang project.

### 1. Database Schema Updates (`supabase-schema.sql`)

Run this SQL in your Supabase SQL Editor to create the necessary tables for the new features.

```sql
-- 1. CAMPAIGNS MODULE
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GUEST CRM (Database & Tagging)
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL, -- Unique identifier
    email TEXT,
    tags TEXT[] DEFAULT '{}', -- e.g., ['VIP', 'Repeat', 'Messy']
    notes TEXT,
    last_stay_date DATE,
    total_stays INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, phone)
);

-- Link bookings to guests (optional, but good for history)
ALTER TABLE bookings ADD COLUMN guest_id UUID REFERENCES guests(id);

-- 3. SOCIAL WALL (Manual Hashtag/Embed Manager)
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'facebook')),
    embed_code TEXT NOT NULL, -- The full <iframe> or <blockquote> code
    caption TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVIEWS MANAGER (Manual "Embed" for control)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    source TEXT DEFAULT 'google', -- 'google', 'whatsapp', 'booking.com'
    date_posted DATE DEFAULT CURRENT_DATE,
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SETTINGS UPDATE (Map URL)
ALTER TABLE properties ADD COLUMN google_maps_url TEXT;

-- RLS POLICIES
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public Access
CREATE POLICY "Public can view active campaigns" ON campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active social_posts" ON social_posts FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view featured reviews" ON reviews FOR SELECT USING (is_featured = true);

-- Admin Access (Authenticated)
CREATE POLICY "Admin full access campaigns" ON campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access guests" ON guests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access social_posts" ON social_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');

```

---

### 2. TypeScript Types (`src/types/database.ts`)

Append these interfaces to your existing types file.

```typescript
export interface Campaign {
    id: string;
    title: string;
    message: string;
    image_url?: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export interface Guest {
    id: string;
    name: string;
    phone: string;
    tags: string[];
    notes?: string;
    total_stays: number;
}

export interface SocialPost {
    id: string;
    platform: 'instagram' | 'tiktok' | 'facebook';
    embed_code: string;
    caption?: string;
    is_active: boolean;
}

export interface Review {
    id: string;
    reviewer_name: string;
    rating: number;
    comment: string;
    source: string;
    is_featured: boolean;
}

// Update Property interface
export interface Property {
    // ... existing fields
    google_maps_url?: string; // Add this
}

```

---

### 3. Admin Dashboard Implementation (`src/app/admin/page.tsx`)

This is a large update. Instead of replacing the whole file, I will provide the **New Tab Components** you need to add to your existing `AdminDashboard`.

**A. Add new helper functions to `src/lib/supabase.ts` (You need to create these):**

* `getCampaigns`, `createCampaign`, `updateCampaign`, `deleteCampaign`
* `getGuests`, `updateGuestTags`
* `getSocialPosts`, `createSocialPost`, `deleteSocialPost`
* `getReviews`, `createReview`, `deleteReview`

**B. Update the Sidebar in `AdminDashboard`:**
Add these buttons to your sidebar navigation:

```tsx
<SidebarItem icon={<Megaphone />} label="Campaigns" active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")} />
<SidebarItem icon={<Users />} label="Guests (CRM)" active={activeTab === "guests"} onClick={() => setActiveTab("guests")} />
<SidebarItem icon={<Share2 />} label="Social Wall" active={activeTab === "social"} onClick={() => setActiveTab("social")} />
<SidebarItem icon={<Star />} label="Reviews" active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />

```

**C. New Admin Tab Components:**

**1. Campaigns Tab (Marketing):**
Allows you to set a pop-up promotion (e.g., "Ramadan Promo").

```tsx
function CampaignsTab() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    // ... State for form (title, message, dates)
    
    // Render list of campaigns
    // Form to create new campaign
    // Logic: When "Active", this will pop up on the homepage
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Marketing Campaigns</h2>
            <Card>
                <CardHeader><CardTitle>Create New Campaign</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <Input placeholder="Campaign Title (e.g. School Holiday Special)" />
                     <Textarea placeholder="Message shown to customers..." />
                     <div className="flex gap-4">
                        <Input type="date" placeholder="Start Date" />
                        <Input type="date" placeholder="End Date" />
                     </div>
                     <Button>Launch Campaign</Button>
                </CardContent>
            </Card>
            {/* List existing campaigns here */}
        </div>
    )
}

```

**2. Guests CRM Tab (Tagging Workflow):**
This fulfills your requirement: *"Admin must tag the guest"*.

```tsx
function GuestsTab() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

    // Tags available
    const TAG_OPTIONS = ["VIP", "Family", "Couple", "Messy", "Late Checkout", "Blacklist"];

    const handleAddTag = async (guestId: string, newTags: string[]) => {
        // Call supabase updateGuestTags(guestId, newTags)
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Guest CRM</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest List */}
                <Card>
                    <CardHeader><CardTitle>Guest Database</CardTitle></CardHeader>
                    <CardContent>
                        {guests.map(guest => (
                            <div key={guest.id} className="flex justify-between items-center p-3 border-b">
                                <div>
                                    <p className="font-bold">{guest.name}</p>
                                    <p className="text-xs text-muted-foreground">{guest.phone}</p>
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    {guest.tags.map(tag => (
                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                    ))}
                                    <Button size="sm" variant="outline" onClick={() => setSelectedGuest(guest)}>
                                        Tag
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Tagging Interface */}
                {selectedGuest && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle>Tagging: {selectedGuest.name}</CardTitle>
                            <CardDescription>Assign attributes to this guest for future reference.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {TAG_OPTIONS.map(tag => (
                                <Button 
                                    key={tag}
                                    variant={selectedGuest.tags.includes(tag) ? "default" : "outline"}
                                    onClick={() => {
                                        const newTags = selectedGuest.tags.includes(tag)
                                            ? selectedGuest.tags.filter(t => t !== tag)
                                            : [...selectedGuest.tags, tag];
                                        handleAddTag(selectedGuest.id, newTags);
                                    }}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

```

**3. Settings Tab Update (Google Map):**
Add this input to your existing `SettingsTab`.

```tsx
<div className="space-y-2">
    <label className="text-sm font-medium">Google Maps Embed URL</label>
    <Input 
        placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
        value={formData.google_maps_url} 
        onChange={(e) => setFormData({...formData, google_maps_url: e.target.value})}
    />
    <p className="text-xs text-muted-foreground">
        Go to Google Maps -> Share -> Embed a map -> Copy HTML and paste here.
    </p>
</div>

```

---

### 4. Public Website Updates (`src/app/page.tsx`)

Updates to display the features to the customer.

**A. Campaign Popup (The "Notify Customer" Requirement):**
Add this `useEffect` in your `Home` component.

```tsx
// Inside Home() component
const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
const [showCampaign, setShowCampaign] = useState(false);

useEffect(() => {
    async function checkCampaigns() {
        const campaigns = await getActiveCampaigns(); // You implement this fetch
        if (campaigns.length > 0) {
            setActiveCampaign(campaigns[0]);
            setShowCampaign(true);
        }
    }
    checkCampaigns();
}, []);

// In your JSX (Render)
{showCampaign && activeCampaign && (
    <Dialog open={showCampaign} onOpenChange={setShowCampaign}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-primary">{activeCampaign.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                {activeCampaign.image_url && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden">
                        <Image src={activeCampaign.image_url} fill className="object-cover" alt="Promo" />
                    </div>
                )}
                <p className="text-lg">{activeCampaign.message}</p>
                <div className="flex gap-2">
                    <Button className="w-full" onClick={() => setShowCampaign(false)}>Book Now</Button>
                    <Button variant="outline" onClick={() => {
                        // Share Logic
                        navigator.share({
                            title: activeCampaign.title,
                            text: activeCampaign.message,
                            url: window.location.href
                        }).catch(console.error);
                    }}>
                        <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
)}

```

**B. Google Maps Section:**
Add this section before your Footer.

```tsx
{property?.google_maps_url && (
    <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Find Us</h2>
        <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg border">
            <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: property.google_maps_url }} 
            />
        </div>
        <div className="flex justify-center mt-4 gap-4">
            <Button variant="outline" asChild>
                <Link href="https://waze.com/ul/hw281..." target="_blank">Navigate with Waze</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="https://maps.google.com/?q=Casa+Bendang" target="_blank">Open in Google Maps</Link>
            </Button>
        </div>
    </section>
)}

```

**C. Reviews & Social Wall:**
Since you asked about "Embed from Google Review" and "Hashtags":

* **Strategy:** Instead of using complex APIs that break or cost money, we use the `reviews` and `social_posts` tables you populated in Admin.
* **Implementation:** Render them as static cards.

```tsx
{/* Reviews Section */}
<section className="bg-white py-16">
    <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Guest Experiences</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
                <Card key={review.id} className="bg-slate-50 border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex gap-1 mb-4 text-yellow-400">
                            {[...Array(review.rating)].map((_, i) => <Star key={i} fill="currentColor" className="w-4 h-4" />)}
                        </div>
                        <p className="italic text-slate-600 mb-4">"{review.comment}"</p>
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-sm">{review.reviewer_name}</p>
                            {review.source === 'google' && <Image src="/google-logo.png" width={20} height={20} alt="Google" />}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
</section>

```

### Summary of Workflow

1. **Marketing:** You go to Admin -> Campaigns -> Create "Merdeka Promo". Customers see a popup when they visit.
2. **Tagging:** After a guest leaves, go to Admin -> Guests -> Search their name -> Add tag "VIP" or "Dirty". Next time they book, you see this tag.
3. **Social/Reviews:** You manually copy the best reviews/posts into Admin. This is the **safest, free way** to "embed" them without relying on 3rd party widgets that might ask for monthly payments later.

**Note:** The search results did not provide a relevant YouTube video for this specific custom coding task.