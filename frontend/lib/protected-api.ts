import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "./auth";

export function withProtectedApi(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { roles?: Role[] } = {}
) {
  return async function (req: NextRequest) {
    try {
      const token = req.cookies.get("token");

      if (!token) {
        return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
        });
      }

      // Add session activity check
      const session = req.cookies.get("session");
      if (!session) {
        return new NextResponse(
          JSON.stringify({ message: "Session expired" }),
          { status: 401 }
        );
      }

      // Add role check if specified
      if (options.roles?.length) {
        const userRole = req.headers.get("X-User-Role");
        if (!userRole || !options.roles.includes(userRole as Role)) {
          return new NextResponse(JSON.stringify({ message: "Forbidden" }), {
            status: 403,
          });
        }
      }

      return handler(req);
    } catch (error) {
      console.error("Protected API error:", error);
      return new NextResponse(
        JSON.stringify({ message: "Internal server error" }),
        { status: 500 }
      );
    }
  };
}
