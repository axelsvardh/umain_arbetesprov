"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "../page.module.css";
import FrontPage from "./FrontPage";
import FilterComponent from "./filters";
import PriceRange from "./PriceRange";
import DeliveryTime from "./DeliveryTime";

export default function Home() {
    const [isMobile, setIsMobile] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [selectedFilterIds, setSelectedFilterIds] = useState([]); // New state for selected filter IDs
    const [selectedPriceIds, setSelectedPriceIds] = useState([]);   // New state for selected price IDs
    const [selectedDeliveryTime, setSelectedDeliveryTime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deliveryTimeCategories, setDeliveryTimeCategories] = useState([]);

    useEffect(() => {
        const userAgent = navigator.userAgent || "";
        const mobileRegex = /iPhone|iPad|iPod|Android/i;
        setIsMobile(mobileRegex.test(userAgent));
    }, []);

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

    // Handle filter, price and delivery time change
    const handleFilterChange = async (selectedFilterIds = [], selectedPriceIds = [], selectedDeliveryTimes = []) => {
        try {
            console.log("Selected Filter IDs:", selectedFilterIds);
            console.log("Selected Price IDs:", selectedPriceIds);
            console.log("Selected Delivery Times:", selectedDeliveryTimes);

            const filtered = restaurants.filter((restaurant) => {
                const filterIdsInRestaurant = restaurant.filter_ids || [];
                const priceRangeIdInRestaurant = restaurant.price_range_id || null;
                const deliveryTime = restaurant.delivery_time_minutes || null;

                // Filter Match: True if no category filters applied or there's a match
                const filterMatch =
                    selectedFilterIds.length === 0 ||
                    selectedFilterIds.some((filterId) => filterIdsInRestaurant.includes(filterId));

                // Price Match: True if no price filters applied or there's a match
                const priceMatch =
                    selectedPriceIds.length === 0 ||
                    selectedPriceIds.includes(priceRangeIdInRestaurant);

                // Delivery Time Match: True if no delivery time selected or restaurant matches one of the selected categories
                const deliveryMatch =
                    !selectedDeliveryTimes ||
                    selectedDeliveryTimes.length === 0 ||
                    selectedDeliveryTimes.some((category) => {
                        const categoryData = deliveryTimeCategories.find((cat) => cat.label === category);
                        if (categoryData) {
                            return deliveryTime >= categoryData.range[0] && deliveryTime < categoryData.range[1];
                        }
                        return false;
                    });

            console.log("Filter Match:", filterMatch);
            console.log("Price Match:", priceMatch);
            console.log("Delivery Match:", deliveryMatch);

            // Final condition: Must match all criteria
            return filterMatch && priceMatch && deliveryMatch;
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
    handleFilterChange(newSelectedFilterIds, selectedPriceIds, selectedDeliveryTime); // Pass updated filters and current price IDs
};

const handlePriceChange = (newSelectedPriceIds) => {
    console.log("Updated Selected Price IDs:", newSelectedPriceIds);
    setSelectedPriceIds(newSelectedPriceIds); // Update the selected price IDs state
    handleFilterChange(selectedFilterIds, newSelectedPriceIds, selectedDeliveryTime); // Pass current filters and updated prices
};

const handleDeliveryTimeChange = (newSelectedDeliveryTimes) => {
    console.log("Selected Delivery Time:", newSelectedDeliveryTimes);
    setSelectedDeliveryTime(newSelectedDeliveryTimes); // Update state
    handleFilterChange(selectedFilterIds, selectedPriceIds, newSelectedDeliveryTimes); // Include delivery time in filtering
};


    useEffect(() => {
        fetchRestaurants();
    }, []);

    if (isMobile) {
        // Render mobile front page if on a mobile device
        return <FrontPage />;
    }

    if (loading) {
        return <div>Loading restaurants...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        // <div style={{backgroundColor:"green"}}>
        <div>
            <img src="./images/logo.png" alt="Munchies Logo" className={styles.logo}/>
            <div className={styles.contentContainer}>
                <div className={styles.filterContainer}>
                    <h1 className={styles.filterWrapper}>Filter</h1>
                    <FilterComponent onFilterChange={handleFilterChangeFromComponent} />
                    <DeliveryTime restaurants={restaurants} onDeliveryTimeChange={handleDeliveryTimeChange} onDeliveryTimeCategories={setDeliveryTimeCategories} />
                    <PriceRange onPriceChange={handlePriceChange} />
                </div>
                <div>
                <div className={styles.topbarFilter}>
                    <FilterComponent onFilterChange={handleFilterChangeFromComponent} />
                </div>
                <h1 className={`${styles.display} ${styles.heading}`}>Restaurant´s</h1>
                    <div className={styles.cardContainer}>
                        {filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map((restaurant) => (
                                <div key={restaurant.id} className={styles.card}>
                                    {/* <p>
                                        Filter IDs: {Array.isArray(restaurant.filter_ids)
                                        ? restaurant.filter_ids.join(", ")
                                        : "N/A"}
                                        </p> */}
                                    {/* <p>
                                        Price IDs: {Array.isArray(restaurant.price_range_id) && restaurant.price_range_id.length > 0
                                        ? restaurant.price_range_id.join(", ")
                                        : "N/A"}
                                        </p> */}
                                    <div className={styles.detailsContainer}>
                                        <OpenStatus restaurantId={restaurant.id} />
                                        <p className={styles.deliveryTime}>{restaurant.delivery_time_minutes} min</p>
                                    </div>
                                    <img src={restaurant.image_url} alt={restaurant.name} className={styles.foodImage}/>

                                    <div className={styles.nameButtonWrapper}>
                                        <h1>{restaurant.name}</h1>
                                        <div className={styles.restuarantButton}>
                                            <img src="./images/arrow-right.png" alt="Arrow Icon"/>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No restaurants match the selected filter.</p>
                        )}
                    </div>
                </div>
            </div>
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

    return <p className={styles.open}>{isOpen ? "Open" : "Closed"}</p>; // Render true/false directly
}
