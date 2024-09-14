import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Data dummy untuk checkpoint
const dummyCheckpoints = [
  {
    _id: "1",
    name: "Kopi Tuku",
    reviews: [
      {
        user: "Alice",
        review: "Great place for a walk! Enjoyed the greenery.",
        date: "2024-09-01",
      },
      {
        user: "Bob",
        review: "Perfect spot for a picnic. Loved it!",
        date: "2024-09-02",
      },
    ],
    location: { coordinates: [-6.26244, 106.81069] },
  },
  {
    _id: "2",
    name: "Lippo Mall Kemang",
    reviews: [
      {
        user: "Charlie",
        review: "Iconic landmark with a rich history. A must-see!",
        date: "2024-09-03",
      },
      {
        user: "Diana",
        review: "Amazing view from the top. Highly recommend the tour.",
        date: "2024-09-04",
      },
    ],
    location: { coordinates: [-6.26038, 106.81279] },
  },
  {
    _id: "3",
    name: "Times Square",
    reviews: [
      {
        user: "Eve",
        review: "Bright lights and busy streets. Very lively!",
        date: "2024-09-05",
      },
      {
        user: "Frank",
        review: "Crowded but fun. Great for people-watching.",
        date: "2024-09-06",
      },
    ],
    location: { coordinates: [40.758, -73.9855] },
  },
];

const PhotoMap = () => {
  const [location, setLocation] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [isAddingCheckpoint, setIsAddingCheckpoint] = useState(false);
  const [newCheckpointName, setNewCheckpointName] = useState("");
  const [newCheckpointReview, setNewCheckpointReview] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showConfirmAddPopup, setShowConfirmAddPopup] = useState(false);
  const [showAddReviewPopup, setShowAddReviewPopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [duplicateCheckpoint, setDuplicateCheckpoint] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setLocation(userLocation);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        // Menggunakan data dummy jika backend belum tersedia
        setCheckpoints(dummyCheckpoints);
      } catch (error) {
        console.error("Error fetching checkpoints:", error);
      }
    };
    fetchCheckpoints();
  }, []);

  const checkIfDuplicate = (lat, lon) => {
    return checkpoints.find((checkpoint) => {
      const distance = L.latLng([lat, lon]).distanceTo(
        L.latLng(checkpoint.location.coordinates)
      );
      return distance < 500;
    });
  };

  const handleAddCheckpoint = () => {
    if (selectedLocation) {
      const [lat, lon] = selectedLocation;
      const duplicate = checkIfDuplicate(lat, lon);

      if (duplicate) {
        setDuplicateCheckpoint(duplicate);
        setShowConfirmAddPopup(true);
      } else {
        addCheckpoint();
      }
    }
  };

  const addCheckpoint = () => {
    if (location && selectedLocation) {
      const [lat, lon] = selectedLocation;
      const newCheckpoint = {
        name: newCheckpointName,
        reviews: [
          {
            user: "CurrentUser",
            review: newCheckpointReview,
            date: new Date().toISOString().split("T")[0],
          },
        ],
        location: { coordinates: [lat, lon] },
      };

      setCheckpoints([
        ...checkpoints,
        { ...newCheckpoint, _id: String(Date.now()) },
      ]);
      setShowInfoPopup(true); // Menampilkan popup info setelah menambah checkpoint

      setNewCheckpointName("");
      setNewCheckpointReview("");
      setSelectedLocation(null);
      setIsAddingCheckpoint(false);
    }
  };

  const confirmAddCheckpoint = () => {
    if (duplicateCheckpoint) {
      setCheckpoints(
        checkpoints.map((checkpoint) => {
          const distance = L.latLng(selectedLocation).distanceTo(
            L.latLng(checkpoint.location.coordinates)
          );
          if (distance < 500 && checkpoint._id === duplicateCheckpoint._id) {
            return {
              ...checkpoint,
              reviews: [
                ...checkpoint.reviews,
                {
                  user: "CurrentUser",
                  review: newCheckpointReview,
                  date: new Date().toISOString().split("T")[0],
                },
              ],
            };
          }
          return checkpoint;
        })
      );
      setShowConfirmAddPopup(false);
      setShowAddReviewPopup(true); // Menampilkan popup review setelah menambahkan review
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (isAddingCheckpoint) {
          setSelectedLocation([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  if (!location) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={location}
        zoom={zoomLevel}
        style={{ height: "100vh", width: "100%" }}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <Marker position={location}>
          <Popup>You are here!</Popup>
        </Marker>
        {checkpoints.map((checkpoint) => (
          <Marker
            key={checkpoint._id}
            position={checkpoint.location.coordinates}
          >
            <Popup>
              <b>{checkpoint.name}</b>
              <div className="mt-2">
                {checkpoint.reviews.map((review, index) => (
                  <div key={index} className="mb-2">
                    <p>
                      <strong>{review.user}:</strong> {review.review}
                    </p>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
        <MapEvents />
      </MapContainer>

      {isAddingCheckpoint && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 shadow-lg rounded-md z-50">
          <h3 className="text-lg font-semibold mb-2">Add Checkpoint</h3>
          <input
            type="text"
            placeholder="Checkpoint Name"
            value={newCheckpointName}
            onChange={(e) => setNewCheckpointName(e.target.value)}
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <textarea
            placeholder="Review"
            value={newCheckpointReview}
            onChange={(e) => setNewCheckpointReview(e.target.value)}
            className="mb-2 p-2 border border-gray-300 rounded w-full"
          />
          <button
            onClick={handleAddCheckpoint}
            className="bg-teal-500 text-white px-4 py-2 rounded"
          >
            Add Checkpoint
          </button>
          <button
            onClick={() => {
              setIsAddingCheckpoint(false);
              setSelectedLocation(null);
            }}
            className="ml-2 px-4 py-2 rounded border border-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {showConfirmAddPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-semibold mb-2">
              Checkpoint Already Exists
            </h3>
            <p>
              A checkpoint already exists within 500 meters. Is this the same
              location or a different one?
            </p>
            <div className="mt-4">
              <button
                onClick={() => {
                  setShowConfirmAddPopup(false);
                  setShowAddReviewPopup(true);
                }}
                className="bg-teal-500 text-white px-4 py-2 rounded"
              >
                Same Location
              </button>
              <button
                onClick={() => {
                  setShowConfirmAddPopup(false);
                  addCheckpoint();
                }}
                className="ml-2 px-4 py-2 rounded border border-gray-300"
              >
                Different Location
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddReviewPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-semibold mb-2">Add Review</h3>
            <textarea
              placeholder="Review"
              value={newCheckpointReview}
              onChange={(e) => setNewCheckpointReview(e.target.value)}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <button
              onClick={confirmAddCheckpoint}
              className="bg-teal-500 text-white px-4 py-2 rounded"
            >
              Submit Review
            </button>
            <button
              onClick={() => {
                setShowAddReviewPopup(false);
                setNewCheckpointReview("");
              }}
              className="ml-2 px-4 py-2 rounded border border-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showInfoPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-semibold mb-2">Checkpoint Added</h3>
            <p>The checkpoint has been added successfully!</p>
            <button
              onClick={() => setShowInfoPopup(false)}
              className="bg-teal-500 text-white px-4 py-2 rounded mt-4"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsAddingCheckpoint(true)}
        className="fixed bottom-4 right-4 bg-teal-500 text-white px-4 py-2 rounded-full z-50"
      >
        Add Checkpoint
      </button>
    </div>
  );
};

export default PhotoMap;
