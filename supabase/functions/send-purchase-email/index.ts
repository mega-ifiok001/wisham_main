// ============================================================================
-- SUPABASE EDGE FUNCTION FOR RESEND EMAIL DISPATCH
-- Deployed via: supabase functions deploy send-purchase-email
-- ============================================================================

import { serve } from "https://deno.land/std@0.182.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is missing in Supabase Edge Function.");
    }

    const {
      to_email,
      beat_title,
      artist,
      bpm,
      key_signature,
      price,
      stems_count,
      audio_url,
      stems_url,
      license_hash
    } = await req.json();

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w-width: 600px; margin: 0 auto; padding: 20px; background-color: #0A0A0C; color: #ffffff; border-radius: 12px;">
        <div style="text-align: center; border-bottom: 1px solid #262626; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #f97316; margin: 0; font-size: 28px; font-weight: 900;">AUDIOFORGE</h1>
          <p style="color: #a3a3a3; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Exclusive Ownership Certificate & Delivery</p>
        </div>

        <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 10px;">Congratulations Producer!</h2>
        <p style="color: #d4d4d4; font-size: 15px; line-height: 1.6;">
          Your payment of <strong>$${price}</strong> was successfully verified. As per our instant-purge protocol, <strong>"${beat_title}"</strong> has been permanently removed from the public AudioForge marketplace. You are now the sole exclusive owner.
        </p>

        <div style="background-color: #171717; padding: 18px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f97316;">
          <h3 style="margin-top: 0; color: #f97316; font-size: 16px; margin-bottom: 12px;">Track Specifications</h3>
          <ul style="list-style: none; padding: 0; margin: 0; color: #e5e5e5; font-size: 14px; line-height: 1.8;">
            <li>🎵 <strong>Title:</strong> ${beat_title}</li>
            <li>👤 <strong>Producer:</strong> ${artist}</li>
            <li>⏱️ <strong>BPM:</strong> ${bpm}</li>
            <li>🔑 <strong>Key Signature:</strong> ${key_signature}</li>
            <li>📦 <strong>Stems Count:</strong> ${stems_count} individual 24-bit WAV files</li>
            <li>📜 <strong>License Token Hash:</strong> <code style="color: #f97316; background: #262626; padding: 2px 6px; border-radius: 4px;">${license_hash}</code></li>
          </ul>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${audio_url}" style="background-color: #f97316; color: #000000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; margin-bottom: 15px;">
            📥 Download 24-Bit Master WAV
          </a>
          <br />
          <a href="${stems_url}" style="background-color: #262626; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; border: 1px solid #404040;">
            📦 Download Multi-Track Stems Archive
          </a>
        </div>

        <p style="color: #a3a3a3; font-size: 12px; text-align: center; border-top: 1px solid #262626; padding-top: 20px; margin-top: 30px;">
          This email serves as your legal proof of exclusive ownership transfer. Keep it in your permanent records.<br />
          © ${new Date().getFullYear()} AudioForge Inc.
        </p>
      </div>
    `;

    // Resend API request
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AudioForge <onboarding@resend.dev>", // Replace with sales@audioforge.com once domain is verified in Resend
        to: [to_email],
        subject: `AudioForge Exclusive License & Files: ${beat_title}`,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || JSON.stringify(data));
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
