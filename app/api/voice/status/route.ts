// GET /api/voice/status — whether Sakhi's order phone calls are switched on
// here (the farmer's "Call me about this order" button shows only then).
import { handler } from "@/lib/api";
import { callsEnabled } from "@/lib/voice-call";

export const GET = handler({ roles: ["FARMER", "ADMIN"] }, async () => ({ enabled: callsEnabled() }));
