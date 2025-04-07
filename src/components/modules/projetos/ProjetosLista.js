import { useState } from 'react'
import ProjetosForm from './ProjetosForm'

export default function ProjetosLista() {
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Projetos</h1>
        <button
          onClick={() => setMostrarForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Novo Projeto
        </button>
      </div>

      {/* Lista de projetos - placeholder */}
      <div className="text-gray-500">Nenhum projeto cadastrado ainda.</div>

      {/* Formulário em modal */}
      {mostrarForm && (
        <ProjetosForm onClose={() => setMostrarForm(false)} />
      )}
    </div>
  )
}
