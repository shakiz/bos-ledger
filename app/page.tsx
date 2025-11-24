import { redirect } from 'next/navigation'

export default function HomePage() {
  // default landing -> dashboard
  redirect('/dashboard')
}
