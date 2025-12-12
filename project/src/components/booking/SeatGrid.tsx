interface SeatGridProps {
  totalSeats: number;
  allocatedSeats: number[];
  selectedSeats: number[];
  onSeatClick: (seatNumber: number) => void;
}

export default function SeatGrid({
  totalSeats,
  allocatedSeats,
  selectedSeats,
  onSeatClick,
}: SeatGridProps) {
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  const getSeatClass = (seatNumber: number) => {
    if (allocatedSeats.includes(seatNumber)) {
      return 'bg-red-500 cursor-not-allowed';
    }
    if (selectedSeats.includes(seatNumber)) {
      return 'bg-blue-600 cursor-pointer hover:bg-blue-700';
    }
    return 'bg-white border-2 border-gray-300 cursor-pointer hover:bg-gray-100';
  };

  const isSeatDisabled = (seatNumber: number) =>
    allocatedSeats.includes(seatNumber);

  return (
    <div>
      <div className="flex gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded"></div>
          <span>Booked</span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {seats.map((seatNumber) => (
          <button
            key={seatNumber}
            onClick={() => !isSeatDisabled(seatNumber) && onSeatClick(seatNumber)}
            disabled={isSeatDisabled(seatNumber)}
            className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-colors ${getSeatClass(
              seatNumber
            )}`}
          >
            {seatNumber}
          </button>
        ))}
      </div>
    </div>
  );
}
