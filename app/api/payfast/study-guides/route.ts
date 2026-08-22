import { NextRequest, NextResponse } from "next/server";
import {
    generateSignature,
    PAYFAST_PROCESS_URL,
} from "@/lib/payfast";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const STUDY_GUIDES_URL =
    "https://rubyaitutor.com/matrics";

const AI_TUTOR_SIGNUP_URL =
    "https://ruby-ai-tutor.vercel.app/";

// These are the guide IDs used by your study guide app.
const VALID_GUIDE_IDS = [
    "math",
    "science",
    "english",
    "mathslit",
] as const;

// Server-side pricing.
// NEVER accept the price directly from the browser.
const STUDY_GUIDE_PRICES: Record<number, number> = {
    1: 99,
    2: 149,
    3: 179,
};

// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
    "https://rubyaitutor.com",
    "https://www.rubyaitutor.com",
    "http://localhost:5173",
];

function getCorsHeaders(
    origin: string | null
): Record<string, string> {

    const allowedOrigin =
        origin &&
        ALLOWED_ORIGINS.includes(origin)
            ? origin
            : "https://rubyaitutor.com";

    return {
        "Access-Control-Allow-Origin":
            allowedOrigin,

        "Access-Control-Allow-Methods":
            "POST, OPTIONS",

        "Access-Control-Allow-Headers":
            "Content-Type",

        "Access-Control-Max-Age":
            "86400",
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS
//
// Handles the browser CORS preflight request.
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(
    request: NextRequest
) {
    const origin =
        request.headers.get("origin");

    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(
    request: NextRequest
) {
    const origin =
        request.headers.get("origin");

    const corsHeaders =
        getCorsHeaders(origin);

    try {

        // ─────────────────────────────────────────────────────────────────────
        // Read request
        // ─────────────────────────────────────────────────────────────────────

        const body =
            await request.json();

        const {
            email,
            guideIds,
        } = body as {
            email?: string;
            guideIds?: string[];
        };

        // ─────────────────────────────────────────────────────────────────────
        // Validate email
        // ─────────────────────────────────────────────────────────────────────

        const cleanEmail =
            typeof email === "string"
                ? email.trim()
                : "";

        const emailIsValid =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                cleanEmail
            );

        if (!emailIsValid) {
            return NextResponse.json(
                {
                    error:
                        "A valid email address is required.",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // Validate guide IDs
        // ─────────────────────────────────────────────────────────────────────

        if (
            !Array.isArray(guideIds) ||
            guideIds.length === 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Please select at least one study guide.",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Only strings are allowed.
        const submittedGuideIds =
            guideIds.filter(
                (id): id is string =>
                    typeof id === "string"
            );

        if (
            submittedGuideIds.length !==
            guideIds.length
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid study guide selection.",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // Remove duplicates.
        const uniqueGuideIds = [
            ...new Set(
                submittedGuideIds
            ),
        ];

        if (
            uniqueGuideIds.length !==
            submittedGuideIds.length
        ) {
            return NextResponse.json(
                {
                    error:
                        "Duplicate study guides were submitted.",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // Validate every guide ID against the known guides
        // ─────────────────────────────────────────────────────────────────────

        const invalidGuide =
            uniqueGuideIds.find(
                (id) =>
                    !VALID_GUIDE_IDS.includes(
                        id as typeof VALID_GUIDE_IDS[number]
                    )
            );

        if (invalidGuide) {
            return NextResponse.json(
                {
                    error:
                        `Invalid study guide: ${invalidGuide}`,
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // Maximum 4 guides
        // ─────────────────────────────────────────────────────────────────────

        if (
            uniqueGuideIds.length > 4
        ) {
            return NextResponse.json(
                {
                    error:
                        "A maximum of 4 study guides can be purchased.",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // 4-GUIDE BUNDLE
        //
        // Your existing CartDrawer already sends customers with all four
        // guides to the AI Tutor signup page.
        //
        // We keep that behaviour here as an additional safety check.
        // ─────────────────────────────────────────────────────────────────────

        if (
            uniqueGuideIds.length === 4
        ) {
            return NextResponse.json(
                {
                    redirect:
                        AI_TUTOR_SIGNUP_URL,
                },
                {
                    status: 200,
                    headers: corsHeaders,
                }
            );
        }

        // ─────────────────────────────────────────────────────────────────────
        // Determine the price SERVER-SIDE
        //
        // IMPORTANT:
        //
        // We intentionally do NOT accept amountOverride from the browser.
        //
        // A customer could modify:
        //
        // amountOverride: "1.00"
        //
        // in the browser.
        //
        // The server therefore calculates the amount from the number of
        // selected guides.
        // ─────────────────────────────────────────────────────────────────────

        const guideCount =
            uniqueGuideIds.length;

        const price =
            STUDY_GUIDE_PRICES[
                guideCount
            ];

        if (
            typeof price !== "number"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Unable to determine the study guide price.",
                },
                {
                    status: 400,
                    headers: corsHeaders,
                }
            );
        }

        const amount =
            price.toFixed(2);

        // ─────────────────────────────────────────────────────────────────────
        // Generate a unique PayFast payment ID
        // ─────────────────────────────────────────────────────────────────────

        const paymentId =
            `study-${Date.now()}-${crypto.randomUUID()}`;

        // ─────────────────────────────────────────────────────────────────────
        // Build PayFast parameters
        //
        // NOTE:
        //
        // return_url and cancel_url point to the Firebase/static study guide
        // website.
        //
        // notify_url points back to the Vercel backend because PayFast needs
        // a server endpoint to send the ITN notification to.
        // ─────────────────────────────────────────────────────────────────────

        const params: Record<string, string> = {

            merchant_id:
                process.env.PAYFAST_MERCHANT_ID!,

            merchant_key:
                process.env.PAYFAST_MERCHANT_KEY!,

            // Customer comes back to the Firebase website.
            return_url:
                `${STUDY_GUIDES_URL}?payment=success`,

            cancel_url:
                `${STUDY_GUIDES_URL}?payment=cancelled`,

            // PayFast talks to the Vercel backend.
            notify_url:
                `${request.nextUrl.origin}/api/payfast/notify`,

            // We only have the customer's email from the static site.
            name_first:
                "Study",

            name_last:
                "Guide Customer",

            email_address:
                cleanEmail,

            // Unique ID used to identify this payment.
            m_payment_id:
                paymentId,

            // Server-controlled amount.
            amount,

            item_name:
                `Ruby AI Tutor – ${guideCount} Study Guide${
                    guideCount > 1
                        ? "s"
                        : ""
                }`,

            // Used by the ITN to identify this as a study-guide purchase.
            custom_str1:
                "study-guides",

            // Store the actual guides purchased.
            //
            // Example:
            // math,science
            //
            // Your ITN can use this later to determine which PDFs to email.
            custom_str4:
                uniqueGuideIds.join(","),

            // Explicitly once-off.
            custom_str3:
                "once-off",
        };

        // ─────────────────────────────────────────────────────────────────────
        // Generate PayFast signature
        //
        // This MUST happen after every parameter has been added.
        // ─────────────────────────────────────────────────────────────────────

        params.signature =
            generateSignature(params);

        // ─────────────────────────────────────────────────────────────────────
        // Logging
        //
        // Do NOT log merchant keys, passphrases or signatures.
        // ─────────────────────────────────────────────────────────────────────

        console.log(
            "[PayFast study-guides] Checkout created:",
            {
                paymentId,
                guideIds:
                    uniqueGuideIds,
                guideCount,
                amount,
                email:
                    cleanEmail,
            }
        );

        // ─────────────────────────────────────────────────────────────────────
        // Return checkout information to the Firebase frontend
        // ─────────────────────────────────────────────────────────────────────

        return NextResponse.json(
            {
                url:
                    PAYFAST_PROCESS_URL,

                params,
            },
            {
                status: 200,
                headers: corsHeaders,
            }
        );

    } catch (error) {

        console.error(
            "[PayFast study-guides] Checkout error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Unable to start PayFast checkout. Please try again.",
            },
            {
                status: 500,
                headers: corsHeaders,
            }
        );
    }
}