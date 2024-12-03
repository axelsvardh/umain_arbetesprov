import { useState, useEffect } from "react";
// import PriceRange from "./PriceRange"; // Assuming you have a PriceRange component

const FilterComponent = ({ onFilterChange }) => {
    const [filters, setFilters] = useState([]);
    const [selectedFilterIds, setSelectedFilterIds] = useState([]); // Track selected filter IDs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch filters (categories or other filters) from the API
    const fetchFilters = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                "https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/filter"
            );
            if (!response.ok) {
                throw new Error("Failed to fetch filters");
            }
            const result = await response.json();
            setFilters(Array.isArray(result) ? result : result.filters || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch filter details from the API
    const fetchFilterDetails = async (filterId) => {
        const filterDetailsURL = `https://work-test-web-2024-eze6j4scpq-lz.a.run.app/api/filter/${filterId}`;
        try {
            const response = await fetch(filterDetailsURL);
            if (!response.ok) {
                throw new Error(`Failed to fetch filter details for ID: ${filterId}`);
            }
            const data = await response.json();
            return data || null;
        } catch (error) {
            console.error("Error fetching filter details:", error);
            return null;
        }
    };

    // Handle filter selection (toggle the filter in/out)
    const handleFilterSelect = (filterId) => {
        let newSelectedFilterIds = [...selectedFilterIds]; // Copy current selection

        // Toggle the filter selection
        if (newSelectedFilterIds.includes(filterId)) {
            // If filter is already selected, remove it
            newSelectedFilterIds = newSelectedFilterIds.filter((id) => id !== filterId);
        } else {
            // Otherwise, add it to the selected filters list
            newSelectedFilterIds.push(filterId);
        }

        // Update state and notify the parent component of the changes
        setSelectedFilterIds(newSelectedFilterIds);
        onFilterChange(newSelectedFilterIds); // Pass the selected filters to parent
    };

    // Handle filter change to fetch details for selected filters
    const handleFilterChange = async (selectedFilterIds) => {
        try {
            if (Array.isArray(selectedFilterIds) && selectedFilterIds.length > 0) {
                // Fetch details for each selected filter
                const filterDetailsPromises = selectedFilterIds.map((filterId) =>
                    fetchFilterDetails(filterId)
                );

                // Wait for all promises to resolve
                const filterDetails = await Promise.all(filterDetailsPromises);

                // Filter out any null results (failed fetches)
                const validFilterDetails = filterDetails.filter(details => details !== null);

                console.log("Fetched filter details:", validFilterDetails);
            }
        } catch (error) {
            console.error("Error fetching filter details:", error);
        }
    };

    // Fetch filters data on component mount
    useEffect(() => {
        fetchFilters();
    }, []);

    // Optional: If you need to fetch filter details whenever selected filters change
    useEffect(() => {
        handleFilterChange(selectedFilterIds);
    }, [selectedFilterIds]); // Re-run when selected filters change

    return (
        <div>
            {loading && <p>Loading filters...</p>}
            {error && <p>Error: {error}</p>}

            <h1>Filter by Category</h1>
            <div>
                {filters.length > 0 ? (
                    filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => handleFilterSelect(filter.id)}
                            style={{
                                backgroundColor: selectedFilterIds.includes(filter.id)
                                    ? "lightblue"
                                    : "white", // Toggle selected state
                                margin: "5px",
                                padding: "10px 20px",
                                cursor: "pointer",
                            }}
                        >
                            {filter.name}
                        </button>
                    ))
                ) : (
                    <p>No filters available</p>
                )}
            </div>

            {/* Optionally, you can include a Price Range filter component */}
            {/* <PriceRange /> */}
        </div>
    );
};

export default FilterComponent;
