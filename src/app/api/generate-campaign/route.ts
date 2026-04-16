import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { GenerateCampaignRequest, OpenAIMarketingResponse, ApiResponse, GenerateCampaignResponse, Profile } from '@/types';

// Initialize OpenAI client lazily to avoid build-time errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}



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
    const body: GenerateCampaignRequest = await request.json();
    const { topic, campaignType, targetAudience, additionalContext } = body;

    if (!topic) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Fetch user profile for context
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !data) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Profile not found. Please complete onboarding.' },
        { status: 400 }
      );
    }

    // Cast to expected type
    const profile = data as unknown as Profile;
    const brandColors = profile.brand_colors;

    // Step 1: Generate marketing content with OpenAI
    const systemPrompt = `You are an expert marketing copywriter. Generate compelling marketing content based on the company profile and campaign topic.

Company Information:
- Name: ${profile.company_name}
- Description: ${profile.description}
- Tone of Voice: ${profile.tone_of_voice}
- Brand Colors: Primary: ${brandColors?.primary || '#3B82F6'}, Secondary: ${brandColors?.secondary || '#1E40AF'}

Generate content that matches the company's tone of voice and resonates with their target audience.

IMPORTANT: Your response MUST be valid JSON with this exact structure:
{
  "subject": "Email subject line (compelling and under 60 characters)",
  "body": "Full email/message body with proper formatting",
  "image_prompt": "Detailed prompt for generating a marketing banner image. Be specific about colors, style, and visual elements that match the brand.",
  "call_to_action": "A clear call-to-action phrase"
}`;

    const userPrompt = `Create a ${campaignType} marketing campaign about: "${topic}"
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

The content should be professional, engaging, and aligned with the brand's tone of voice (${profile.tone_of_voice}).`;

    let aiContent: OpenAIMarketingResponse;

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content generated from OpenAI');
      }

      aiContent = JSON.parse(content) as OpenAIMarketingResponse;
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to generate marketing content. Please try again.' },
        { status: 500 }
      );
    }

    // Step 2: Generate image with OpenAI (gpt-image-1)
    let imageUrl: string | null = null;

    try {
      // Enhance the image prompt with brand context
      const enhancedImagePrompt = `${aiContent.image_prompt}. 
Style: Modern, professional marketing banner. 
Colors: Use ${brandColors?.primary || '#3B82F6'} and ${brandColors?.secondary || '#1E40AF'} as accent colors.
Quality: High resolution, clean design, suitable for email marketing.`;

      const openai = getOpenAIClient();
      const imageResponse = await openai.images.generate({
        model: 'gpt-image-1',
        prompt: enhancedImagePrompt,
        n: 1,
        size: '1536x1024',
        quality: 'medium',
      });

      // OpenAI returns base64 image data
      if (imageResponse.data && imageResponse.data.length > 0) {
        const imageData = imageResponse.data[0];
        
        if (imageData.b64_json) {
          // Convert base64 to buffer and upload to Supabase Storage
          const imageBuffer = Buffer.from(imageData.b64_json, 'base64');

          const fileName = `${user.id}/${Date.now()}.png`;
          const { error: uploadError } = await supabase.storage
            .from('campaigns')
            .upload(fileName, imageBuffer, {
              contentType: 'image/png',
              upsert: false,
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('campaigns')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
          } else {
            console.error('Image upload error:', uploadError);
          }
        } else if (imageData.url) {
          // If URL is returned, download and upload to Supabase
          const response = await fetch(imageData.url);
          const imageBlob = await response.blob();
          const imageBuffer = await imageBlob.arrayBuffer();

          const fileName = `${user.id}/${Date.now()}.png`;
          const { error: uploadError } = await supabase.storage
            .from('campaigns')
            .upload(fileName, imageBuffer, {
              contentType: 'image/png',
              upsert: false,
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('campaigns')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
          } else {
            console.error('Image upload error:', uploadError);
            imageUrl = imageData.url;
          }
        }
      }
    } catch (openaiImageError) {
      console.error('OpenAI image generation error:', openaiImageError);
      // Continue without image if generation fails
    }

    // Step 3: Save campaign to database
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        user_id: user.id,
        title: topic,
        topic: topic,
        status: 'draft',
        campaign_type: campaignType,
        subject_line: aiContent.subject,
        generated_text: aiContent.body,
        generated_image_url: imageUrl,
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Campaign save error:', campaignError);
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to save campaign' },
        { status: 500 }
      );
    }

    const response: GenerateCampaignResponse = {
      campaignId: campaign.id,
      content: {
        subject: aiContent.subject,
        body: aiContent.body,
        imagePrompt: aiContent.image_prompt,
        callToAction: aiContent.call_to_action,
      },
      imageUrl,
    };

    return NextResponse.json<ApiResponse<GenerateCampaignResponse>>(
      { success: true, data: response, message: 'Campaign generated successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Generate campaign error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
