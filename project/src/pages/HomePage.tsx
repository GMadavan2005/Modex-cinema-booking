import { useEffect } from 'react';
import { useShows } from '../contexts/ShowContext';
import ShowCard from '../components/common/ShowCard';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { shows, loading, error, fetchShows } = useShows();

  useEffect(() => {
    fetchShows();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (shows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No shows available at the moment.</p>
        <p className="text-gray-500 mt-2">Check back later for new events!</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Shows</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
}
