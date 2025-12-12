import { combineReducers } from '@reduxjs/toolkit';
import itemReducer from './clothing/itemSlice'; 
import publicItemsReducer from './clothing/publicItemsSlice'; 
import editItemReducer from './clothing/editItemSlice'; 

const rootReducer = combineReducers({
    item: itemReducer,
    publicItems: publicItemsReducer, 
    editItem: editItemReducer, 
    
});

export default rootReducer;