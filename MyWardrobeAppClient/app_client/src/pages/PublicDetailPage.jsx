import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { phase2Api } from "../helpers/http.client";
import axios from 'axios'

export default function ItemDetails() {
    const navigate = useNavigate()
    const [items, setItems] = useState(null);
    const { id } = useParams();

    const fetchItemById = async () => {
            try {
                const { data } = await phase2Api.get("/clothingItems/" + id, {});
                console.log(data,"<============");
                
                setItems(data);
            } catch (err) {
                console.log("🚀 ~ fetchItemById ~ err:", err);
            }
        };

    const handleOnDeleteItem = async (itemId) => {
        try {
            await axios.delete(
                "http://localhost:3000/clothing/" + itemId,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            )
            navigate('/userclothing')
        } catch (error) {
            console.log(error);

            window.Swal.fire({
                icon: "error",
                title: "Something Went Wrong",
                text: error.response.data.message
            })
        }

    }
    useEffect(() => {
        fetchItemById();
    }, []);

    if (!items) {
        return <div>Loading...</div>;
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
                            src={items.image_url}
                            alt={items.notes}
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
                                {items.type.type_name}
                            </h2>
                        </div>
                        <div className="bg-white rounded p-3 flex-grow-1">
                            <p className="mb-0" style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                                {items.type.category}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {items.brand.brand_name}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {items.color.color_name}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {items.size}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {items.material}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                {items.last_used}
                            </p>
                        </div>
                          
                        <div className="mt-auto d-flex gap-2">
                            <button
                                onClick={() => navigate(`/edititem/${items.id}`)}
                                className="btn btn-warning flex-fill"
                                style={{ fontSize: "0.875rem", fontWeight: "500", padding: "0.5rem" }}>
                                Edit
                            </button>
                            <button
                                onClick={() => handleOnDeleteItem(items.id)}
                                className="btn btn-danger flex-fill"
                                style={{ fontSize: "0.875rem", fontWeight: "500", padding: "0.5rem" }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}