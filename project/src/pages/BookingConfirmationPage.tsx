import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { CheckCircle, XCircle, Loader2, Ticket, User, Calendar } from 'lucide-react';

export default function BookingConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { currentBooking, loading, getBookingById } = useBooking();

  useEffect(() => {
    if (id) {
      getBookingById(id);
    }
  }, [id]);

  if (loading || !currentBooking) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isConfirmed = currentBooking.status === 'CONFIRMED';
  const isPending = currentBooking.status === 'PENDING';
  const isFailed = currentBooking.status === 'FAILED';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          {isConfirmed && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-gray-600">Your seats have been reserved successfully.</p>
            </>
          )}

          {isPending && (
            <>
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Processing Booking...
              </h1>
              <p className="text-gray-600">Please wait while we confirm your booking.</p>
            </>
          )}

          {isFailed && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Failed</h1>
              <p className="text-gray-600">
                We couldn't complete your booking. The seats may have been taken.
              </p>
            </>
          )}
        </div>

        {(isConfirmed || isPending) && (
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md">
              <Ticket className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Booking ID</p>
                <p className="text-gray-900 font-mono">{currentBooking.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md">
              <User className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Booked By</p>
                <p className="text-gray-900">{currentBooking.user_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Seats</p>
                <p className="text-gray-900">{currentBooking.seats.join(', ')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-md">
              <CheckCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-gray-900 font-medium">{currentBooking.status}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            to="/"
            className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Shows
          </Link>
          {isFailed && (
            <Link
              to={`/booking/${currentBooking.show_id}`}
              className="flex-1 bg-gray-600 text-white text-center py-3 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
            >
              Try Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
