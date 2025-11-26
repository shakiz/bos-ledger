import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        // If user is authenticated and tries to access login, redirect to dashboard
        if (req.nextUrl.pathname === "/login" && req.nextauth.token) {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // If trying to access login page, allow it (we handle redirect in middleware function above)
                if (req.nextUrl.pathname === "/login") {
                    return true
                }
                // For all other matched routes, require token
                return !!token
            },
        },
        pages: {
            signIn: "/login",
        },
    }
)

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/"],
}
