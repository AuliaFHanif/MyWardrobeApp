import { useEffect, useState } from 'react'
import ClothingItemCards from '../components/ClothingItemCards'
import { phase2Api } from '../helpers/http.client'
import Search from '../components/Search'

function PublicPage() {
    const [items, setItems] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [sortOrder, setSortOrder] = useState("DESC")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const fetchData = async (search = "", category = "", sort = "DESC", page = 1) => {
        try {
            const params = {
                page: page,
                limit: itemsPerPage,
                sort: 'createdAt',
                order: sort
            }

            if (search) params.search = search
            if (category) params.category = category

            const { data } = await phase2Api.get('/pub/clothingItems', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                }
            })
            console.log(data[0]);
            
            setItems(data)
        } catch (error) {
            console.log(error)
        }
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
        fetchData(searchQuery, categoryFilter, sortOrder, pageNumber)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSearch = (search, category, sort) => {
        setSearchQuery(search)
        setCategoryFilter(category)
        setSortOrder(sort)
        setCurrentPage(1)
        fetchData(search, category, sort, 1)
    }

    useEffect(() => {
        fetchData(searchQuery, categoryFilter, sortOrder, currentPage)
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

export default PublicPage