import type { ReactNode } from 'react'

export function CTA({
  title,
  children,
  subtitle,
  button,
}: {
  title: string
  children?: ReactNode
  subtitle?: string
  button: ReactNode
}) {
  return (
    <div className="container flex flex-col items-center px-4 py-12 mx-auto text-center">
      <h2 className="max-w-2xl mx-auto text-2xl font-semibold tracking-tight text-gray-800 xl:text-3xl dark:text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="max-w-4xl mt-6 text-center text-gray-500 dark:text-gray-300">{subtitle}</p>
      )}
      <div className="my-8 flex flex-col items-center container">{children}</div>

      <div className="inline-flex w-full sm:w-auto">{button}</div>
    </div>
  )
}
