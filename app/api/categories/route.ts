import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Fetch all ledger entries and extract unique categories
        const entries = await prisma.ledgerEntry.findMany({
            select: {
                category: true
            }
        })

        // Extract unique categories, filter out empty strings
        const categories = Array.from(
            new Set(
                entries
                    .map(e => e.category)
                    .filter(cat => cat && cat.trim() !== '')
            )
        ).sort()

        return NextResponse.json({ categories })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json({ categories: [] })
    }
}
