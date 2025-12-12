import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { phase2Api } from '../../helpers/http.client'; 


export const fetchEditItemData = createAsyncThunk(
    'editItem/fetchData',
    async (itemId, { rejectWithValue }) => {
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem("access_token")}` };

           
            const [colorsRes, brandsRes, typesRes, itemRes] = await Promise.all([
                phase2Api.get("/colors"),
                phase2Api.get("/brands"),
                phase2Api.get("/types"),
                phase2Api.get(`/clothingItems/${itemId}`, { headers }),
            ]);

            const brands = brandsRes.data;
            const types = typesRes.data;
            const colors = colorsRes.data;
            const item = itemRes.data;

           
            const brandId = brands.find(b => b.brand_name === item.brand?.brand_name)?.id || "";
            const typeId = types.find(t => t.type_name === item.type?.type_name)?.id || "";
            const colorId = colors.find(c => c.color_name === item.color?.color_name)?.id || "";

          
            let formattedDate = "";
            if (item.last_used && item.last_used.length >= 10) {
                formattedDate = item.last_used.substring(0, 10);
            }

            return {
                brands,
                types,
                colors,
                formValues: {
                    brand_id: brandId,
                    type_id: typeId,
                    color_id: colorId,
                    size: item.size || "",
                    material: item.material || "",
                    image_url: item.image_url || "",
                    notes: item.notes || "",
                    last_used: formattedDate
                }
            };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);


export const updateItem = createAsyncThunk(
    'editItem/updateItem',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            await phase2Api.put(`/clothing/${id}`, data, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
            });
            return id; 
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
   
    brands: [],
    types: [],
    colors: [],
   
    formData: {
        brand_id: "",
        type_id: "",
        color_id: "",
        size: "",
        material: "",
        image_url: "",
        notes: "",
        last_used: ""
    },
    status: 'idle',
    error: null,
};

const editItemSlice = createSlice({
    name: 'editItem',
    initialState,
    reducers: {
       
        setFormField: (state, action) => {
            const { name, value } = action.payload;
            state.formData[name] = value;
        },
        resetForm: (state) => {
            state.formData = initialState.formData;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
           
            .addCase(fetchEditItemData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEditItemData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.brands = action.payload.brands;
                state.types = action.payload.types;
                state.colors = action.payload.colors;
                state.formData = action.payload.formValues;
            })
            .addCase(fetchEditItemData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
           
            .addCase(updateItem.pending, (state) => {
                state.status = 'submitting';
            })
            .addCase(updateItem.fulfilled, (state) => {
                state.status = 'succeeded';
            })
            .addCase(updateItem.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { setFormField, resetForm } = editItemSlice.actions;
export default editItemSlice.reducer;