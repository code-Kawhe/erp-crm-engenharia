import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function confirmar(text, onConfirm) {
  toast(
    ({ closeToast }) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-yellow-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856C18.07 20 19 19.105 19 18.065V5.935C19 4.895 18.07 4 16.918 4H7.082C5.93 4 5 4.895 5 5.935v12.13C5 19.105 5.93 20 7.082 20z"
            />
          </svg>
          <span className="font-semibold">{text}</span>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              onConfirm()
              closeToast()
            }}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Sim
          </button>
          <button
            onClick={closeToast}
            className="bg-gray-300 text-black px-3 py-1 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    ),
    {
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: false,
    }
  )
}