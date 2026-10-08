import { Link } from '@tanstack/react-router'

interface BreadcrumbItem {
  label: string
  to?: string
  hash?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Trilha de navegação"
      className="text-caption-lg text-text-secondary hidden py-6 lg:block"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const last = index === items.length - 1

          return (
            <li key={item.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden>/</span>}
              {last || !item.to ? (
                <span
                  className={last ? 'text-text-accent font-bold' : undefined}
                  aria-current={last ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} hash={item.hash} className="hover:text-text-accent">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
