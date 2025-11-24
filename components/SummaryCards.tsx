export default function SummaryCards({ totalIn, totalOut, finalBalance }: { totalIn: number; totalOut: number; finalBalance: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card bg-[#F4F4F4] text-[#0C2B4E]">
        <div className="text-sm text-[#1D546C]">Total In</div>
        <div className="text-2xl font-bold" style={{ color: '#1A3D64' }}>৳{totalIn.toFixed(2)}</div>
      </div>
      <div className="card bg-[#F4F4F4] text-[#0C2B4E]">
        <div className="text-sm text-[#1D546C]">Total Out</div>
        <div className="text-2xl font-bold" style={{ color: '#1D546C' }}>৳{totalOut.toFixed(2)}</div>
      </div>
      <div className="card bg-[#F4F4F4] text-[#0C2B4E]">
        <div className="text-sm text-[#1D546C]">Final Balance</div>
        <div className="text-2xl font-bold" style={{ color: finalBalance >= 0 ? '#1A3D64' : '#D32F2F' }}>{finalBalance.toFixed(2)}</div>
      </div>
    </div>
  )
}
