import { useState, useEffect } from "react";
import styles from "../page.module.css";

const DeliveryTime = ({ restaurants, onDeliveryTimeChange, onDeliveryTimeCategories }) => {
    const [deliveryTimes, setDeliveryTimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const deliveryTimeCategories = [
        { label: "0-10 min", range: [0, 9] },
        { label: "10-30 min", range: [10, 29] },
        { label: "30-60 min", range: [30, 59] },
        { label: "1 hour+", range: [60, Infinity] }
    ];

    useEffect(() => {
        onDeliveryTimeCategories(deliveryTimeCategories);
    }, [onDeliveryTimeCategories]);

    const fetchDeliveryTimes = async () => {
        setLoading(true);
        setError(null);
        try {
            const deliveryTimes = [];
            for (const restaurant of restaurants) {
                const response = await fetch(
                    `https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/open/${restaurant.id}`
                );
                if (response.ok) {
                    const data = await response.json();
                    const deliveryTime = data.delivery_time;

                    const category = deliveryTimeCategories.find((cat) =>
                        deliveryTime >= cat.range[0] && deliveryTime < cat.range[1]
                    );

                    if (category) {
                        deliveryTimes.push({
                            restaurantId: restaurant.id,
                            deliveryTime: deliveryTime,
                            category: category.label,
                        });
                    }
                } else {
                    console.error(`Failed to fetch delivery time for restaurant ${restaurant.id}`);
                }
            }
            setDeliveryTimes(deliveryTimes);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (restaurants.length > 0) {
            fetchDeliveryTimes();
        }
    }, [restaurants]);

    // Multiple select
    const [selectedDeliveryTimes, setSelectedDeliveryTimes] = useState([]);

    // Category toggle
    const handleDeliveryTimeToggle = (category) => {
        const newSelected = selectedDeliveryTimes.includes(category)
            ? selectedDeliveryTimes.filter((item) => item !== category)
            : [...selectedDeliveryTimes, category];

        setSelectedDeliveryTimes(newSelected);
        onDeliveryTimeChange(newSelected);
    };

    return (
        <div className={`${styles.filterWrapper} ${styles.deliveryWrapper}`}>
            {loading && <p>Loading delivery times...</p>}
            {error && <p>Error: {error}</p>}
            <p className={styles.filterHeading}>Delivery Time</p>
            <div className={styles.filterButtonsWrapper}>
                {deliveryTimeCategories.map((category) => (
                    <button
                        key={category.label}
                        onClick={() => handleDeliveryTimeToggle(category.label)}
                        className={styles.filterButtons}
                        style={{
                            backgroundColor: selectedDeliveryTimes.includes(category.label)
                                ? "#eeeeee" // Active
                                : "white",
                        }}
                    >
                        {category.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DeliveryTime;
