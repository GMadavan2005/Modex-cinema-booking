import React, { useState } from 'react';
import { Calendar, Users, Video } from 'lucide-react';

interface CreateShowFormProps {
  onShowCreated: () => void;
}

const CreateShowForm: React.FC<CreateShowFormProps> = ({ onShowCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    total_seats: '',
    trailer_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiUrl}/admin/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          start_time: new Date(formData.start_time).toISOString(),
          total_seats: parseInt(formData.total_seats),
          trailer_url: formData.trailer_url || null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create show');
      }

      setFormData({
        name: '',
        start_time: '',
        total_seats: '',
        trailer_url: '',
      });

      onShowCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Show</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Show Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter show/movie name"
          />
        </div>

        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline w-4 h-4 mr-1" />
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            id="start_time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="total_seats" className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="inline w-4 h-4 mr-1" />
            Total Seats *
          </label>
          <input
            type="number"
            id="total_seats"
            name="total_seats"
            value={formData.total_seats}
            onChange={handleChange}
            required
            min="1"
            max="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 50"
          />
        </div>

        <div>
          <label htmlFor="trailer_url" className="block text-sm font-medium text-gray-700 mb-1">
            <Video className="inline w-4 h-4 mr-1" />
            YouTube Trailer URL (Optional)
          </label>
          <input
            type="url"
            id="trailer_url"
            name="trailer_url"
            value={formData.trailer_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste a YouTube video link to show a trailer
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Show...' : 'Create Show'}
        </button>
      </div>
    </div>
  );
};

export default CreateShowForm;