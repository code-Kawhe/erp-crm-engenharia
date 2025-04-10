import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@headlessui/react'

export default function AddTasksModal({ aberto, onClose, onSalvar, titulo }) {
  const [nome, setNome] = useState('')

  const salvar = () => {
    if (nome.trim() !== '') {
      onSalvar(nome.trim())
      setNome('')
      onClose()
    }
  }

  return (
    <Dialog open={aberto} onClose={onClose} className="relative z-50 text-[#011A39]">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <Dialog.Title className="text-xl font-bold mb-4">{titulo}</Dialog.Title>
          <input
            type="text"
            placeholder="Digite o nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="outline">Cancelar</Button>
            <Button onClick={salvar} variant="edit">Salvar</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}