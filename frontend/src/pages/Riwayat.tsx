import { useState, useEffect } from "react"
import { apiUrl } from "../lib/api"

interface AgendaItem {
  id: number
  hari: string
  tanggal: string
  tempat: string
  pukul: string
  acara: string
  pelaksana: string
  status: string
  type: string
}

export default function Riwayat() {
  const [agendas, setAgendas] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        const response = await fetch(apiUrl('/api/agendas'))
        const data = await response.json()
        // Sort by ID descending to show newest first (history)
        setAgendas([...data].reverse())
        setLoading(false)
      } catch (error) {
        console.error('Error fetching history:', error)
        setLoading(false)
      }
    }
    fetchAgendas()
  }, [])

  return (
    <div className="flex flex-col">

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">Memuat Riwayat...</p>
          </div>
        ) : agendas.length === 0 ? (
          <div className="p-20 text-center text-gray-400 font-medium">
            Belum ada riwayat peminjaman.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50 border-b">
              <tr className="text-left text-gray-600 uppercase font-bold text-[11px] tracking-wider">
                <th className="p-4 w-12 text-center">NO</th>
                <th className="p-4">Hari / Tanggal</th>
                <th className="p-4">Ruangan</th>
                <th className="p-4">Pukul</th>
                <th className="p-4">Acara</th>
                <th className="p-4">Pelaksana</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {agendas.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{item.hari}</div>
                    <div className="text-xs text-gray-400">{item.tanggal}</div>
                  </td>
                  <td className="p-4 font-medium">{item.tempat}</td>
                  <td className="p-4 text-orange-600 font-bold">{item.pukul}</td>
                  <td className="p-4 font-semibold uppercase text-xs max-w-xs">{item.acara}</td>
                  <td className="p-4 text-gray-500">{item.pelaksana}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase
                      ${item.status === "Berlangsung" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
