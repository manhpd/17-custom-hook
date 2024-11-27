import { useRef, useState, useCallback, useEffect } from 'react';

import Places, { Place } from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { fetchUserPlaces, updateUserPlaces } from './http.js';
import Error from './components/Error.jsx';
import useFetch from './hooks/useFetch.js';

function App() {
  const selectedPlace = useRef<Place | null>(null);

  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState<undefined | { message: string }>(undefined);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { data: userPlaces, isFetching, error, setData: setUserPlaces } = useFetch<Place[]>(fetchUserPlaces, []);

  function handleStartRemovePlace(place: Place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace: Place) {
    await updateUserPlaces([selectedPlace, ...(userPlaces || [])]);

    setUserPlaces((prevPickedPlaces: Place[]) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place: { id: string; }) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces([selectedPlace, ...(userPlaces || [])]);
    } catch (error) {
      setUserPlaces(userPlaces || []);
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => selectedPlace.current && place.id !== selectedPlace.current.id
        )
      );

      if (userPlaces && !userPlaces.length) {

        try {
          await updateUserPlaces(
            userPlaces.filter((place) => selectedPlace.current && place.id !== selectedPlace.current.id)
          );
        } catch (error) {
          setUserPlaces(userPlaces || []);
        }
      }

      setModalIsOpen(false);
    },
    [userPlaces, setUserPlaces]
  );

  function handleError() {
    setErrorUpdatingPlaces(undefined);
  }

  return (
    <>
      <Modal open={!!errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && (
          <Error
            title="An error occurred!"
            message={errorUpdatingPlaces.message}
            onConfirm={handleError}
          />
        )}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occurred!" message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            isLoading={isFetching}
            loadingText="Fetching your places..."
            places={userPlaces || []}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
