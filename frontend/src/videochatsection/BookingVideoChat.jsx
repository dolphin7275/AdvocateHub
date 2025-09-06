// BookingVideoChat.jsx
import { memo } from 'react';
import VideoChat from './VideoChat';

const BookingVideoChat = ({ bookingId, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">
          ✕
        </button>

        {/* ✅ Add key to prevent re-mounting */}
        <VideoChat key={bookingId} bookingId={bookingId} />
      </div>
    </div>
  );
};

export default BookingVideoChat;