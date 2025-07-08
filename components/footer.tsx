import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 py-16 mt-auto shadow-lg">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#00C896] to-[#00A07E] bg-clip-text text-transparent">
                ECO HUB KOSOVA
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Platforma e parë e ekonomisë qarkulluese në Kosovë për një të ardhme të qëndrueshme.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Lidhje</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/eksploro"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Eksploro
                </Link>
              </li>
              <li>
                <Link
                  href="/partnere"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Partnerët
                </Link>
              </li>
              <li>
                <Link
                  href="/tregu"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Tregu
                </Link>
              </li>
              <li>
                <Link
                  href="/qendra-e-dijes"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Qendra e Dijes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Rreth Nesh</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/kush-jemi"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Kush jemi ne
                </Link>
              </li>
              <li>
                <Link
                  href="/misioni"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Misioni ynë
                </Link>
              </li>
              <li>
                <Link
                  href="/koalicioni"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Koalicioni
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Mbështetje</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/kontakti"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Kontakti
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm">
                  Pyetje të shpeshta
                </Link>
              </li>
              <li>
                <Link
                  href="/ndihme"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Ndihmë
                </Link>
              </li>
              <li>
                <Link
                  href="/kushtet-e-perdorimit"
                  className="text-gray-600 hover:text-[#00C896] transition-colors duration-300 text-sm"
                >
                  Kushtet e përdorimit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} ECO HUB KOSOVA. Të gjitha të drejtat e rezervuara.
          </p>
          <p className="mt-2 text-sm text-gray-500">Mbështetur nga Koalicioni i Ekonomisë Qarkulluese</p>
        </div>
      </div>
    </footer>
  )
}
