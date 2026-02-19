import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { data: isAdmin } = await supabaseClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin only");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Fetch recent succeeded payments
    const succeededInvoices = await stripe.invoices.list({
      status: "paid",
      limit: 50,
    });

    // Fetch upcoming invoices for all active subscriptions
    const activeSubscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 50,
    });

    const upcoming = [];
    for (const sub of activeSubscriptions.data) {
      try {
        const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
          customer: sub.customer as string,
          subscription: sub.id,
        });
        upcoming.push({
          customer_email: upcomingInvoice.customer_email,
          customer_name: upcomingInvoice.customer_name,
          amount: upcomingInvoice.amount_due,
          currency: upcomingInvoice.currency,
          due_date: upcomingInvoice.next_payment_attempt
            ? new Date(upcomingInvoice.next_payment_attempt * 1000).toISOString()
            : null,
          subscription_id: sub.id,
        });
      } catch {
        // Skip if no upcoming invoice
      }
    }

    // Fetch failed payments
    const failedInvoices = await stripe.invoices.list({
      status: "open",
      limit: 50,
    });
    // Filter to ones that have had a failed attempt
    const failed = failedInvoices.data.filter(
      (inv) => inv.attempt_count > 0 && inv.status === "open"
    );

    return new Response(JSON.stringify({
      succeeded: succeededInvoices.data.map((inv) => ({
        id: inv.id,
        customer_email: inv.customer_email,
        customer_name: inv.customer_name,
        amount: inv.amount_paid,
        currency: inv.currency,
        paid_at: inv.status_transitions?.paid_at
          ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
          : null,
        invoice_url: inv.hosted_invoice_url,
      })),
      upcoming,
      failed: failed.map((inv) => ({
        id: inv.id,
        customer_email: inv.customer_email,
        customer_name: inv.customer_name,
        amount: inv.amount_due,
        currency: inv.currency,
        due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
        attempt_count: inv.attempt_count,
        next_attempt: inv.next_payment_attempt
          ? new Date(inv.next_payment_attempt * 1000).toISOString()
          : null,
        invoice_url: inv.hosted_invoice_url,
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
