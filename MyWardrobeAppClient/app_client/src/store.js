// src/store.js

import { configureStore } from '@reduxjs/toolkit';
// Import the rootReducer function we fixed earlier
import rootReducer from './features/index.js'; 

export const store = configureStore({
    reducer: rootReducer,
    // Add middleware, devtools, etc. here if needed
});

// CRITICAL: Export the store object itself
export default store;