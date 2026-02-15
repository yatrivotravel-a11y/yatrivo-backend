import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Create a new booking (Protected - requires authentication)
export async function POST(request: NextRequest) {
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

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { packageId } = body;

    // Validate required fields
    if (!packageId) {
      return NextResponse.json(
        { error: 'Missing required field: packageId is required' },
        { status: 400 }
      );
    }

    // Verify package exists and get price
    const { data: packageData, error: packageError } = await supabase
      .from('tour_packages')
      .select('id, place_name, city, price_range')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      return NextResponse.json(
        { error: 'Tour package not found' },
        { status: 404 }
      );
    }

    // Get user profile information
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('full_name, email, mobile_number')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Extract price from price_range (e.g., "₹20,000 - ₹30,000" -> use the lower value)
    // This is a simple implementation - you can make it more sophisticated
    let totalAmount = 0;
    if (packageData.price_range) {
      // Extract first number from price range
      const match = packageData.price_range.match(/[\d,]+/);
      if (match) {
        totalAmount = parseFloat(match[0].replace(/,/g, ''));
      }
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        package_id: packageId,
        total_amount: totalAmount,
        customer_name: userData.full_name,
        customer_email: userData.email,
        customer_mobile: userData.mobile_number,
        status: 'pending',
        booking_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking', details: bookingError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: {
          id: booking.id,
          userId: booking.user_id,
          packageId: booking.package_id,
          packageName: packageData.place_name,
          packageCity: packageData.city,
          totalAmount: booking.total_amount,
          status: booking.status,
          bookingDate: booking.booking_date,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          customerMobile: booking.customer_mobile,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Retrieve bookings (Protected - requires authentication)
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

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

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

    // Build query
    let query = supabase
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

    // Filter by userId if provided, otherwise show user's own bookings
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('user_id', user.id);
    }

    const { data: bookings, error: fetchError } = await query;

    if (fetchError) {
      console.error('Bookings fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: fetchError.message },
        { status: 500 }
      );
    }

    // Format the response
    const formattedBookings = bookings?.map((booking: any) => ({
      id: booking.id,
      userId: booking.user_id,
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
    })) || [];

    return NextResponse.json(
      {
        message: 'Bookings retrieved successfully',
        bookings: formattedBookings,
        count: formattedBookings.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
