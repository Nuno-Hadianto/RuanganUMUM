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

export default function PreviewVertikal() {
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

  const itemsPerPageCount = 2
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
          setCurrentPage((oldPage) => (oldPage + 1) % totalPages)
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

      <div className="flex-1 p-3 md:p-4 flex flex-col w-full max-w-full mx-auto overflow-hidden">
        {/* HEADER: CLOCK, DATE & LOGO */}
        <div className="flex flex-col items-center mb-3 text-center">
          <img src={logo} alt="Logo BPKAD" className="h-10 mb-2 object-contain" />
          
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1.5 mb-0">
              <span className="text-3xl md:text-4xl font-black text-gray-800 leading-none">
                {format(time, "HH:mm")}
              </span>
              <span className="text-base md:text-lg font-bold text-orange-500">WITA</span>
            </div>
            <span className="text-xs md:text-sm font-bold text-orange-500 uppercase tracking-widest leading-none">
              {format(time, "EEEE, dd MMMM yyyy", { locale: id })}
            </span>
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
        <div className="flex flex-col items-center mb-3 text-center">
            <h1 className="text-lg md:text-xl font-black text-gray-800 tracking-tight uppercase leading-tight mb-2 min-h-[1.5em]">
              {pageTitle}
            </h1>
            
            {/* DYNAMIC PAGE CIRCLES */}
            <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === currentPage 
                        ? "bg-orange-500 shadow-lg shadow-orange-200 animate-pulse scale-110" 
                        : "bg-gray-300 shadow-sm"
                    }`}
                  ></div>
                ))}
            </div>
        </div>

        {/* AGENDA LIST CONTAINER (2 PER PAGE) */}
        <div className="flex-1 overflow-hidden space-y-4 pb-4">
          <div className="flex flex-col gap-4">
            {currentAgendas.map((item, idx) => (
              <div key={`${currentPage}-${idx}`} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col relative">
                {/* STATUS BADGE */}
                <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-black text-white shadow-md z-10
                  ${item.status === "Berlangsung" ? "bg-[#10b981]" : "bg-[#3b82f6]"}`}>
                  {item.status}
                </div>

                {/* TOP SECTION: NO & TIME */}
                <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-xl shadow-orange-200 shadow-lg">
                    {item.no}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none">
                      {item.hari}
                    </div>
                    <div className="text-xs font-black text-gray-600 uppercase mt-0.5">
                      {item.tanggal.includes(', ') ? item.tanggal.split(', ')[1] : item.tanggal}
                    </div>
                    <div className="text-lg font-black text-orange-500 leading-none mt-1">{item.pukul}</div>
                  </div>
                </div>

                {/* MIDDLE SECTION: CONTENT */}
                <div className="p-5 flex flex-col gap-4">
                  {/* ACARA */}
                  <div>
                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">ACARA / AGENDA</div>
                    <h3 className="text-xl font-black text-gray-800 leading-tight uppercase line-clamp-3">
                      {item.acara}
                    </h3>
                  </div>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">TEMPAT / RUANG</div>
                      <div className="text-sm font-black text-gray-700 leading-snug uppercase">
                        {item.tempat}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">PELAKSANA</div>
                      <div className="text-sm font-black text-gray-700 leading-snug uppercase">
                        {item.pelaksana}
                      </div>
                    </div>
                  </div>

                  {/* DIHADIRI (IF ANY) */}
                  {item.dihadiri && (
                    <div className="mt-1 border-t border-gray-50 pt-3">
                      <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">DIHADIRI / PESERTA</div>
                      <div className="text-sm font-black text-gray-800 uppercase leading-snug">
                        {item.dihadiri}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
