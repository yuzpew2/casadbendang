import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This runs as a Vercel Cron Job
export async function GET(request: Request) {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow if no CRON_SECRET is set (for development)
        if (process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    // Create admin client (bypasses RLS)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        // Get property settings
        const { data: property } = await supabase
            .from('properties')
            .select('id, pending_timeout_hours')
            .limit(1)
            .single();

        if (!property) {
            return NextResponse.json({ message: 'No property found' });
        }

        const timeoutHours = property.pending_timeout_hours || 24;
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - timeoutHours);

        // Find pending bookings older than timeout
        const { data: expiredBookings, error: fetchError } = await supabase
            .from('bookings')
            .select('id, guest_name, start_date, created_at')
            .eq('property_id', property.id)
            .eq('status', 'pending')
            .lt('created_at', cutoffTime.toISOString());

        if (fetchError) {
            console.error('Error fetching expired bookings:', fetchError);
            return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
        }

        if (!expiredBookings?.length) {
            return NextResponse.json({
                message: 'No expired bookings to cancel',
                checked_at: new Date().toISOString()
            });
        }

        // Cancel expired bookings
        const expiredIds = expiredBookings.map(b => b.id);
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                notes: `Auto-cancelled: No response within ${timeoutHours} hours`,
                updated_at: new Date().toISOString()
            })
            .in('id', expiredIds);

        if (updateError) {
            console.error('Error cancelling bookings:', updateError);
            return NextResponse.json({ error: 'Failed to cancel bookings' }, { status: 500 });
        }

        console.log(`Auto-cancelled ${expiredBookings.length} expired pending bookings`);

        return NextResponse.json({
            message: `Cancelled ${expiredBookings.length} expired pending bookings`,
            cancelled: expiredBookings.map(b => ({
                id: b.id,
                guest: b.guest_name,
                date: b.start_date
            })),
            checked_at: new Date().toISOString()
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
