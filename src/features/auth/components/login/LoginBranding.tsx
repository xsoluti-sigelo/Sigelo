'use client'

export function LoginBranding() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center text-white"
      style={{
        background: 'linear-gradient(135deg, rgb(54, 209, 197) 0%, rgb(43, 193, 181) 100%)',
      }}
    >
      <div>
        <h1 className="text-6xl font-bold mb-6">Sigelo</h1>
        <p className="text-xl text-white/90 leading-relaxed">
          Sistema inteligente de gerenciamento de locação
        </p>
      </div>
    </div>
  )
}
