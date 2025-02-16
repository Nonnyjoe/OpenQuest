import { withProtectedApi } from "@/lib/protected-api";
import { ROLES } from "@/lib/auth";
import { NextResponse } from "next/server";

export const POST = withProtectedApi(
  async (req) => {
    // Your existing quiz creation logic
    const data = await req.json();
    // ... handle quiz creation
    return new NextResponse(JSON.stringify({ success: true }));
  },
  { roles: [ROLES.ADMIN, ROLES.PROTOCOL_ADMIN] }
);
