import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { phase2Api } from '../../helpers/http.client'; 

const itemsPerPage = 12;


export const fetchPublicItems = createAsyncThunk(
    'publicItems/fetchPublicItems',
    async (filters, { rejectWithValue }) => {
        try {
            const { category, sort, page, brand_id, color_id } = filters;
            
            const params = {
                page: page,
                limit: itemsPerPage,
                sort: 'createdAt',
                order: sort || 'DESC'
            };
            
       
            if (category) params.category = category;
            if (brand_id) params.brand_id = brand_id;
            if (color_id) params.color_id = color_id;

            const { data } = await phase2Api.get('/pub/clothingItems', {
                params: params,
                headers: {
          
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            });
            
            return data; 

        } catch (error) {
            console.error("Fetch Public Items Error:", error);
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- SLICE DEFINITION ---
export const publicItemsSlice = createSlice({
    name: 'publicItems',
    initialState: {
        items: [],
        status: 'idle', 
        error: null,
       
        categoryFilter: "",
        brandFilter: "",
        colorFilter: "",
        sortOrder: "DESC",
        currentPage: 1,
        itemsPerPage: itemsPerPage
    },
    reducers: {
        
        setFilters: (state, action) => {
            state.categoryFilter = action.payload.category || "";
            state.sortOrder = action.payload.sort || "DESC";
            state.brandFilter = action.payload.brand_id || "";
            state.colorFilter = action.payload.color_id || "";
            state.currentPage = 1; 
        },
   
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPublicItems.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPublicItems.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchPublicItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.items = [];
            });
    },
});

export const { setFilters, setCurrentPage } = publicItemsSlice.actions;
export default publicItemsSlice.reducer;