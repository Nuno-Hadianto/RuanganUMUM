import { useState, useEffect, useMemo } from "react"
import logo from "../assets/images/logo.png"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { apiUrl } from "../lib/api"

interface AgendaItem {
  no: number
  hari: string
  tanggal: string
  tempat: string
  pukul: string
  acara: string
  pelaksana: string
  dihadiri?: string
  status: "Berlangsung" | "Terjadwal"
  type: "BPKAD" | "PEMKOT"
}

export default function PreviewHorizontal() {
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  const [allAgendas, setAllAgendas] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch Data from API
  const fetchAgendas = async () => {
    try {
      const response = await fetch(apiUrl('/api/agendas'))
      const data = await response.json()
      setAllAgendas(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching agendas:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgendas()
    const refreshInterval = setInterval(fetchAgendas, 30000) // Refresh every 30 seconds
    return () => clearInterval(refreshInterval)
  }, [])

  const itemsPerPageCount = 3 // 3 items per page for horizontal layout
  const SLIDE_DURATION = 10000 // 10 seconds per page

  // Process data into pages grouped by type with reset numbering
  const pagedAgendas = useMemo(() => {
    if (!allAgendas.length) return []
    
    const bpkad = allAgendas
      .filter(item => item.type === "BPKAD")
      .map((item, idx) => ({ ...item, no: idx + 1 }))
    
    const pemkot = allAgendas
      .filter(item => item.type === "PEMKOT")
      .map((item, idx) => ({ ...item, no: idx + 1 }))

    const chunk = (arr: AgendaItem[], size: number) => {
      const chunks = []
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size))
      }
      return chunks
    }

    return [...chunk(bpkad, itemsPerPageCount), ...chunk(pemkot, itemsPerPageCount)]
  }, [allAgendas, itemsPerPageCount])

  const totalPages = pagedAgendas.length
  const [currentPage, setCurrentPage] = useState(0)
  const [progress, setProgress] = useState(0)

  // Update Time
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-slide Progress Bar Logic
  useEffect(() => {
    if (totalPages === 0) return

    const interval = 50 // Update every 50ms for smoother animation
    const step = (interval / SLIDE_DURATION) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentPage((oldPage) => {
             const nextPage = (oldPage + 1) % totalPages
             return nextPage
          })
          return 0
        }
        return prev + step
      })
    }, interval)

    return () => clearInterval(timer)
  }, [totalPages])

  const currentAgendas = useMemo(() => {
    return pagedAgendas[currentPage] || []
  }, [currentPage, pagedAgendas])

  const pageTitle = useMemo(() => {
    const firstItemType = currentAgendas[0]?.type
    return `AGENDA RUANG RAPAT ${firstItemType || "BPKAD"}`
  }, [currentAgendas])

  const hasDihadiriData = useMemo(() => {
    return currentAgendas.some(item => item.dihadiri)
  }, [currentAgendas])

  if (loading && allAgendas.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-sm">Menghubungkan ke Database...</p>
      </div>
    )
  }

  return (
    <div className="bg-[#f3f4f6] h-screen relative overflow-hidden flex flex-col">
      
      {/* HIDDEN BACK BUTTON TRIGGER (TOP LEFT) */}
      <div className="fixed top-0 left-0 w-20 h-20 z-50 group flex items-start justify-start p-3">
        <button 
          onClick={() => navigate('/preview')}
          className="bg-white p-2 rounded-full shadow-2xl border border-gray-100 text-orange-500 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 active:scale-90"
        >
          <ArrowLeft size={18} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 p-3 md:p-5 flex flex-col w-full max-w-[1920px] mx-auto overflow-hidden">
        {/* HEADER: CLOCK, DATE & LOGO */}
        <div className="flex justify-between items-center mb-2 pl-8 md:pl-0">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-6xl font-black text-gray-800 leading-none">
                {format(time, "HH:mm")}
              </span>
              <span className="text-xl md:text-2xl font-bold text-orange-500">WITA</span>
            </div>
            <span className="text-lg md:text-xl font-bold text-orange-500 uppercase tracking-widest leading-none mt-1">
              {format(time, "EEEE, dd MMMM yyyy", { locale: id })}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo BPKAD" className="h-14 md:h-16 object-contain" />
          </div>
        </div>

        {/* PROGRESS ACCENT BAR */}
        <div className="w-full h-1.5 rounded-full overflow-hidden flex mb-3 shadow-inner bg-gray-200">
            <div 
              className="bg-orange-500 h-full shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
        </div>

        {/* DYNAMIC PAGE TITLE */}
        <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight uppercase leading-none min-h-[1em]">
              {pageTitle}
            </h1>
            
            {/* DYNAMIC PAGE CIRCLES */}
            <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i === currentPage 
                        ? "bg-orange-500 shadow-lg shadow-orange-200 animate-pulse scale-125" 
                        : "bg-gray-300 shadow-sm"
                    }`}
                  ></div>
                ))}
            </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[1.2rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 w-full flex-1 flex flex-col">
          <table className="w-full border-collapse flex-1 flex flex-col items-stretch">
            <thead className="w-full">
              <tr className="bg-orange-500 text-white flex w-full">
                <th className="py-3 px-2 text-center text-lg font-black border-r border-orange-400/30 w-16 flex items-center justify-center">NO</th>
                <th className="py-3 px-4 text-left text-lg font-black border-r border-orange-400/30 flex-1 flex items-center">HARI / TANGGAL</th>
                <th className="py-3 px-4 text-left text-lg font-black border-r border-orange-400/30 flex-1 flex items-center">TEMPAT</th>
                <th className="py-3 px-4 text-center text-lg font-black border-r border-orange-400/30 w-36 flex items-center justify-center">PUKUL</th>
                <th className="py-3 px-6 text-left text-lg font-black border-r border-orange-400/30 flex-[1.5] flex items-center">ACARA</th>
                <th className="py-3 px-4 text-left text-lg font-black border-r border-orange-400/30 flex-1 flex items-center">PELAKSANA</th>
                {hasDihadiriData && (
                  <th className="py-3 px-4 text-left text-lg font-black border-r border-orange-400/30 flex-1 flex items-center">DIHADIRI</th>
                )}
                <th className="py-3 px-4 text-center text-lg font-black w-36 flex items-center justify-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 flex-1 flex flex-col w-full overflow-hidden">
              {currentAgendas.map((item, idx) => (
                <tr key={`${currentPage}-${idx}`} className="hover:bg-orange-50/40 transition-all duration-300 group flex w-full flex-1 items-stretch min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                  <td className="px-2 text-xl font-black text-gray-400 text-center border-r border-gray-50 group-hover:text-orange-500 transition-colors w-16 flex items-center justify-center">
                    {item.no}
                  </td>
                  <td className="px-4 border-r border-gray-50 flex-1 flex flex-col justify-center min-w-0">
                    <span className="text-lg font-black text-gray-800 uppercase leading-none mb-1 truncate">
                      {item.hari}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                      {item.tanggal.includes(', ') ? item.tanggal.split(', ')[1] : item.tanggal}
                    </span>
                  </td>
                  <td className="px-4 border-r border-gray-50 flex-1 flex items-center min-w-0">
                    <span className="text-lg font-black text-gray-800 uppercase leading-tight line-clamp-2">
                        {item.tempat}
                    </span>
                  </td>
                  <td className="px-4 border-r border-gray-50 w-36 flex items-center justify-center">
                    <span className="text-xl font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-md">
                        {item.pukul}
                    </span>
                  </td>
                  <td className="px-6 border-r border-gray-50 flex-[1.5] flex items-center min-w-0">
                    <span className="text-lg font-black text-gray-800 uppercase leading-[1.1] block line-clamp-2">
                        {item.acara}
                    </span>
                  </td>
                  <td className="px-4 border-r border-gray-50 flex-1 flex items-center min-w-0">
                    <span className="text-lg font-black text-gray-800 uppercase leading-tight group-hover:text-gray-600 transition-colors line-clamp-2">
                        {item.pelaksana}
                    </span>
                  </td>
                  {hasDihadiriData && (
                    <td className="px-4 border-r border-gray-50 flex-1 flex items-center min-w-0">
                      <span className="text-lg font-black text-gray-800 uppercase leading-tight line-clamp-2">
                          {item.dihadiri || "-"}
                      </span>
                    </td>
                  )}
                  <td className="px-4 w-36 flex items-center justify-center">
                    <span
                      className={`
                        inline-block w-32 py-2 rounded-xl text-sm font-black text-white text-center shadow-lg transition-all duration-300 group-hover:scale-105
                        ${
                          item.status === "Berlangsung"
                            ? "bg-[#10b981] shadow-green-100"
                            : "bg-[#3b82f6] shadow-blue-100"
                        }
                      `}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Fill empty rows if needed to keep height consistent */}
              {currentAgendas.length < itemsPerPageCount && Array.from({ length: itemsPerPageCount - currentAgendas.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="flex w-full flex-1 items-stretch min-h-0">
                  <td className="w-full"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
