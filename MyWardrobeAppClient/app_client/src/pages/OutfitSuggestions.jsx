import { phase2Api } from '../helpers/http.client';
import { useState } from 'react';
import { useNavigate } from 'react-router';

function OutfitSuggestion() {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [formData, setFormData] = useState({});
    const [suggestions, setSuggestions] = useState(null); 
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0); 
    
    // Initialize useNavigate hook
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Placeholder/Dummy API call
            const response = await phase2Api.get('/clothing/suggestionsDummy', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            });

            const data = response.data;
            setSuggestions(data);
            setCurrentSuggestionIndex(0); // Reset index to 0 when new data loads
            setShowSuggestions(true); 
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const totalSuggestions = suggestions?.suggestions?.length || 0;

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

    // --- NEW FUNCTION: Mark Outfit as Used and Redirect ---

    const currentOutfit = suggestions?.suggestions?.[currentSuggestionIndex];

    const handleWearOutfit = async () => {
        if (!currentOutfit) return;

        // The items array contains the IDs you need to send to the backend
        const itemIds = currentOutfit.items; 

        try {
            await phase2Api.post("/updateLastUsed", {
                // Send the array of item IDs to your backend
                itemIds: itemIds 
            });
            
            // Redirect the user to the myItems page after successful update
            navigate("/clothingItems/myItems");

        } catch (error) {
            console.error("Error updating last used date:", error);
            // Optionally, show an error message to the user here
            alert("Failed to record usage. Please try again.");
        }
    };

    // --- End of NEW FUNCTION ---

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    
                    {!showSuggestions ? (
                        // FORM VIEW (Omitted for brevity, unchanged)
                        // ...
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
                        // SUGGESTIONS VIEW - Single Card Style with Navigation
                        <div className="suggestions-view">
                            <button onClick={() => setShowSuggestions(false)} className="btn btn-secondary mb-4">
                                &larr; Back to Form
                            </button>
                            
                            <h1 className="text-center mb-4 text-primary">👗 AI Outfit Recommendations 👔</h1>

                            {/* Criteria Card (Omitted for brevity, unchanged) */}
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
                            
                            {/* Single Outfit Card (Omitted for brevity, unchanged) */}
                            {currentOutfit && (
                                <div className="card shadow mb-4">
                                    
                                    <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                                        <h4 className="card-title mb-0">
                                            Suggestion #{currentSuggestionIndex + 1} of {totalSuggestions}: {currentOutfit.outfit_name}
                                        </h4>
                                    </div>
                                    
                                    <div className="card-body">
                                        
                                        <div className="mb-3">
                                            <h5 className="h6 card-subtitle text-muted mb-2">Description</h5>
                                            <p className="card-text">{currentOutfit.description}</p>
                                        </div>

                                        <div className="alert alert-warning p-2 small" role="alert">
                                            **Tips:** {currentOutfit.style_tips}
                                        </div>
                                        
                                        <h5 className="h6 card-subtitle text-muted mt-3 mb-2">Items Used</h5>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-borderless table-striped">
                                                <thead>
                                                    <tr className="bg-light">
                                                        <th>Item Name</th>
                                                        <th>Category</th>
                                                        <th>Color</th>
                                                        <th>Size</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentOutfit.itemDetails.map((item) => (
                                                        <tr key={item.id}>
                                                            <td className="fw-bold">{item.name}</td>
                                                            <td>{item.category}</td>
                                                            <td>{item.color}</td>
                                                            <td>{item.size}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="card-footer text-muted small">
                                        <span className="me-2">Brand: {currentOutfit.itemDetails[0].brand}</span> 
                                        | <span className="ms-2">Size: {currentOutfit.itemDetails[0].size} (Example)</span>
                                    </div>
                                </div>
                            )}

                            {/* Navigation and Action Controls - NEW BUTTON ADDED */}
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