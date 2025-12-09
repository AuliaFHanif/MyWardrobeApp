import { useEffect, useState } from 'react'
import { Link, useNavigate } from "react-router";
import ClothingItemCards from '../components/ClothingItemCards';
import axios from 'axios'
import { phase2Api } from '../helpers/http.client'

function UserClothingItems() {
    const [items, setItem] = useState([])

    const fetchData = async () => {
        try {
            const { data } = await phase2Api.get('/pub/cuisine', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            })


            console.log("API Response:", data);
            setItem(data)


        } catch (error) {
            console.log(error.response)
            window.Swal.fire({
                icon: "error",
                title: "Something Went Wrong",
                text: error.response.data.message
            })
        }
    }

    const handleOnDeleteItem = async (itemId) => {

        await axios.delete(
            "http://localhost:3000/cuisine/" + itemId,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            }
        )
        fetchData()
    }

    const handleOnEditItem = async (itemId) => {

        await axios.put(
            "http://localhost:3000/cuisine/" + itemId,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            }
        )
        fetchData()
    }



    useEffect(() => {
        fetchData()

    }, [])


    return (
        <>
            <div className="container-fluid py-5" style={{ backgroundColor: "#FFDCDC", minHeight: '100vh' }}>
                <h1 className="text-center mb-4">Your Items</h1>
                <div className="d-flex gap-5 flex-column flex-lg-row">
                    <div id="form-section" style={{ width: '300px', flexShrink: 0 }}>
                        <div className="px-5 pb-5 pt-3 rounded" style={{ backgroundColor: '#FFE8CD' }}>
                            <div>
                                <h2 className="text-center fs-5 fw-bold">Add clothing item</h2>
                            </div>
                            <Link className="btn btn-primary d-flex justify-content-center" aria-current="page" to="/createcuisine" style={{ color: '#ffffffff' }}>
                                Add
                            </Link>
                        </div>
                    </div>
                    <div id="home-section" style={{ flex: 1 }}>
                        <div className="d-flex gap-3 flex-wrap">
                            {items.map((item) =>
                                <ClothingItemCards key={item.id} item={item} items={items} handleOnDeleteItem={handleOnDeleteItem} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserClothingItems