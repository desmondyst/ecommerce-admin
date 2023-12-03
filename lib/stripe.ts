import Stripe from "stripe";

// need to pass in stripe API key
// question mark at the end to fix typescript error
export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    // different version
    apiVersion: "2023-10-16",
    typescript: true,
});
