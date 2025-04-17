'use client'
import { useEffect, useState } from 'react'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage'
import { toast } from 'react-toastify'
import confirmar from '@/utils/confirm'
import Select from 'react-select';
import { customStyles } from '@/styles/select'
import { Button } from '@/components/ui/button'

export default function ClienteForm({ onClose, cliente }) {
    const [arquivosExistentes, setArquivosExistentes] = useState(cliente?.arquivos || [])

    const [formData, setFormData] = useState({
        tipo: cliente?.tipo || { label: 'Pessoa fisica', value: 'PF' },
        razão: cliente?.nome || '',
        nome: cliente?.nome || '',
        cpf: cliente?.cpf || '',
        cnpj: cliente?.cnpj || '',
        email: cliente?.email || '',
        endereço: cliente?.endereço || '',
        bairro: cliente?.bairro || '',
        numero: cliente?.numero || '',
        municipio: cliente?.municipio || '',
        estado: cliente?.estado || '',
        complemento: cliente?.complemento || '',
        cell: cliente?.cell || '',
    })

    const [uploading, setUploading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const toastId = toast.loading(cliente ? 'Atualizando...' : 'Salvando...')
        setUploading(true)
        try {
            if (cliente) {
                // Atualização
                const clienteRef = doc(db, 'clientes', cliente.id)
                await updateDoc(clienteRef, {
                    ...formData
                })
                toast.update(toastId, {
                    render: 'cliente atualizado com sucesso!',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000,
                })
            } else {
                // Criação de novo cliente
                const clienteRef = await addDoc(collection(db, 'clientes'), {
                    ...formData,
                })
                await updateDoc(clienteRef, {
                    criadoEm: serverTimestamp(),
                })

                toast.update(toastId, {
                    render: 'cliente criado com sucesso!',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000,
                })
            }
            onClose()
        } catch (error) {
            console.error('Erro ao salvar cliente:', error)
            toast.update(toastId, {
                render: 'Erro ao salvar cliente.',
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            })
        } finally {
            setUploading(false)
        }
    }

    const handleSelectChange = (selectedOptions, actionMeta) => {
        setFormData({
            ...formData,
            [actionMeta.name]: selectedOptions
        })
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl max-h-9/10 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-[#011A39]">Novo cliente</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        styles={customStyles}
                        name="tipo"
                        onChange={handleSelectChange}
                        placeholder="Tipo de cliente..."
                        options={
                            [
                                { label: "Pessoa fisica", value: "PF" },
                                { label: "Pessoa juridica", value: "PJ" },
                            ]
                        }
                    />


                    {formData.tipo.value === "PF" ? (
                        <>
                            <div className='flex justify-around gap-3'>
                                <input
                                    name="nome"
                                    placeholder="Nome do cliente"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                                    required
                                />
                                <input
                                    name="cpf"
                                    placeholder="CPF"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                                    required
                                />
                            </div>
                        </>
                    ) : ("")}

                    {formData.tipo.value === "PJ" ? (
                        <>
                            <div className='flex justify-around gap-3'>
                                <input
                                    name="razão"
                                    placeholder="Razão Social"
                                    value={formData.razão}
                                    onChange={handleChange}
                                    className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                                    required
                                />
                                <input
                                    name="cnpj"
                                    placeholder="CNPJ"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                                    required
                                />
                            </div>
                        </>
                    ) : ("")}

                    <input
                        name="email"
                        placeholder="E-Mail"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                    />

                    <input
                        name="cell"
                        placeholder="Telefone"
                        value={formData.cell}
                        onChange={handleChange}
                        className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                    />

                    <input
                        name="endereço"
                        placeholder="Endereço"
                        value={formData.endereço}
                        onChange={handleChange}
                        className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                    />

                    <div className='flex justify-around gap-3'>
                        <input
                            name="bairro"
                            placeholder="Bairro"
                            value={formData.bairro}
                            onChange={handleChange}
                            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                        />
                        <input
                            name="numero"
                            placeholder="Numero"
                            value={formData.numero}
                            onChange={handleChange}
                            className="w-[40%] border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                        />
                    </div>

                    <div className='flex justify-around gap-3'>
                        <input
                            name="municipio"
                            placeholder="Municipio"
                            value={formData.municipio}
                            onChange={handleChange}
                            className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                        />
                        <input
                            name="estado"
                            placeholder="Estado"
                            value={formData.estado}
                            onChange={handleChange}
                            className="w-[40%] border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                        />
                    </div>

                    <input
                        name="complemento"
                        placeholder="Complemento"
                        value={formData.complemento}
                        onChange={handleChange}
                        className="w-full border border-[#6B6B6B] rounded px-3 py-2 bg-white text-[#011A39]"
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant='out'
                            disabled={uploading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant='final'
                            disabled={uploading}
                        >
                            {uploading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>
        </div >
    )
}
