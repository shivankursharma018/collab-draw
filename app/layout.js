
import './globals.css'

export const metadata = {
  title: 'Realtime Whiteboard',
  description: 'A realtime whiteboard sharing application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

