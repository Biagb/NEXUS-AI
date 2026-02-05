import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SendSMSRequest, SendSMSResponse, ApiResponse } from '@/types';

// Mock Twilio client for trial/demo purposes
// In production, you would use: import twilio from 'twilio';
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body: SendSMSRequest = await request.json();
    const { campaignId, subscriberIds, tags } = body;

    if (!campaignId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Build subscriber query
    let subscriberQuery = supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .eq('subscribed', true)
      .not('phone', 'is', null);

    if (subscriberIds && subscriberIds.length > 0) {
      subscriberQuery = subscriberQuery.in('id', subscriberIds);
    }

    if (tags && tags.length > 0) {
      subscriberQuery = subscriberQuery.overlaps('tags', tags);
    }

    const { data: subscribers, error: subscribersError } = await subscriberQuery;

    if (subscribersError) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No subscribers with phone numbers found' },
        { status: 400 }
      );
    }

    // Truncate message for SMS (160 characters)
    const smsBody = truncateSMS(campaign.generated_text || campaign.title, 160);

    // Mock SMS sending
    // In a real implementation, you would use Twilio here
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const subscriber of subscribers) {
      try {
        // Mock implementation - in production, use Twilio:
        // await twilioClient.messages.create({
        //   body: smsBody,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: subscriber.phone,
        // });

        // Simulate sending (mock)
        console.log(`[MOCK SMS] To: ${subscriber.phone}, Message: ${smsBody}`);
        
        // Simulate random failures for demo
        if (Math.random() > 0.95) {
          throw new Error('Simulated send failure');
        }
        
        sent++;
      } catch (error) {
        failed++;
        errors.push(`Failed to send to ${subscriber.phone}: ${error}`);
        console.error(`SMS send error for ${subscriber.phone}:`, error);
      }
    }

    // Update campaign status
    await supabase
      .from('campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipient_count: sent,
      })
      .eq('id', campaignId);

    const response: SendSMSResponse = {
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json<ApiResponse<SendSMSResponse>>(
      {
        success: true,
        data: response,
        message: `SMS messages sent successfully! ${sent} delivered, ${failed} failed. (Mock implementation)`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send SMS error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

function truncateSMS(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
