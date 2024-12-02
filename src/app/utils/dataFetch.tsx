const baseURL = "https://work-test-web-2024-eze6j4scpq-lz.a.run.app";

export async function fetchRestaurants() {
    const response = await fetch(`${baseURL}/api/restaurants`);
    if (!response.ok) throw new Error(`Failed to fetch restaurants: ${response.status}`);
    return response.json();
}

export async function fetchPriceRange(id) {
    const response = await fetch(`${baseURL}/api/price_range/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch price range: ${response.status}`);
    return response.json();
}
