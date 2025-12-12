import { phase2Api } from '../helpers/http.client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

function OutfitSuggestion() {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [formData, setFormData] = useState({});
    const [suggestions, setSuggestions] = useState(null);
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);

    const navigate = useNavigate();

    // Get user's location on component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.log("Location access denied:", error);
                    // Continue without location - user can still get suggestions
                }
            );
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare request body
            const requestBody = {
                occasion: formData.occasion,
                stylePreference: formData.stylePreference || undefined,
                weather: formData.weather || undefined,
            };

            // Add location if available
            if (location) {
                requestBody.lat = location.lat;
                requestBody.lon = location.lon;
            }

            // Make POST request to the real endpoint
            const response = await phase2Api.post('/clothing/suggestions', requestBody, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            });

            const data = response.data;
            setSuggestions(data);
            setCurrentSuggestionIndex(0);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setError(error.response?.data?.error || "Failed to get outfit suggestions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const totalSuggestions = suggestions?.suggestions?.length || 0;
    const currentOutfit = suggestions?.suggestions?.[currentSuggestionIndex];

    const handleNext = () => {
        if (currentSuggestionIndex < totalSuggestions - 1) {
            setCurrentSuggestionIndex(prevIndex => prevIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentSuggestionIndex > 0) {
            setCurrentSuggestionIndex(prevIndex => prevIndex - 1);
        }
    };

    const handleWearOutfit = async () => {
        if (!currentOutfit) return;

        const itemIds = currentOutfit.items;

        try {
            await phase2Api.post("/clothing/last-used",
                { itemIds: itemIds },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    }
                }
            );

            navigate("/clothingItems/myItems");
        } catch (error) {
            console.error("Error updating last used date:", error);
            alert("Failed to record usage. Please try again.");
        }
    };

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">

                    {!showSuggestions ? (
                        <div className="card shadow">
                            <div className="card-body">
                                <h2 className="card-title text-center mb-4">Get Outfit Suggestions</h2>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                {location && (
                                    <div className="alert alert-info" role="alert">
                                        📍 Location detected! Weather will be considered in suggestions.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="occasionSelect" className="form-label">Select Occasion *</label>
                                        <select
                                            id="occasionSelect"
                                            name="occasion"
                                            className="form-select"
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select Occasion</option>
                                            <option value="casual">Casual</option>
                                            <option value="formal">Formal</option>
                                            <option value="business">Business</option>
                                            <option value="business_casual">Business Casual</option>
                                            <option value="party">Party</option>
                                            <option value="date_night">Date Night</option>
                                            <option value="athletic">Athletic</option>
                                            <option value="outdoor">Outdoor</option>
                                            <option value="beach">Beach</option>
                                            <option value="lounge">Lounge</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="stylePreference" className="form-label">Style Preference (Optional)</label>
                                        <input
                                            type="text"
                                            id="stylePreference"
                                            name="stylePreference"
                                            className="form-control"
                                            placeholder="e.g., Minimalist, Bold, Romantic"
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="weather" className="form-label">Weather Override (Optional)</label>
                                        <input
                                            type="text"
                                            id="weather"
                                            name="weather"
                                            className="form-control"
                                            placeholder="e.g., Hot and sunny, Cold and rainy"
                                            onChange={handleChange}
                                        />
                                        <small className="form-text text-muted">
                                            Leave blank to use current weather based on your location
                                        </small>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Getting Suggestions...
                                            </>
                                        ) : (
                                            'Get Suggestions'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="suggestions-view">
                            <button onClick={() => setShowSuggestions(false)} className="btn btn-secondary mb-4">
                                &larr; Back to Form
                            </button>

                            <h1 className="text-center mb-4 text-primary">👗 AI Outfit Recommendations 👔</h1>

                            {suggestions && suggestions.criteria && (
                                <div className="card bg-light mb-4 shadow-sm border-info">
                                    <div className="card-header bg-info text-white">
                                        <strong>Search Criteria</strong>
                                    </div>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item"><strong>Occasion:</strong> {suggestions.criteria.occasion}</li>
                                        <li className="list-group-item"><strong>Weather:</strong> {suggestions.criteria.weather}</li>
                                        <li className="list-group-item"><strong>Style Preference:</strong> {suggestions.criteria.stylePreference}</li>
                                    </ul>
                                </div>
                            )}

                            {currentOutfit && (
                                <div className="card shadow mb-4">
                                    <div className="card-header bg-primary text-white">
                                        <h4 className="mb-0">{currentOutfit.outfit_name}</h4>
                                        <small>Outfit {currentSuggestionIndex + 1} of {totalSuggestions}</small>
                                    </div>

                                    <div className="card-body">
                                        <div className="mb-3">
                                            <h5 className="h6 card-subtitle text-muted mb-2">Description</h5>
                                            <p className="card-text">{currentOutfit.description}</p>
                                        </div>

                                        <div className="alert alert-warning p-2 small" role="alert">
                                            <strong>Tips:</strong> {currentOutfit.style_tips}
                                        </div>

                                        <h5 className="h6 card-subtitle text-muted mt-3 mb-3">Items Used</h5>

                                        <div className="list-group">
                                            {currentOutfit.itemDetails.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="list-group-item list-group-item-action p-3 mb-2 border rounded shadow-sm"
                                                    title={item.notes ? `Notes: ${item.notes}` : undefined}
                                                >
                                                    <div className="row align-items-center">
                                                        <div className="col-2 me-3">
                                                            {item.image_url ? (
                                                                <img
                                                                    src={item.image_url}
                                                                    className="img-fluid rounded"
                                                                    alt={item.name}
                                                                    style={{ height: '80px', objectFit: 'cover', width: '100%' }}
                                                                />
                                                            ) : (
                                                                <div className="d-flex align-items-center justify-content-center bg-secondary-subtle rounded" style={{ height: '80px' }}>
                                                                    <small className="text-muted text-center" style={{ fontSize: '0.6rem' }}>No Image</small>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col">
                                                            <h6 className="mb-1 fw-bold text-primary">{item.name}</h6>
                                                            <div className="d-flex flex-wrap align-items-center small text-muted">
                                                                <span className="me-3">
                                                                    <span className="fw-semibold">Category:</span> {item.category}
                                                                </span>
                                                                <span className="me-3">
                                                                    <span className="fw-semibold">Color:</span> {item.color}
                                                                </span>
                                                                <span className="me-3">
                                                                    <span className="fw-semibold">Brand:</span> {item.brand}
                                                                </span>
                                                                <span className="me-3">
                                                                    <span className="fw-semibold">Size:</span> {item.size}
                                                                </span>
                                                                {item.notes && (
                                                                    <span className="text-secondary">
                                                                        <span className="fw-semibold ms-2">Notes:</span> {item.notes}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={handlePrevious}
                                    disabled={currentSuggestionIndex === 0}
                                >
                                    &larr; Previous Outfit
                                </button>

                                <button
                                    className="btn btn-success btn-lg mx-3"
                                    onClick={handleWearOutfit}
                                    disabled={!currentOutfit}
                                >
                                    Wear This Outfit!
                                </button>

                                <button
                                    className="btn btn-outline-primary"
                                    onClick={handleNext}
                                    disabled={currentSuggestionIndex === totalSuggestions - 1}
                                >
                                    Next Outfit &rarr;
                                </button>
                            </div>

                            <p className="text-end text-muted mt-4 small">
                                Total items considered from your wardrobe: <strong>{suggestions?.wardrobeSize}</strong>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OutfitSuggestion;