"use client"

import { signOut } from "next-auth/react"
import { MdLogout } from "react-icons/md"

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
            <MdLogout size={18} />
            <span>Logout</span>
        </button>
    )
}
