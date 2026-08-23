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

const PAYFAST_NOTIFY_URL =
    "https://ruby-ai-tutor.vercel.app/api/payfast/notify";

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
    "https://rubyaitutor.web.app",
    "https://rubyaitutor.firebaseapp.com",
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
// Handles browser CORS preflight requests.
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
        // Validate every guide ID
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
        // Your CartDrawer already sends customers with all four guides
        // to the AI Tutor signup page.
        //
        // Keep this as an additional server-side safety check.
        // ─────────────────────────────────────────────────────────────────────

        if (
            uniqueGuideIds.length === 4
        ) {
            console.log(
                "[PayFast study-guides] 4-guide bundle detected — redirecting to AI Tutor signup."
            );

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
        // Determine price SERVER-SIDE
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
        // Generate unique PayFast payment ID
        // ─────────────────────────────────────────────────────────────────────

        const paymentId =
            `study-${Date.now()}-${crypto.randomUUID()}`;

        // ─────────────────────────────────────────────────────────────────────
        // Build PayFast parameters
        // ─────────────────────────────────────────────────────────────────────

        const params: Record<string, string> = {

            merchant_id:
                process.env.PAYFAST_MERCHANT_ID!,

            merchant_key:
                process.env.PAYFAST_MERCHANT_KEY!,

            // Customer returns to Firebase/static website.
            return_url:
                `${STUDY_GUIDES_URL}?payment=success`,

            cancel_url:
                `${STUDY_GUIDES_URL}?payment=cancelled`,

            // Fixed production ITN endpoint.
            notify_url:
                PAYFAST_NOTIFY_URL,

            name_first:
                "Study",

            name_last:
                "Guide Customer",

            email_address:
                cleanEmail,

            m_payment_id:
                paymentId,

            amount,

            item_name:
                `Ruby AI Tutor – ${guideCount} Study Guide${
                    guideCount > 1
                        ? "s"
                        : ""
                }`,

            // Identifies this as a study-guide purchase.
            custom_str1:
                "study-guides",

            // Explicitly once-off.
            custom_str3:
                "once-off",

            // Actual guides purchased.
            //
            // Example:
            // math,science
            custom_str4:
                uniqueGuideIds.join(","),
        };

        // ─────────────────────────────────────────────────────────────────────
        // Generate PayFast signature
        // ─────────────────────────────────────────────────────────────────────

        params.signature =
            generateSignature(params);

        // ─────────────────────────────────────────────────────────────────────
        // SAFE DEBUG LOGGING
        //
        // IMPORTANT:
        //
        // We deliberately DO NOT log:
        //
        // - PAYFAST_MERCHANT_KEY
        // - PAYFAST_PASSPHRASE
        //
        // We DO log the parameters sent to PayFast so we can compare them
        // against the browser payload and identify the 400 error.
        // ─────────────────────────────────────────────────────────────────────

        const debugParams = {
            merchant_id:
                params.merchant_id,

            merchant_key:
                "[REDACTED]",

            return_url:
                params.return_url,

            cancel_url:
                params.cancel_url,

            notify_url:
                params.notify_url,

            name_first:
                params.name_first,

            name_last:
                params.name_last,

            email_address:
                params.email_address,

            m_payment_id:
                params.m_payment_id,

            amount:
                params.amount,

            item_name:
                params.item_name,

            custom_str1:
                params.custom_str1,

            custom_str3:
                params.custom_str3,

            custom_str4:
                params.custom_str4,

            signature:
                params.signature,
        };

        console.log(
            "============================================================"
        );

        console.log(
            "[PayFast DEBUG] Checkout parameters"
        );

        console.log(
            "[PayFast DEBUG] Process URL:",
            PAYFAST_PROCESS_URL
        );

        console.log(
            "[PayFast DEBUG] Parameters:",
            debugParams
        );

        console.log(
            "[PayFast DEBUG] Payment ID:",
            paymentId
        );

        console.log(
            "[PayFast DEBUG] Guide IDs:",
            uniqueGuideIds
        );

        console.log(
            "[PayFast DEBUG] Guide count:",
            guideCount
        );

        console.log(
            "[PayFast DEBUG] Amount:",
            amount
        );

        console.log(
            "[PayFast DEBUG] Email:",
            cleanEmail
        );

        console.log(
            "[PayFast DEBUG] Signature:",
            params.signature
        );

        console.log(
            "============================================================"
        );

        // ─────────────────────────────────────────────────────────────────────
        // Return checkout information to Firebase frontend
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