import React, { useState } from 'react';
import { Calendar, Users, DollarSign, Image, Youtube, Check, AlertCircle, Eye, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:4000/api';

type FormData = {
  name: string;
  startTime: string;
  totalSeats: string;
  ticketPrice: string;
  posterUrl: string;
  trailerUrl: string;
  description: string;
};

const AdminCreateShow: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startTime: '',
    totalSeats: '',
    ticketPrice: '',
    posterUrl: '',
    trailerUrl: '',
    description: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Extract YouTube video ID from URL
  const getYoutubeVideoId = (url?: string): string | null => {
    if (!url) return null;

    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-preview poster when URL is entered
    if (name === 'posterUrl' && value) {
      setImagePreview(value);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Show name is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const selectedDate = new Date(formData.startTime);
      if (selectedDate <= new Date()) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }

    const totalSeatsNum = parseInt(formData.totalSeats || '0', 10);
    if (!formData.totalSeats || isNaN(totalSeatsNum) || totalSeatsNum < 1) {
      newErrors.totalSeats = 'Total seats must be at least 1';
    }

    const ticketPriceNum = parseFloat(formData.ticketPrice || '0');
    if (!formData.ticketPrice || isNaN(ticketPriceNum) || ticketPriceNum < 0) {
      newErrors.ticketPrice = 'Ticket price is required and must be >= 0';
    }

    if (formData.posterUrl && !formData.posterUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) && !formData.posterUrl.includes('cloudinary') && !formData.posterUrl.includes('imgur')) {
      newErrors.posterUrl = 'Please enter a valid image URL';
    }

    if (formData.trailerUrl && !getYoutubeVideoId(formData.trailerUrl)) {
      newErrors.trailerUrl = 'Please enter a valid YouTube URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // REAL API CALL - NOT COMMENTED OUT!
      const response = await fetch(`${API_BASE_URL}/admin/show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          start_time: formData.startTime,
          total_seats: parseInt(formData.totalSeats),
          ticket_price: parseFloat(formData.ticketPrice),
          poster_url: formData.posterUrl || null,
          trailer_url: formData.trailerUrl || null,
          description: formData.description || null
        })
      });

      const data = await response.json();

      if (data.success) {
        // Show success
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          // Reset form
          setFormData({
            name: '',
            startTime: '',
            totalSeats: '',
            ticketPrice: '',
            posterUrl: '',
            trailerUrl: '',
            description: ''
          });
          setImagePreview('');
        }, 3000);
      } else {
        // Show error
        setErrors({ api: data.error || 'Failed to create show' });
      }
    } catch (error) {
      console.error('Error creating show:', error);
      setErrors({ api: 'Network error. Make sure backend is running on port 4000.' });
    } finally {
      setLoading(false);
    }
  };

  const openTrailerInNewTab = () => {
    const videoId = getYoutubeVideoId(formData.trailerUrl);
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New Show</h1>
          <p className="text-gray-600">Add a new movie/event with all details</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Show Details</h2>

              <div className="space-y-5">
                {/* Show Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show Name / Title *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Avengers: Endgame"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the show..."
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" /> Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.startTime}
                    </p>
                  )}
                </div>

                {/* Total Seats & Ticket Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" /> Total Seats *
                    </label>
                    <input
                      type="number"
                      name="totalSeats"
                      value={formData.totalSeats}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.totalSeats ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="50"
                    />
                    {errors.totalSeats && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.totalSeats}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" /> Ticket Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="ticketPrice"
                      value={formData.ticketPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.ticketPrice ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="500"
                    />
                    {errors.ticketPrice && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.ticketPrice}
                      </p>
                    )}
                  </div>
                </div>

                {/* Poster URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" /> Poster Image URL
                  </label>
                  <input
                    type="url"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.posterUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/poster.jpg"
                  />
                  {errors.posterUrl && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.posterUrl}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Tip: Upload to Imgur/Cloudinary and paste the URL
                  </p>
                </div>

                {/* Trailer URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Youtube className="w-4 h-4 inline mr-1" /> YouTube Trailer URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="trailerUrl"
                      value={formData.trailerUrl}
                      onChange={handleInputChange}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.trailerUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    {formData.trailerUrl && getYoutubeVideoId(formData.trailerUrl) && (
                      <button
                        type="button"
                        onClick={openTrailerInNewTab}
                        className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 whitespace-nowrap"
                      >
                        <Youtube className="w-5 h-5" /> Open
                      </button>
                    )}
                  </div>
                  {errors.trailerUrl && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.trailerUrl}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Paste YouTube link - it will open in a new tab
                  </p>
                </div>
              </div>
            </div>

            {/* API Error Message */}
            {errors.api && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error Creating Show</p>
                  <p className="text-sm text-red-700 mt-1">{errors.api}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Show Created Successfully!</p>
                  <p className="text-sm text-green-700 mt-1">Your show has been added to the system.</p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2"
                disabled={loading}
              >
                <Eye className="w-5 h-5" /> {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Create Show
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Section - Rest of the code stays the same */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Live Preview</h3>

              {/* Poster Preview */}
              {imagePreview ? (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Poster preview"
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ) : (
                <div className="mb-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Image className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">No poster added</p>
                  </div>
                </div>
              )}

              {/* Show Info */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-xl text-gray-900">
                    {formData.name || 'Show Title'}
                  </h4>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{formData.description}</p>
                  )}
                </div>

                {formData.startTime && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(formData.startTime).toLocaleString()}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.totalSeats && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{formData.totalSeats} seats</span>
                    </div>
                  )}
                  {formData.ticketPrice && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>₹{formData.ticketPrice}</span>
                    </div>
                  )}
                </div>

                {/* Trailer Embed */}
                {formData.trailerUrl && getYoutubeVideoId(formData.trailerUrl) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Trailer Preview:</p>
                    <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(formData.trailerUrl)}`}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Trailer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Full Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Full Preview</h3>
                  <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {imagePreview && (
                  <img src={imagePreview} alt="Poster" className="w-full h-96 object-cover rounded-lg mb-4" />
                )}

                <h2 className="text-3xl font-bold mb-2">{formData.name || 'Show Title'}</h2>
                {formData.description && <p className="text-gray-600 mb-4">{formData.description}</p>}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {formData.startTime && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span>{new Date(formData.startTime).toLocaleString()}</span>
                    </div>
                  )}
                  {formData.totalSeats && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <span>{formData.totalSeats} seats</span>
                    </div>
                  )}
                </div>

                {formData.ticketPrice && <div className="text-2xl font-bold text-blue-600 mb-4">₹{formData.ticketPrice} per ticket</div>}

                {formData.trailerUrl && getYoutubeVideoId(formData.trailerUrl) && (
                  <div>
                    <h4 className="font-semibold mb-2">Trailer:</h4>
                    <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(formData.trailerUrl)}`}
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Trailer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCreateShow;