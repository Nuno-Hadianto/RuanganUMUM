import { useState, useEffect } from "react"
import StatCard from "../components/DashboardComponents/StatCard"
import BookingTable from "../components/DashboardComponents/BookingTable"
import DashboardFilter from "../components/DashboardComponents/DashboardFilter"
import "../index.css"
import { apiUrl } from "../lib/api"

export default function RoomDashboard() {

const [statusFilter,setStatusFilter] = useState("Semua")
const [tempatFilter,setTempatFilter] = useState("Semua")
const [hariFilter,setHariFilter] = useState("Terdekat")

const [bpkadData,setBpkadData] = useState<any[]>([])
const [pemkotData,setPemkotData] = useState<any[]>([])
const [selectedAgenda, setSelectedAgenda] = useState<any | null>(null)

/* =========================
   FETCH DATA FROM API
========================= */
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(apiUrl('/api/agendas'))
      const data = await response.json()
      
      const bpkad = data.filter((item: any) => item.type === 'BPKAD')
      const pemkot = data.filter((item: any) => item.type === 'PEMKOT')
      
      setBpkadData(bpkad)
      setPemkotData(pemkot)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }
  fetchData()
}, [])

/* =========================
   STAT CARD
========================= */

const totalBpkad = bpkadData.length
const totalPemkot = pemkotData.length

const sedangDigunakan =
bpkadData.filter(d=>d.status==="Berlangsung").length +
pemkotData.filter(d=>d.status==="Berlangsung").length

const terjadwal =
bpkadData.filter(d=>d.status==="Terjadwal").length +
pemkotData.filter(d=>d.status==="Terjadwal").length

return(
  <div className="flex flex-col">

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
      <StatCard
        number={totalBpkad.toString()}
        label="PEMINJAMAN BPKAD"
        color="border-orange-500 text-orange-500"
      />

      <StatCard
        number={totalPemkot.toString()}
        label="PEMINJAMAN PEMKOT"
        color="border-indigo-500 text-indigo-500"
      />

      <StatCard
        number={sedangDigunakan.toString()}
        label="SEDANG DIGUNAKAN"
        color="border-green-500 text-green-500"
      />

      <StatCard
        number={terjadwal.toString()}
        label="TERJADWAL"
        color="border-purple-500 text-purple-500"
      />
    </div>

    <DashboardFilter
      setStatusFilter={setStatusFilter}
      setTempatFilter={setTempatFilter}
      setHariFilter={setHariFilter}
      selectedAgenda={selectedAgenda}
    />

    <BookingTable
      statusFilter={statusFilter}
      tempatFilter={tempatFilter}
      hariFilter={hariFilter}
      bpkadData={bpkadData}
      pemkotData={pemkotData}
      setBpkadData={setBpkadData}
      setPemkotData={setPemkotData}
      selectedAgenda={selectedAgenda}
      setSelectedAgenda={setSelectedAgenda}
    />
  </div>
)
}
