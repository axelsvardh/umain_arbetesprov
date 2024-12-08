import { useState, useEffect } from "react";
import styles from "../page.module.css";

const FilterComponent = ({ onFilterChange }) => {
    const [filters, setFilters] = useState([]);
    const [selectedFilterIds, setSelectedFilterIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch filters from the API
    const fetchFilters = async () => {
        try {
            setLoading(true);
            const response = await fetch("https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/filter");
            if (!response.ok) throw new Error("Failed to fetch filters");

            const data = await response.json();
            setFilters(data.filters || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Toggle filter selection
    const handleFilterToggle = (filterId) => {
        const updatedFilters = selectedFilterIds.includes(filterId)
            ? selectedFilterIds.filter((id) => id !== filterId)
            : [...selectedFilterIds, filterId];

        setSelectedFilterIds(updatedFilters);
        onFilterChange(updatedFilters);
    };

    // Fetch filters on component mount
    useEffect(() => {
        fetchFilters();
    }, []);

    return (
        <div className={styles.filterWrapper}>
            {loading && <p>Loading filters...</p>}
            {error && <p>Error: {error}</p>}

            <p className={styles.filterHeading}>Food Category</p>
            <div className={`${styles.filterButtonsWrapper} ${styles.foodCategoryWrapper}`}>
                {filters.length > 0 ? (
                    filters.map(({ id, name, image_url }) => (
                        <div
                            key={id}
                            className={styles.filterButtons}
                            onClick={() => handleFilterToggle(id)}
                            style={{
                                backgroundColor: selectedFilterIds.includes(id) ? "#FAFAFA" : "white",
                            }}
                        >
                            <p className={styles.foodTitle}>{name}</p>
                            <img
                                className={styles.filterImage}
                                src={`.${image_url.toLowerCase()}`}
                                alt={name}
                            />
                        </div>
                    ))
                ) : (
                    <p>No filters available</p>
                )}
            </div>
        </div>
    );
};

export default FilterComponent;
