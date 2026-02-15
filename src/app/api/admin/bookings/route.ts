import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET: Retrieve all bookings for admin dashboard
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.substring(7);

    // Verify the token and get the user (using admin client to bypass RLS)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    // Build query using admin client to see all bookings
    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        tour_packages (
          id,
          place_name,
          city,
          price_range,
          image_urls
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Filter by userId if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Limit results if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    const { data: bookings, error: fetchError } = await query;

    if (fetchError) {
      console.error('Admin bookings fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: fetchError.message },
        { status: 500 }
      );
    }

    // Fetch user profile details (public.users) separately.
    // Note: bookings.user_id references auth.users, so PostgREST cannot auto-join to public.users
    // unless you add a FK to public.users(id). This avoids that dependency.
    const userIds = Array.from(
      new Set((bookings || []).map((b: any) => b?.user_id).filter(Boolean))
    );

    const userProfileById = new Map<string, any>();
    if (userIds.length > 0) {
      const { data: userProfiles, error: userProfilesError } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email, mobile_number')
        .in('id', userIds);

      if (userProfilesError) {
        console.warn('Admin bookings user profile fetch warning:', userProfilesError);
      } else {
        (userProfiles || []).forEach((profile: any) => {
          if (profile?.id) userProfileById.set(profile.id, profile);
        });
      }
    }

    // Format the response
    const formattedBookings = bookings?.map((booking: any) => {
      const profile = booking?.user_id ? userProfileById.get(booking.user_id) : null;
      return {
      id: booking.id,
      userId: booking.user_id,
      userName: profile?.full_name || booking.customer_name || 'Unknown',
      userEmail: profile?.email || booking.customer_email || 'Unknown',
      userMobile: profile?.mobile_number || booking.customer_mobile || 'Unknown',
      packageId: booking.package_id,
      packageName: booking.tour_packages?.place_name || 'Unknown',
      packageCity: booking.tour_packages?.city || 'Unknown',
      packagePriceRange: booking.tour_packages?.price_range,
      packageImages: booking.tour_packages?.image_urls || [],
      totalAmount: booking.total_amount,
      status: booking.status,
      bookingDate: booking.booking_date,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerMobile: booking.customer_mobile,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      };
    }) || [];

    // Calculate statistics
    const stats = {
      total: formattedBookings.length,
      pending: formattedBookings.filter((b: any) => b.status === 'pending').length,
      confirmed: formattedBookings.filter((b: any) => b.status === 'confirmed').length,
      completed: formattedBookings.filter((b: any) => b.status === 'completed').length,
      cancelled: formattedBookings.filter((b: any) => b.status === 'cancelled').length,
      totalRevenue: formattedBookings.reduce((sum: number, b: any) => {
        if (b.status !== 'cancelled') {
          return sum + parseFloat(b.totalAmount);
        }
        return sum;
      }, 0),
    };

    return NextResponse.json(
      {
        message: 'Admin bookings retrieved successfully',
        bookings: formattedBookings,
        stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/admin/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
