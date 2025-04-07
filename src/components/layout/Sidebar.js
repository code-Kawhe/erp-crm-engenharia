'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar({ perfil }) {
  const pathname = usePathname()

  const links = {
    admin: [
      { href: '/painel/admin/projetos', label: 'Projetos' },
      { href: '/painel/admin/usuarios', label: 'Usuários' },
    ],
    gestor: [
      { href: '/painel/gestor/projetos', label: 'Meus Projetos' },
      { href: '/painel/gestor/equipe', label: 'Equipe' },
    ],
    tecnico: [
      { href: '/painel/tecnico/tarefas', label: 'Tarefas' },
      { href: '/painel/tecnico/projetos', label: 'Projetos' },
    ],
    cliente: [
      { href: '/painel/cliente/projetos', label: 'Projetos' },
      { href: '/painel/cliente/suporte', label: 'Suporte' },
    ],
  }

  return (
    <aside className="w-64 h-screen bg-[#011A39] text-[#B2B8BE] p-4 shadow-lg">
      <h2 className="text-lg font-bold mb-4 border-b border-[#010721] pb-2">
        Menu {perfil.charAt(0).toUpperCase() + perfil.slice(1)}
      </h2>

      <nav className="flex flex-col gap-2">
        {links[perfil]?.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-md transition font-medium ${
              pathname.startsWith(href)
                ? 'bg-[#045CA] text-white'
                : 'hover:bg-[#010721] hover:text-white'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
