import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { phase2Api } from "../helpers/http.client";
import { useSelector, useDispatch } from 'react-redux';
import { fetchItemById, deleteItem } from '../features/clothing/itemSlice';


export default function ItemDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const item = useSelector((state) => state.item.item);
    const status = useSelector((state) => state.item.status);
    const error = useSelector((state) => state.item.error);

    useEffect(() => {
       
        if (id) {
            dispatch(fetchItemById(id));
        }
      
    }, [id, dispatch]); 

    if (status === 'loading' || status === 'idle') {
        return <div>Loading item details...</div>;
    }

    if (status === 'failed' || !item) {
        return <div>Error loading item details: {error ? (error.message || 'Unknown error') : 'Item not found.'}</div>;
    }
    
    return (
        <div className="py-5" style={{ backgroundColor: '#FFF2EB', minHeight: '100vh' }}>
            <h1 className="text-center mb-4" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>
                Item Details
            </h1>
            <div className="m-auto rounded overflow-hidden p-4" style={{
                maxWidth: '700px',
                backgroundColor: '#FFE8CD',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div className="d-flex flex-column flex-md-row gap-4">
                    <div className="p-3 bg-white rounded" style={{
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img
                            src={item.image_url}
                            alt={item.notes}
                            style={{
                                maxWidth: '250px',
                                maxHeight: '250px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                            }}
                        />
                    </div>
                    <div className="d-flex flex-column gap-3 flex-grow-1">
                        <div className="bg-white rounded p-3">
                            <h2 className="mb-0" style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333' }}>
                                {item.type.type_name}
                            </h2>
                        </div>
                        <div className="bg-white rounded p-3 flex-grow-1">
                            <p className="mb-0" style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                                {item.type.category}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {item.brand.brand_name}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {item.color.color_name}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {item.size}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {item.material}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {item.last_used}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}