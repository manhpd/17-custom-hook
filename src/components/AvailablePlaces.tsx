import Places, { Place } from './Places.jsx';
import Error from './Error.jsx';
import { fetchAvailablePlaces } from '../http.js';
import useFetch from '../hooks/useFetch.js';
import { sortPlacesByDistance } from '../loc.js';
// Removed unused import

export default function AvailablePlaces({ onSelectPlace } : { onSelectPlace: (place: any) => void }) {

  async function fetchSortedPlaces() {
    const places = await fetchAvailablePlaces();
    
    return new Promise<Place[]>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.longitude
          );
          resolve(sortedPlaces);
        },
        (error) => {
          reject(error);
        }
      );
    });

  }

  const { data: availablePlaces, isFetching, error } = useFetch<Place[]>(fetchSortedPlaces, []);

  if (error) {
    return <Error title="An error occurred!" message={error.message} onConfirm={undefined} />;
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces || []}
      isLoading={isFetching}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
