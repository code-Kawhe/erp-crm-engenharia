"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from 'react-select';
import { customStyles } from "@/styles/select";
import confirmar from "@/utils/confirm";
import { toast } from "react-toastify";
import { buscarTiposProjeto } from "@/types/tipoProjetos";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedType, setSelectedType] = useState("");
    const [taskList, setTaskList] = useState([]);
    const [isEditing, setIsEditing] = useState(false); // NOVO

    // const tiposProjeto = [
    //     { nome: "Residencial", alise: "residencial" },
    //     { nome: "Comercial", alise: "comercial" },
    //     { nome: "Industrial", alise: "industrial" },
    //     { nome: "Regularização", alise: "regularizacao" },
    //     { nome: "Topografia", alise: "topografia" },
    // ];

    const [tiposProjeto, setTiposProjeto] = useState([])
    console.log(tiposProjeto)

    useEffect(() => {
      async function carregarTipos() {
        const tipos = await buscarTiposProjeto()
        console.log(tipos)
        setTiposProjeto(tipos)
      }
  
      carregarTipos()
    }, [])

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        const snapshot = await getDocs(collection(db, "templates"));
        const data = snapshot.docs.map((doc) => doc.data());
        setTemplates(data);
    };

    const openModal = (template = null) => {
        if (template) {
            setIsEditing(true);
            setSelectedType(template.tipo);
            setTaskList(template.tarefas);
        } else {
            setIsEditing(false);
            setSelectedType("");
            setTaskList([]);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const addTask = () => {
        setTaskList([...taskList, { nome: "", subtasks: [] }]);
    };

    const removeTask = (index) => {
        const updated = [...taskList];
        updated.splice(index, 1);
        setTaskList(updated);
    };

    const updateTaskName = (index, value) => {
        const updated = [...taskList];
        updated[index].nome = value;
        setTaskList(updated);
    };

    const addSubtask = (taskIndex) => {
        const updated = [...taskList];
        updated[taskIndex].subtasks.push("");
        setTaskList(updated);
    };

    const updateSubtask = (taskIndex, subIndex, value) => {
        const updated = [...taskList];
        updated[taskIndex].subtasks[subIndex] = value;
        setTaskList(updated);
    };

    const removeSubtask = (taskIndex, subIndex) => {
        const updated = [...taskList];
        updated[taskIndex].subtasks.splice(subIndex, 1);
        setTaskList(updated);
    };

    const salvarTemplate = async () => {
        if (!selectedType) return toast.warn("Selecione um tipo de projeto");
        const toastId = toast.loading(isEditing ? 'Atualizando...' : 'Salvando...')
        const ref = doc(db, "templates", selectedType);
        await setDoc(ref, { tipo: selectedType, tarefas: taskList }).then(() => {
            toast.update(toastId, {
                render: (isEditing ? "Template atualizado!" : "Template criado!"),
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            })
            fetchTemplates();
            closeModal();
        }).catch((e)=>{
            console.error(e)
            toast.update(toastId, {
                render: (isEditing ? "Erro ao atualizar Template" : "Erro ao criar Template"),
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            })
        })
    };

    const excluirTemplate = async (tipo) => {
        const toastId = toast.loading('Excluindo...')
        await deleteDoc(doc(db, "templates", tipo)).then(() => {
            toast.update(toastId, {
                render: 'Tample excluido com sucesso!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
            })
            fetchTemplates();
        }).catch((e) => {
            console.error(e)
            toast.update(toastId, {
                render: 'Erro ao excluir tamplate',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            })
        })
    };

    const tipoOptions = tiposProjeto.map((tipo) => ({
        value: tipo.alise,
        label: tipo.nome
    }))

    return (
        <div className="p-6 mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold mb-4 text-[#011A39]">Templates de Projeto</h1>
                <Button onClick={() => openModal()} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded">
                    + Novo Template
                </Button>
            </div>
            <table className="min-w-full bg-white border rounded shadow-md">
                <thead className="bg-[#011A39] text-white text-left">
                    <tr>
                        <th className="px-4 py-2">Tipo</th>
                        <th className="px-4 py-2">Tarefas</th>
                        <th className="px-4 py-2">SubTarefas</th>
                        <th className="px-4 py-2">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {templates.length !== 0 ? (
                        templates.map((template, index) => (
                            <tr key={template.id} className="border-t hover:bg-[#F1F5F9] text-[#011A39]">
                                <td className="px-4 py-2">{template.tipo}</td>
                                <td className="px-4 py-2">{template.tarefas.length}</td>
                                <td className="px-4 py-2">{template.tarefas.reduce((total, tarefa) => total + tarefa.subtasks.length, 0)}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <Button
                                        onClick={() => openModal(template)}
                                        variant="edit"
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        onClick={() => confirmar("Deseja escluir este tamplate", () => { excluirTemplate(template.tipo) })}
                                        variant="delet"
                                    >
                                        Excluir
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={99} className="text-center text-gray-500 py-4">
                                Nenhum template cadastrado.
                            </td>
                        </tr>
                    )}

                </tbody>
            </table>

            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center text-[#011A39]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative overflow-y-auto h-[90vh]">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-3 text-gray-600 hover:text-black text-lg"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl font-bold mb-4">
                            {isEditing ? "Editar" : "Novo"} Template
                        </h2>

                        <div className="mb-4">
                            <label className="font-medium mr-2">Tipo de Projeto:</label>
                            <Select
                                value={tipoOptions.find((opt) => opt.value === selectedType) || null}
                                onChange={(selected) => setSelectedType(selected ? selected.value : '')}
                                options={tipoOptions}
                                isDisabled={isEditing}
                                styles={customStyles}
                                placeholder="Selecione o tipo de projeto..."
                                className="min-w-[200px]"
                            />
                        </div>

                        {taskList.map((task, taskIndex) => (
                            <div
                                key={taskIndex}
                                className="border rounded-lg p-4 mb-4 bg-gray-100"
                            >
                                <div className="flex justify-between items-center">
                                    <Input
                                        type="text"
                                        value={task.nome}
                                        onChange={(e) =>
                                            updateTaskName(taskIndex, e.target.value)
                                        }
                                        placeholder="Nome da Tarefa"
                                        className="w-full border px-2 py-1 mr-2"
                                    />
                                    <Button
                                        onClick={() => removeTask(taskIndex)}
                                        variant="delet2"
                                    >
                                        Remover
                                    </Button>
                                </div>

                                <div className="mt-2 ml-4">
                                    {/* <h3 className="font-semibold mb-1">Subtarefas</h3> */}
                                    {task.subtasks.map((sub, subIndex) => (
                                        <div key={subIndex} className="flex items-center mb-1">
                                            <Input
                                                type="text"
                                                value={sub}
                                                onChange={(e) =>
                                                    updateSubtask(taskIndex, subIndex, e.target.value)
                                                }
                                                placeholder="Nome da Subtarefa"
                                                className="w-full border px-2 py-1"
                                            />
                                            <Button
                                                onClick={() => removeSubtask(taskIndex, subIndex)}
                                                variant="delet2"
                                            >
                                                X
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={() => addSubtask(taskIndex)}
                                        variant="def2"
                                    >
                                        + Adicionar Subtarefa
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button
                            onClick={addTask}
                            variant="final"
                        >
                            + Nova Tarefa
                        </Button>
                        <Button
                            onClick={salvarTemplate}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {isEditing ? "Atualizar" : "Salvar"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
