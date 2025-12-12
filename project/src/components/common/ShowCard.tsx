import React from 'react';
import { Calendar, Clock, Users, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Show {
  id: string;
  name: string;
  start_time: string;
  total_seats: number;
  available_seats: number;
  trailer_url?: string;
}

interface ShowCardProps {
  show: Show;
}

const ShowCard: React.FC<ShowCardProps> = ({ show }) => {
  const navigate = useNavigate();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions),
    };
  };

  const { date, time } = formatDateTime(show.start_time);
  const isAvailable = show.available_seats > 0;
  const seatPercentage = (show.available_seats / show.total_seats) * 100;

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return null;
  };

  const embedUrl = show.trailer_url ? getYouTubeEmbedUrl(show.trailer_url) : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {embedUrl ? (
        <div className="relative aspect-video bg-gray-900">
          <iframe
            src={embedUrl}
            title={`${show.name} Trailer`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-center text-white">
            <PlayCircle className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p className="text-sm opacity-75">No trailer available</p>
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{show.name}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{date}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">{time}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {show.available_seats} / {show.total_seats} seats available
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                seatPercentage > 50
                  ? 'bg-green-500'
                  : seatPercentage > 20
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${seatPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {isAvailable ? (
            <>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
              <button
                onClick={() => navigate(`/booking/${show.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Book Now
              </button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Sold Out
              </span>
              <button
                disabled
                className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed text-sm font-medium"
              >
                Sold Out
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowCard;