import { Slide, ToastContainer } from "react-toastify";
import "./globals.css";
export const metadata = {
  title: 'ERP Engenharia',
  description: 'Sistema de gestão para escritórios de engenharia',
}
export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" webcrx="" foxified-44="">
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        limit={3}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
      <body>{children}</body>
    </html>
  )
}
