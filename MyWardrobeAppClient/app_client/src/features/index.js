import { combineReducers } from '@reduxjs/toolkit';
import itemReducer from './clothing/itemSlice'; 
import publicItemsReducer from './clothing/publicItemsSlice'; 

const rootReducer = combineReducers({
    item: itemReducer,
    publicItems: publicItemsReducer, 
});

export default rootReducer;