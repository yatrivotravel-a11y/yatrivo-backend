import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, supabase } from '@/lib/supabase';

// GET: Get a single booking by ID (Protected)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const supabaseAuthed = createSupabaseServerClient(token);

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Fetch the booking with package details
    const { data: booking, error: fetchError } = await supabaseAuthed
      .from('bookings')
      .select(`
        *,
        tour_packages (
          id,
          place_name,
          city,
          price_range,
          image_urls,
          overview
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      // PGRST116 = 0 rows (or multiple rows) when using .single()
      if ((fetchError as any).code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      console.error('Booking fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch booking', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedBooking = {
      id: booking.id,
      userId: booking.user_id,
      packageId: booking.package_id,
      packageName: booking.tour_packages?.place_name || 'Unknown',
      packageCity: booking.tour_packages?.city || 'Unknown',
      packagePriceRange: booking.tour_packages?.price_range,
      packageImages: booking.tour_packages?.image_urls || [],
      packageOverview: booking.tour_packages?.overview,
      totalAmount: booking.total_amount,
      status: booking.status,
      bookingDate: booking.booking_date,
      customerName: booking.customer_name,
      customerEmail: booking.customer_email,
      customerMobile: booking.customer_mobile,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
    };

    return NextResponse.json(
      {
        message: 'Booking retrieved successfully',
        booking: formattedBooking,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update booking status (Protected - typically for admin)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const supabaseAuthed = createSupabaseServerClient(token);

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const { data: existingBooking, error: checkError } = await supabaseAuthed
      .from('bookings')
      .select('id, status')
      .eq('id', id)
      .single();

    if (checkError) {
      if ((checkError as any).code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      console.error('Booking check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check booking', details: checkError.message },
        { status: 500 }
      );
    }

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update the booking status
    const { data: updatedBooking, error: updateError } = await supabaseAuthed
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Booking update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update booking', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Booking status updated successfully',
        booking: {
          id: updatedBooking.id,
          status: updatedBooking.status,
          updatedAt: updatedBooking.updated_at,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in PATCH /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Cancel/Delete a booking (Protected)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const supabaseAuthed = createSupabaseServerClient(token);

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Check if booking exists
    const { data: existingBooking, error: checkError } = await supabaseAuthed
      .from('bookings')
      .select('id, user_id, status')
      .eq('id', id)
      .single();

    if (checkError) {
      if ((checkError as any).code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      console.error('Booking check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check booking', details: checkError.message },
        { status: 500 }
      );
    }

    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Delete the booking
    const { error: deleteError } = await supabaseAuthed
      .from('bookings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Booking deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete booking', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Booking deleted successfully',
        bookingId: id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
