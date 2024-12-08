"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import FrontPage from "../frontpage/page";
import FilterComponent from "./Filters";
import PriceRange from "./PriceRange";
import DeliveryTime from "./DeliveryTime";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedFilterIds, setSelectedFilterIds] = useState([]);
  const [selectedPriceIds, setSelectedPriceIds] = useState([]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryTimeCategories, setDeliveryTimeCategories] = useState([]);
  const [openStatuses, setOpenStatuses] = useState({});

  const router = useRouter();

  // Handle mobile detection and session storage for redirection
  const handleMobileRedirect = useCallback(() => {
    const userAgent = navigator.userAgent || "";
    const mobileRegex = /iPhone|iPad|iPod|Android/i;
    const mobile = mobileRegex.test(userAgent);
    setIsMobile(mobile);

    const hasVisitedFrontPage = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("hasVisitedFrontPage") : null;

    if (mobile && !hasVisitedFrontPage) {
      sessionStorage.setItem("hasVisitedFrontPage", "true");
      router.push("/frontpage");
    } else if (!mobile) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    handleMobileRedirect();
  }, [handleMobileRedirect]);

  // Fetch restaurants and open statuses
  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await fetch("https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/restaurants");
      if (!response.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      const data = await response.json();
      const restaurantsArray = Array.isArray(data) ? data : data.restaurants || [];

      setRestaurants(restaurantsArray);
      setFilteredRestaurants(restaurantsArray); // Initialize filtered list

      // Fetch open statuses
      const statuses = await Promise.all(
        restaurantsArray.map(async (restaurant) => {
          const res = await fetch(`https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/open/${restaurant.id}`);
          const data = await res.json();
          return { [restaurant.id]: data.is_open };
        })
      );
      setOpenStatuses(Object.assign({}, ...statuses));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Filter function that applies filters based on user selection
  const handleFilterChange = useCallback(() => {
    const filtered = restaurants.filter((restaurant) => {
      const filterIdsInRestaurant = restaurant.filter_ids || [];
      const priceRangeIdInRestaurant = restaurant.price_range_id || null;
      const deliveryTime = restaurant.delivery_time_minutes || null;

      // Filter Match
      const filterMatch = selectedFilterIds.length === 0 || selectedFilterIds.some((filterId) => filterIdsInRestaurant.includes(filterId));

      // Price Match
      const priceMatch = selectedPriceIds.length === 0 || selectedPriceIds.includes(priceRangeIdInRestaurant);

      // Delivery Time Match
      const deliveryMatch =
        !selectedDeliveryTime ||
        selectedDeliveryTime.length === 0 ||
        selectedDeliveryTime.some((category) => {
          const categoryData = deliveryTimeCategories.find((cat) => cat.label === category);
          return categoryData && deliveryTime >= categoryData.range[0] && deliveryTime < categoryData.range[1];
        });

      return filterMatch && priceMatch && deliveryMatch;
    });

    setFilteredRestaurants(filtered);
  }, [restaurants, selectedFilterIds, selectedPriceIds, selectedDeliveryTime, deliveryTimeCategories]);

  const handleFilterChangeFromComponent = (newSelectedFilterIds) => {
    setSelectedFilterIds(newSelectedFilterIds);
  };

  const handlePriceChange = (newSelectedPriceIds) => {
    setSelectedPriceIds(newSelectedPriceIds);
  };

  const handleDeliveryTimeChange = (newSelectedDeliveryTimes) => {
    setSelectedDeliveryTime(newSelectedDeliveryTimes);
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedFilterIds, selectedPriceIds, selectedDeliveryTime, deliveryTimeCategories, handleFilterChange]);

  if (loading) {
    return <div>Loading restaurants...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <img src="./images/logo.png" alt="Munchies Logo" className={styles.logo} />
      <div className={styles.gridContainer}>
        <div className={styles.filterContainer}>
          <h1 className={styles.filterWrapper}>Filter</h1>
          <FilterComponent onFilterChange={handleFilterChangeFromComponent} />
          <DeliveryTime restaurants={restaurants} onDeliveryTimeChange={handleDeliveryTimeChange} onDeliveryTimeCategories={setDeliveryTimeCategories} />
          <PriceRange onPriceChange={handlePriceChange} />
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.topbarFilter}>
            <FilterComponent onFilterChange={handleFilterChangeFromComponent} />
          </div>
          <h1 className={`${styles.display} ${styles.heading}`}>Restaurant´s</h1>
          <div className={styles.cardContainer}>
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants
                .slice()
                .sort((a, b) => {
                  const aIsOpen = openStatuses[a.id] ?? false;
                  const bIsOpen = openStatuses[b.id] ?? false;
                  return bIsOpen - aIsOpen;
                })
                .map((restaurant) => (
                  <div key={restaurant.id} className={`${styles.card} ${openStatuses[restaurant.id] ? styles.openRestaurant : styles.closedRestaurant}`}>
                    <div className={styles.detailsContainer}>
                      <OpenStatus restaurantId={restaurant.id} isOpen={openStatuses[restaurant.id]} />
                      {openStatuses[restaurant.id] && <p className={styles.deliveryTime}>{restaurant.delivery_time_minutes} min</p>}
                    </div>
                    <img src={restaurant.image_url} alt={restaurant.name} className={styles.foodImage} />
                    <div className={styles.nameButtonWrapper}>
                      <h1>{restaurant.name}</h1>
                      <div className={styles.restaurantButton}>
                        <img src="./images/arrow-right.png" alt="Arrow Icon" />
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

function OpenStatus({ restaurantId, isOpen }) {
  return <p className={isOpen ? styles.open : styles.closed}>{isOpen ? "Open" : "Closed"}</p>;
}
