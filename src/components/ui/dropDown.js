// components/DropdownMenu.js
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

const variantClasses = {
  def: 'bg-blue-600 text-white hover:bg-blue-700',
  out: 'border border-gray-300 text-gray-800 bg-white hover:bg-gray-100',
  dan: 'bg-red-600 text-white hover:bg-red-700',
  gh: 'text-gray-700 hover:bg-gray-100',
}

const itemVariantClasses = {
  def: 'text-gray-700 hover:bg-gray-100',
  dan: 'text-red-700 hover:bg-red-100',
  su: 'text-green-700 hover:bg-green-100',
  if: 'text-blue-700 hover:bg-blue-100',
}

export default function DropdownMenu({title, items, variant = 'def',itemVariant = 'def'}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        className={`px-2 rounded-md transition duration-150 ${variantClasses[variant] || ''}`}
      >
        {title}
      </MenuButton>

      <MenuItems
        anchor="bottom"
        className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black/5 focus:outline-none"
      >
        {items.map((item, idx) => (
          <MenuItem key={idx}>
            {({ active }) => (
              <button
                onClick={item.onClick}
                className={`w-full text-left px-4 py-2 text-sm rounded-md transition ${
                  active ? 'bg-blue-100' : ''
                } ${
                  item.className
                    ? item.className
                    : itemVariantClasses[item.variant || itemVariant]
                }`}
              >
                {item.label}
              </button>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}
