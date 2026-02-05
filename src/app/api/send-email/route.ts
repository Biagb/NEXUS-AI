import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';
import { SendEmailRequest, SendEmailResponse, ApiResponse } from '@/types';

// Lazy initialization to prevent build-time errors
const getResendClient = () => {
  return new Resend(process.env.RESEND_API_KEY);
};

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
    const body: SendEmailRequest = await request.json();
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

    // Fetch profile for sender info
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name')
      .eq('id', user.id)
      .single();

    // Build subscriber query
    let subscriberQuery = supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .eq('subscribed', true)
      .not('email', 'is', null);

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
        { success: false, error: 'No subscribers found matching the criteria' },
        { status: 400 }
      );
    }

    // Generate HTML email template
    const htmlContent = generateEmailTemplate({
      subject: campaign.subject_line || campaign.title,
      body: campaign.generated_text || '',
      imageUrl: campaign.generated_image_url,
      companyName: profile?.company_name || 'AI Marketing Autopilot',
    });

    // Send emails
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];
    const resend = getResendClient();

    for (const subscriber of subscribers) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: subscriber.email!,
          subject: campaign.subject_line || campaign.title,
          html: htmlContent,
        });
        sent++;
      } catch (error) {
        failed++;
        errors.push(`Failed to send to ${subscriber.email}: ${error}`);
        console.error(`Email send error for ${subscriber.email}:`, error);
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

    const response: SendEmailResponse = {
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json<ApiResponse<SendEmailResponse>>(
      {
        success: true,
        data: response,
        message: `Emails sent successfully! ${sent} delivered, ${failed} failed.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

interface EmailTemplateParams {
  subject: string;
  body: string;
  imageUrl?: string | null;
  companyName: string;
}

function generateEmailTemplate({ subject, body, imageUrl, companyName }: EmailTemplateParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #3B82F6;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .banner {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
    }
    .content {
      padding: 30px;
    }
    .content p {
      margin: 0 0 16px 0;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #3B82F6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${companyName}</h1>
    </div>
    ${imageUrl ? `<img src="${imageUrl}" alt="Campaign Banner" class="banner" />` : ''}
    <div class="content">
      ${body.split('\n').map(p => `<p>${p}</p>`).join('')}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
      <p>
        <a href="#">Unsubscribe</a> | <a href="#">View in browser</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
