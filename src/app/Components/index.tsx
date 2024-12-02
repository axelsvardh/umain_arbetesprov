"use client"; // This directive makes the file a client component

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import styles from "../page.module.css";
import FilterComponent from "./filters";

export default function Home() {
    const [restaurants, setRestaurants] = useState([]); // Initial state for restaurants
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const priceRangeFetched = useRef(false); // Ref to track if price ranges have already been fetched

    const baseURL = "https://work-test-web-2024-eze6j4scpq-lz.a.run.app";
    const endpoint = "/api/restaurants"; // API endpoint for fetching restaurants

    // Fetch restaurant data from API
    useEffect(() => {
        const fetchRestaurants = async () => {
            const fullURL = `${baseURL}${endpoint}`;

            try {
                const response = await fetch(fullURL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched Data:", data); // Log the fetched data to inspect its structure

                // Check if data is in expected format
                if (Array.isArray(data)) {
                    setRestaurants(data); // If it's an array, set it in the state
                } else if (data && data.restaurants && Array.isArray(data.restaurants)) {
                    setRestaurants(data.restaurants); // If the array is nested under 'restaurants'
                } else {
                    setError("Unexpected response format"); // Handle unexpected format
                }
            } catch (error) {
                setError(error.message); // Set the error message in case of failure
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchRestaurants(); // Call the fetch function
    }, []); // This effect only runs once when the component mounts

    // Fetch price range for each restaurant after the restaurants data is available
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
                console.log("Fetched Price Range Data:", data); // Log the full response for debugging

                // Now access 'range' instead of 'price_range'
                if (data && data.range) {
                    console.log("Price Range:", data.range); // Log the correct price range
                    return data.range; // Return the price range (range field)
                } else {
                    console.error("Price Range not found in response");
                    return null; // Return null if range is not found
                }
            } catch (error) {
                console.error("Error fetching price range:", error);
                return null; // Return null if there's an error
            }
        };

        const fetchAllPriceRanges = async () => {
            // Update the state with the fetched price ranges
            const updatedRestaurants = await Promise.all(
                restaurants.map(async (restaurant) => {
                    // Log the price_range_id for each restaurant
                    console.log("Price Range ID for", restaurant.name, ":", restaurant.price_range_id);

                    // Fetch price range for each restaurant using its price_range_id
                    const priceRange = await fetchPriceRange(restaurant.price_range_id);

                    // Log the fetched price range
                    console.log("Fetched Price Range for", restaurant.name, ":", priceRange);

                    return {
                        ...restaurant,
                        priceRange, // Add the fetched price range to the restaurant object
                    };
                })
            );

            // Update restaurants with price ranges
            setRestaurants((prevRestaurants) => {
                return prevRestaurants.map((restaurant, index) => ({
                    ...restaurant,
                    priceRange: updatedRestaurants[index]?.priceRange, // Merge the priceRange with the original restaurant
                }));
            });

            // Set ref to true so that price ranges are not fetched again
            priceRangeFetched.current = true;
        };

        fetchAllPriceRanges(); // Fetch price ranges after restaurants data is available
    }, [restaurants]); // Only run when restaurants data is fetched

    // If loading, show a loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    // If there was an error, show the error message
    if (error) {
        return <div>Error: {error}</div>;
    }

    // Render the restaurants with their price range and open status
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <h1>Restaurants</h1>

                <FilterComponent />

                {/* Render the list of restaurants */}
                {restaurants.length > 0 ? (
                    <div>
                        {restaurants.map((restaurant) => (
                            <div key={restaurant.id} className={styles.card}>
                                <h2>{restaurant.name}</h2>

                                {/* Render image if restaurant has an imageUrl */}
                                {restaurant.imageUrl && (
                                    <Image
                                        src={restaurant.imageUrl} // Use correct property for image URL
                                        alt={restaurant.name}
                                        width={500}
                                        height={500}
                                    />
                                )}

                                {/* Render the open status (true/false) */}
                                <OpenStatus restaurantId={restaurant.id} />

                                {/* Render the price range */}
                                <p>Price Range: {restaurant.priceRange || "Not available"}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No restaurants found.</p>
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
