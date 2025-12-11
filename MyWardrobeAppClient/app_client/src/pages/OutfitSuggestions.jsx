import { phase2Api } from '../helpers/http.client';
import { useState } from 'react';
import { useNavigate } from 'react-router';

function OutfitSuggestion() {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [formData, setFormData] = useState({});
    const [suggestions, setSuggestions] = useState(null);
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

    // Initialize useNavigate hook for redirection
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Placeholder/Dummy API call (now assumes it returns the structure you provided)
            const response = await phase2Api.get('/clothing/suggestionsDummy', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            });

            const data = response.data;
            setSuggestions(data);
            setCurrentSuggestionIndex(0);
            setShowSuggestions(true);
        } catch (error) {
            console.log(error);
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

        // Get the item IDs from the current outfit
        const itemIds = currentOutfit.items;

        try {
            // API call to update the last used date
            // CORRECT STRUCTURE
            await phase2Api.post("/clothing/last-used",
                { itemIds: itemIds }, 
                { 
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    }
                }
            );

            // Redirect the user
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
                        // FORM VIEW 
                        <div className="card shadow">
                            <div className="card-body">
                                <h2 className="card-title text-center mb-4">Get Outfit Suggestions</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="occasionSelect" className="form-label">Select Occasion</label>
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
                                    <button type="submit" className="btn btn-primary w-100">
                                        Get Suggestions
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        // SUGGESTIONS VIEW - Single Card Style with Navigation and Images
                        <div className="suggestions-view">
                            <button onClick={() => setShowSuggestions(false)} className="btn btn-secondary mb-4">
                                &larr; Back to Form
                            </button>

                            <h1 className="text-center mb-4 text-primary">👗 AI Outfit Recommendations 👔</h1>

                            {/* Criteria Card */}
                            {suggestions && suggestions.criteria && (
                                <div className="card bg-light mb-4 shadow-sm border-info">
                                    <div className="card-header bg-info text-white">
                                        **Search Criteria**
                                    </div>
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item">**Occasion:** {suggestions.criteria.occasion}</li>
                                        <li className="list-group-item">**Weather:** {suggestions.criteria.weather}</li>
                                        <li className="list-group-item">**Style Preference:** {suggestions.criteria.stylePreference}</li>
                                    </ul>
                                </div>
                            )}

                            {/* Single Outfit Card */}
                            {currentOutfit && (
                                <div className="card shadow mb-4">

                                    {/* Assuming card-header is here */}

                                    <div className="card-body">

                                        {/* Description */}
                                        <div className="mb-3">
                                            <h5 className="h6 card-subtitle text-muted mb-2">Description</h5>
                                            <p className="card-text">{currentOutfit.description}</p>
                                        </div>

                                        {/* Style Tips (Alert Style) */}
                                        <div className="alert alert-warning p-2 small" role="alert">
                                            **Tips:** {currentOutfit.style_tips}
                                        </div>

                                        {/* --- START OF DETAILED VERTICAL LIST --- */}
                                        <h5 className="h6 card-subtitle text-muted mt-3 mb-3">Items Used</h5>

                                        <div className="list-group">
                                            {currentOutfit.itemDetails.map((item) => (
                                                // We will add the title attribute to this main item container
                                                <div
                                                    key={item.id}
                                                    className="list-group-item list-group-item-action p-3 mb-2 border rounded shadow-sm"
                                                    title={item.notes ? `Notes: ${item.notes}` : undefined} // <-- ADDED Tooltip here
                                                >

                                                    {/* Inner row to align image (left) and details (right) */}
                                                    <div className="row align-items-center">

                                                        {/* Column 1: Image (Unchanged) */}
                                                        <div className="col-2 me-3">
                                                            {/* ... image block remains the same ... */}
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

                                                        {/* Column 2: Details */}
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

                                                                {/* Notes: Now displayed simply, with full text on hover (via parent's title attribute) */}
                                                                {item.notes && (
                                                                    <span className="text-secondary">
                                                                        <span className="fw-semibold ms-2">Notes:</span>
                                                                        {/* Removed text-truncate and max-width here */}
                                                                        {item.notes}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* --- END OF DETAILED VERTICAL LIST --- */}

                                    </div>
                                    <div className="card-footer text-muted small">
                                        <span className="me-2">Last Used: *N/A (Update on wear)*</span>
                                    </div>
                                </div>
                            )}

                            {/* Navigation and Action Controls */}
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
                                *Total items considered from your wardrobe: **{suggestions?.wardrobeSize}***
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OutfitSuggestion;