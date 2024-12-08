import { useState, useEffect } from "react";
import styles from "../page.module.css";

const PriceRange = ({ onPriceChange }) => {
    const [prices, setPrices] = useState([]);
    const [selectedPriceIds, setSelectedPriceIds] = useState([]); // Track selected price IDs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch prices from the API
    const fetchPrice = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                "https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/price-range"
            );
            if (!response.ok) {
                throw new Error("Failed to fetch prices");
            }
            const result = await response.json();
            setPrices(Array.isArray(result) ? result : result.prices || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle price selection (toggle the price in/out)
    const handlePriceSelect = (priceId) => {
        let newSelectedPriceIds = [...selectedPriceIds]; // Copy current selection

        // Toggle the price selection
        if (newSelectedPriceIds.includes(priceId)) {
            // If price is already selected, remove it
            newSelectedPriceIds = newSelectedPriceIds.filter((id) => id !== priceId);
        } else {
            // Otherwise, add it to the selected prices list
            newSelectedPriceIds.push(priceId);
        }

        // Update state and notify the parent component of the changes
        setSelectedPriceIds(newSelectedPriceIds);
        onPriceChange(newSelectedPriceIds); // Pass the selected prices to parent
    };

    // Fetch prices data on component mount
    useEffect(() => {
        fetchPrice();
    }, []);

    return (
        <div className={styles.filterWrapper}>
            {loading && <p>Loading prices...</p>}
            {error && <p>Error: {error}</p>}

            <p className={styles.filterHeading}>Price Range</p>
            <div className={styles.filterButtonsWrapper}>
                {prices.length > 0 ? (
                    prices.map((price) => (
                        <button
                            key={price.id}
                            onClick={() => handlePriceSelect(price.id)}
                            className={`${styles.filterButtons} ${styles.priceButtons}`}
                            style={{
                                backgroundColor: selectedPriceIds.includes(price.id)
                                    ? "#FAFAFA"
                                    : "white",
                            }}
                        >
                            {price.range}
                        </button>
                    ))
                ) : (
                    <p>No prices available</p>
                )}
            </div>
        </div>
    );
};

export default PriceRange;
