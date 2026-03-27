import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REMOVE_BG_API_KEY = Deno.env.get('REMOVE_BG_API_KEY');
    if (!REMOVE_BG_API_KEY) {
      return new Response(JSON.stringify({ error: 'REMOVE_BG_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { image_base64 } = await req.json();
    if (!image_base64) {
      return new Response(JSON.stringify({ error: 'image_base64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract raw base64 (remove data:image/...;base64, prefix)
    const base64Data = image_base64.replace(/^data:image\/[^;]+;base64,/, '');

    const formData = new FormData();
    // Convert base64 to blob
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `remove.bg API error [${response.status}]: ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resultBuffer = await response.arrayBuffer();
    const resultBytes = new Uint8Array(resultBuffer);
    let binary = '';
    for (let i = 0; i < resultBytes.length; i++) {
      binary += String.fromCharCode(resultBytes[i]);
    }
    const resultBase64 = btoa(binary);

    return new Response(JSON.stringify({ result: `data:image/png;base64,${resultBase64}` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
