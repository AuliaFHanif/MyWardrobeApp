import { phase2Api } from '../helpers/http.client';
import { useState } from 'react';



function OutfitSuggestion() {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({});
  const [suggestions, setSuggestions] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Call your Gemini AI API
    try {
        const response = await phase2Api.get('/clothing/suggestions', { params: formData });
    const data = response.data;
    setSuggestions(data);
    setShowSuggestions(true); // Switch to suggestions view
    } catch (error) {
        console.log(error);
        
    }
  };

  return (
    <div>
      {!showSuggestions ? (
        // FORM VIEW
        <form onSubmit={handleSubmit}>
          <h2>Get Outfit Suggestions</h2>
          <select name="occasion" onChange={(e) => setFormData({...formData, occasion: e.target.value})}>
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
          <button type="submit">Get Suggestions</button>
        </form>
      ) : (
        // SUGGESTIONS VIEW
        <div>
          <button onClick={() => setShowSuggestions(false)}>← Back to Form</button>
          <h2>Outfit Suggestions</h2>
          {suggestions && suggestions.map(item => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OutfitSuggestion;