import { useEffect, useState } from 'react'
import ClothingItemCards from '../components/ClothingItemCards'
import { phase2Api } from '../helpers/http.client'
import Search from '../components/Search'

function UserClothingItems() {
    const [items, setItems] = useState([])
    const [categoryFilter, setCategoryFilter] = useState("")
    const [brandFilter, setBrandFilter] = useState("")
    const [colorFilter, setColorFilter] = useState("")
    const [sortOrder, setSortOrder] = useState("DESC")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12
    const fetchData = async (category = "", sort = "DESC", page = 1, brand_id = "", color_id = "") => {
        try {
            const params = {
                page: page,
                limit: itemsPerPage,
                sort: 'createdAt',
                order: sort
            }
            if (category) params.category = category
            if (brand_id) params.brand_id = brand_id
            if (color_id) params.color_id = color_id

            const { data } = await phase2Api.get('/clothing', {
                params: params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            })
            setItems(data)
        } catch (error) {
            console.log(error)
        }
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
        fetchData(categoryFilter, sortOrder, pageNumber, brandFilter, colorFilter)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSearch = (category = "", sort = "DESC", page = 1, brand_id = "", color_id = "") => {
        setCategoryFilter(category)
        setSortOrder(sort)
        setBrandFilter(brand_id)
        setColorFilter(color_id)
        setCurrentPage(1)
        fetchData(category, sort, 1, brand_id, color_id)
    }

    useEffect(() => {
        fetchData(categoryFilter, sortOrder, currentPage, brandFilter, colorFilter)
    }, [])

    return (
        <>
            <div className="container-fluid" style={{ backgroundColor: "#FFDCDC", minHeight: "100vh", paddingBottom: "3rem" }}>
                <h1 className="text-center py-4">My Wardrobe</h1>
                <div className="d-flex gap-4 flex-column flex-lg-row px-3">
                    <div id="form-section" style={{
                        width: '300px',
                        flexShrink: 0,
                        backgroundColor: '#FFE8CD',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        <div>
                            <h2 className="text-center fs-5 fw-bold mb-3">Search Clothing</h2>
                        </div>
                        <Search fetchData={handleSearch} />
                    </div>
                    <div id="home-section" style={{
                        flex: 1,
                        backgroundColor: '#FFE8CD',
                        borderRadius: '8px',
                        padding: '1.5rem'
                    }}>

                        {items.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-start' }}>
                                {items.map((item) =>
                                    <ClothingItemCards key={item.id} items={item} />)}
                            </div>
                        ) : (
                            <p className="text-center text-muted">No clothing items found</p>
                        )}

                        {items.length > 0 && (
                            <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                <span className="mx-2">Page {currentPage}</span>

                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={items.length < itemsPerPage}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserClothingItems