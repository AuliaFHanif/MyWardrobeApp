import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {phase2Api} from '../../helpers/http.client'; 

export const fetchItemById = createAsyncThunk(
    'item/fetchItemById',
    async (itemId, { rejectWithValue }) => {
        try {
            
            const response = await phase2Api.get("/clothingItems/" + itemId, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            return response.data;
        } catch (err) {
            console.error("Fetch Item By ID Error:", err);
            
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);


export const deleteItem = createAsyncThunk(
    'item/deleteItem',
    async (itemId, { rejectWithValue }) => {
        try {
           
            await phase2Api.delete("/clothing/" + itemId, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
      
            return itemId;
        } catch (err) {
            console.error("Delete Item Error:", err);
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);




export const itemSlice = createSlice({
    name: 'item',
    initialState: {
        item: null, 
        status: 'idle', 
        error: null,
    },
    reducers: {
        
        clearItemState: (state) => {
            state.item = null;
            state.status = 'idle';
            state.error = null;
        }
    },
   
    extraReducers: (builder) => {
        builder
           
            .addCase(fetchItemById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchItemById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.item = action.payload; 
            })
            .addCase(fetchItemById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload; 
                state.item = null;
            })
            
   
            .addCase(deleteItem.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteItem.fulfilled, (state, action) => {
            
                state.status = 'succeeded';
                state.item = null; 
            })
            .addCase(deleteItem.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearItemState } = itemSlice.actions;

export default itemSlice.reducer;