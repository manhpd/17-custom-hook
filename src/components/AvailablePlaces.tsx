import { useState, useEffect } from 'react';

import Places, { Place } from './Places.jsx';
import Error from './Error.jsx';
import { sortPlacesByDistance } from '../loc.js';
import { fetchAvailablePlaces } from '../http.js';
import React from 'react';
import useFetch from '../hooks/useFetch.js';

export default function AvailablePlaces({ onSelectPlace } : { onSelectPlace: (place: any) => void }) {

  const { data: availablePlaces, isFetching, error } = useFetch<Place[]>(fetchAvailablePlaces);

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
