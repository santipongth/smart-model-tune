// Edge function: optimize a system prompt using Lovable AI Gateway
// Returns the optimized prompt + reasoning + improvement metrics
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert prompt engineer specialising in fine-tuned small language models.
Given the user's current SYSTEM PROMPT, produce an improved version that is:
- Specific about the role, domain, and audience
- Clear about output format, tone, and constraints
- Includes 3-6 bullet guidelines
- Handles edge cases (ambiguous input, unknown answers)
- Concise — no fluff

Then explain WHY each change improves performance, and estimate score deltas (0-100) for: clarity, specificity, tokenEfficiency, expectedAccuracy.

Always call the return_optimized_prompt tool. Never reply in plain text.`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "return_optimized_prompt",
    description: "Return the optimized prompt plus rationale and metric deltas.",
    parameters: {
      type: "object",
      properties: {
        optimized_prompt: { type: "string", description: "The improved system prompt" },
        reasoning: {
          type: "array",
          items: {
            type: "object",
            properties: {
              change: { type: "string", description: "What was changed" },
              why: { type: "string", description: "Why this improves the prompt" },
            },
            required: ["change", "why"],
            additionalProperties: false,
          },
        },
        metrics: {
          type: "object",
          properties: {
            clarity: { type: "object", properties: { before: { type: "number" }, after: { type: "number" } }, required: ["before", "after"], additionalProperties: false },
            specificity: { type: "object", properties: { before: { type: "number" }, after: { type: "number" } }, required: ["before", "after"], additionalProperties: false },
            tokenEfficiency: { type: "object", properties: { before: { type: "number" }, after: { type: "number" } }, required: ["before", "after"], additionalProperties: false },
            expectedAccuracy: { type: "object", properties: { before: { type: "number" }, after: { type: "number" } }, required: ["before", "after"], additionalProperties: false },
          },
          required: ["clarity", "specificity", "tokenEfficiency", "expectedAccuracy"],
          additionalProperties: false,
        },
      },
      required: ["optimized_prompt", "reasoning", "metrics"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, taskType, language } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length < 5) {
      return new Response(JSON.stringify({ error: "prompt is required (min 5 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userMsg = `Task type: ${taskType || "general"}
Output language for the optimized prompt: ${language === "th" ? "Thai (ภาษาไทย)" : "English"}
Reasoning explanations should also be written in ${language === "th" ? "Thai" : "English"}.

CURRENT SYSTEM PROMPT:
"""
${prompt}
"""

Improve this prompt and return via the tool.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "return_optimized_prompt" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("optimize-prompt error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
