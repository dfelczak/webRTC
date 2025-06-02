import { Bug } from 'lucide-react'
import { useState } from 'react'

export function DebugButton({ children }: { children: React.ReactNode }) {
  const [showDebug, setShowDebug] = useState(false)
  return (
    <>
      <button
        onClick={() => setShowDebug((s) => !s)}
        className={`
      fixed top-6 left-6 z-50 w-14 h-14 rounded-full bg-gray-900 hover:bg-green-700
      shadow-xl flex items-center justify-center
      transition-all duration-150
      active:scale-95
      border border-green-400
      outline-none focus:ring-2 focus:ring-green-400
    `}
        style={{ cursor: 'pointer' }}
        title="Toggle Debug"
      >
        <Bug className="w-7 h-7 text-green-300" />
      </button>

      {showDebug && children}
    </>
  )
}
