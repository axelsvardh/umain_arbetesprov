import { useState, useEffect, useRef } from 'react';

const FilterComponent = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const priceRangeFetched = useRef(false); // Track if price ranges have been fetched

  // Fetch filters (price ranges) from the API
  const fetchFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/filter');
      if (!response.ok) {
        throw new Error('Failed to fetch filters');
      }
      const result = await response.json();
      if (Array.isArray(result)) {
        setFilters(result);
      } else if (result.filters && Array.isArray(result.filters)) {
        setFilters(result.filters);
      } else {
        setFilters([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch restaurants from the API
  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/restaurants');
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const result = await response.json();

      // Debug log to inspect the fetched restaurant data
      console.log('Fetched Restaurants:', result);

      // Ensure restaurants are in array format
      if (Array.isArray(result)) {
        setRestaurants(result);
      } else if (result.restaurants && Array.isArray(result.restaurants)) {
        setRestaurants(result.restaurants);
      } else {
        setRestaurants([]); // Set empty array if the data structure is not as expected
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch price range for each restaurant (after restaurants are loaded)
  useEffect(() => {
    if (restaurants.length === 0 || priceRangeFetched.current) return; // Do nothing if restaurants are empty or price ranges are already fetched

    const fetchPriceRange = async (priceRangeId) => {
      const priceRangeURL = `https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/price-range/${priceRangeId}`;
      try {
        const response = await fetch(priceRangeURL);
        if (!response.ok) {
          throw new Error(`Failed to fetch price range for ID: ${priceRangeId}`);
        }
        const data = await response.json();
        if (data && data.range) {
          return data.range;
        }
        return null; // Return null if range is not found
      } catch (error) {
        console.error('Error fetching price range:', error);
        return null;
      }
    };

    const fetchAllPriceRanges = async () => {
      // Ensure restaurants is an array before using map
      if (!Array.isArray(restaurants)) {
        console.error('Expected restaurants to be an array but got:', typeof restaurants);
        return;
      }

      const updatedRestaurants = await Promise.all(
        restaurants.map(async (restaurant) => {
          const priceRange = await fetchPriceRange(restaurant.price_range_id);
          return {
            ...restaurant,
            priceRange, // Add the fetched price range to the restaurant object
          };
        })
      );

      setRestaurants(updatedRestaurants); // Update restaurants with price ranges
      priceRangeFetched.current = true; // Mark that price ranges are fetched
    };

    fetchAllPriceRanges(); // Fetch price ranges after restaurants data is available
  }, [restaurants]); // Only run when restaurants data is fetched

  // Handle price range selection (button click)
  const handlePriceRangeChange = (priceRange) => {
    setSelectedPriceRange(priceRange);
  };

  // Filter restaurants based on selected price range
  const filteredRestaurants = selectedPriceRange
    ? restaurants.filter((restaurant) => restaurant.priceRange === selectedPriceRange)
    : restaurants;

  // Fetch data on component mount
  useEffect(() => {
    fetchFilters();
    fetchRestaurants();
  }, []); // Run once when the component mounts

  return (
    <div>
      {/* Loading state */}
      {loading && <p>Loading...</p>}

      {/* Error handling */}
      {error && <p>Error: {error}</p>}

      <h1>Price Range Filter</h1>
      <div>
        {/* Display the available price ranges as buttons */}
        {filters.length > 0 ? (
          filters.map((filter, index) => (
            <button
              key={index}
              onClick={() => handlePriceRangeChange(filter.name)}
              style={{
                backgroundColor: selectedPriceRange === filter.name ? 'lightblue' : 'white',
                margin: '5px',
                padding: '10px 20px',
                cursor: 'pointer',
              }}
            >
              {filter.name}
            </button>
          ))
        ) : (
          <p>No price ranges available</p>
        )}
      </div>


      <div>
        {/* Render filtered restaurants based on selected price range */}
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant, index) => (
            <button key={index}>
              {restaurant.priceRange || 'Not available'}
            </button>
          ))
        ) : (
          <p>No restaurants found in the selected price range</p>
        )}
      </div>
    </div>
  );
};

export default FilterComponent;
