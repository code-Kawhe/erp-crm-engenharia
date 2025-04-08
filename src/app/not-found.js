'use client'
import { useRouter } from 'next/navigation';
import './Erro404-Style.css'
function Erro404() {
    const router = useRouter()
    return (
        <>
            <title>ERRO 404</title>
            <div className='BG1404'>
                <p>404</p>
            </div>
            <div class="caution-tape"></div>
            <div className='BG2404'>
                <h2>PAGINA NÃO ENCONTRADA</h2>
                {/* <p>Este endereço Não foi encontrado: {window.location.href}</p> */}
                <div className='BTNS404'>
                    <a href="*">Home</a>
                    <a href="https://kawhealvesdossantos.com.br/projetos">Projetos</a>
                    <a href="https://kawhealvesdossantos.com.br/contato">Contato</a>
                </div>
                <button onClick={() => router.back()}>Voltar</button>
            </div>
        </>
    )
}
export default Erro404;