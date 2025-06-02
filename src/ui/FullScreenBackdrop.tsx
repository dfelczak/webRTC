import type { ReactNode } from 'react'

export function FullScreenBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-md z-[9999] flex items-center justify-center">
      <div className="bg-zinc-900 p-4 rounded-xl shadow-lg min-w-lg">{children}</div>
    </div>
  )
}
