import { useState } from 'react'

export function useCopyToClipboard(
  timeout: number = 2000,
): [boolean, (text: string) => Promise<boolean>] {
  const [isCopied, setIsCopied] = useState(false)

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), timeout)
      return true
    } catch {
      setIsCopied(false)
      return false
    }
  }

  return [isCopied, copy]
}
