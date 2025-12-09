import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { phase2Api } from "../helpers/http.client";
import axios from 'axios'

export default function ItemDetails() {
    const navigate = useNavigate()
    const { id } = useParams();
    const [cuisine, setCuisine] = useState(null);


    const handleOnDeleteCuisine = async (CuisineId) => {
        try {
            await axios.delete(
                "http://localhost:3000/cuisine/" + CuisineId,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            )
            navigate('/usercuisines')
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
        const fetchMovieById = async () => {
            try {
                const { data } = await phase2Api.get(`/cuisine/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`
                    }
                });
                setCuisine(data);
            } catch (err) {
                console.log("🚀 ~ fetchMovieById ~ err:", err);
            }
        };

        fetchMovieById();
    }, [id]);

    if (!cuisine) {
        return <div>Loading...</div>;
    }

    return (
        <div className="py-5" style={{ backgroundColor: '#FFF2EB', minHeight: '100vh' }}>
            <h1 className="text-center mb-4" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>
                Cuisine Details
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
                            src={cuisine.imgUrl}
                            alt={cuisine.name}
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
                                {cuisine.name}
                            </h2>
                        </div>
                        <div className="bg-white rounded p-3 flex-grow-1">
                            <p className="mb-0" style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
                                {cuisine.description}
                            </p>
                        </div>
                        <div className="bg-white rounded p-3">
                            <p className="mb-0" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                Rp.{cuisine.price}
                            </p>
                        </div>
                        <div className="mt-auto d-flex gap-2">
                            <button
                                onClick={() => navigate(`/editcuisine/${cuisine.id}`)}
                                className="btn btn-warning flex-fill"
                                style={{ fontSize: "0.875rem", fontWeight: "500", padding: "0.5rem" }}>
                                Edit
                            </button>
                            <button
                                onClick={() => handleOnDeleteCuisine(cuisine.id)}
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