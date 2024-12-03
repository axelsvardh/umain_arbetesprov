"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import FilterComponent from "./filters";
import PriceRange from "./PriceRange";

export default function Home() {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [selectedFilterIds, setSelectedFilterIds] = useState([]); // New state for selected filter IDs
    const [selectedPriceIds, setSelectedPriceIds] = useState([]);   // New state for selected price IDs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch restaurants data
    const fetchRestaurants = async () => {
        try {
            const response = await fetch(
                "https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/restaurants"
            );
            if (!response.ok) {
                throw new Error("Failed to fetch restaurants");
            }
            const data = await response.json();
            const restaurantsArray = Array.isArray(data)
                ? data
                : data.restaurants || [];

            setRestaurants(restaurantsArray);
            setFilteredRestaurants(restaurantsArray); // Initialize filtered list
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter and price change
    const handleFilterChange = async (selectedFilterIds = [], selectedPriceIds = []) => {
        try {
            console.log("Selected Filter IDs:", selectedFilterIds);
            console.log("Selected Price IDs:", selectedPriceIds);

            const filtered = restaurants.filter((restaurant) => {
                const filterIdsInRestaurant = restaurant.filter_ids || [];
                const priceRangeIdInRestaurant = restaurant.price_range_id || null;

                // Filter Match: True if either no category filters are applied or a match is found
                const filterMatch =
                    selectedFilterIds.length === 0 ||
                    selectedFilterIds.some((filterId) => filterIdsInRestaurant.includes(filterId));

                // Price Match: True if there's a price filter match (always required if prices are selected)
                const priceMatch =
                    selectedPriceIds.length === 0 || // Allow all if no prices selected
                    selectedPriceIds.includes(priceRangeIdInRestaurant);

                console.log("Checking price match:", selectedPriceIds, priceRangeIdInRestaurant);
                console.log("Checking filter match:", selectedFilterIds, filterIdsInRestaurant);
                console.log("Filter Match:", filterMatch);
                console.log("Price Match:", priceMatch);

                // Final condition: Both price and filter must match their respective criteria
                return filterMatch && priceMatch;
            });

            console.log("Filtered Restaurants:", filtered);

            setFilteredRestaurants(filtered);
        } catch (error) {
            console.error("Error in filter change:", error);
        }
    };

    const handleFilterChangeFromComponent = (newSelectedFilterIds) => {
        console.log("Updated Selected Filter IDs:", newSelectedFilterIds);
        setSelectedFilterIds(newSelectedFilterIds); // Update the selected filter IDs state
        handleFilterChange(newSelectedFilterIds, selectedPriceIds); // Pass updated filters and current prices
    };

    const handlePriceChange = (newSelectedPriceIds) => {
        console.log("Updated Selected Price IDs:", newSelectedPriceIds);
        setSelectedPriceIds(newSelectedPriceIds); // Update the selected price IDs state
        handleFilterChange(selectedFilterIds, newSelectedPriceIds); // Pass current filters and updated prices
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    if (loading) {
        return <div>Loading restaurants...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Restaurants</h1>

                <FilterComponent onFilterChange={handleFilterChangeFromComponent} />
                <PriceRange onPriceChange={handlePriceChange} />

                {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map((restaurant) => (
                        <div key={restaurant.id}>
                            <h3>{restaurant.name}</h3>
                            <p>
                                Filter IDs: {Array.isArray(restaurant.filter_ids)
                                    ? restaurant.filter_ids.join(", ")
                                    : "N/A"}
                            </p>
                            <p>
                                Price IDs: {Array.isArray(restaurant.price_range_id) && restaurant.price_range_id.length > 0
                                    ? restaurant.price_range_id.join(", ")
                                    : "N/A"}
                            </p>
                            <OpenStatus restaurantId={restaurant.id} />
                            <p>Time: {restaurant.delivery_time_minutes}</p>
                        </div>
                    ))
                ) : (
                    <p>No restaurants match the selected filter.</p>
                )}
            </main>
        </div>
    );
}

// Component to display the open status (true/false)
function OpenStatus({ restaurantId }) {
    const [isOpen, setIsOpen] = useState(null);

    useEffect(() => {
        const fetchOpenStatus = async (id) => {
            const openStatusURL = `https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/open/${id}`;
            try {
                const response = await fetch(openStatusURL);
                if (!response.ok) {
                    throw new Error(`Failed to fetch open status for restaurant ID: ${id}`);
                }
                const data = await response.json();
                return data.is_open; // Assuming the API returns an 'isOpen' field that is a boolean (true/false)
            } catch (error) {
                console.error("Error fetching open status:", error);
                return null; // Return null if there's an error
            }
        };

        const getOpenStatus = async () => {
            const status = await fetchOpenStatus(restaurantId);
            setIsOpen(status); // Set the open status (true/false)
        };

        getOpenStatus(); // Call to get the open status
    }, [restaurantId]); // Dependency array ensures this runs when the restaurantId changes

    if (isOpen === null) {
        return <p>Loading open status...</p>;
    }

    return <p>{isOpen ? "Open" : "Closed"}</p>; // Render true/false directly
}
