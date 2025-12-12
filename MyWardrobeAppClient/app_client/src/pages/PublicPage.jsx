import { useEffect, useState } from 'react'
import PublicItemCards from '../components/PublicItemCards.jsx'
import { phase2Api } from '../helpers/http.client'
import Search from '../components/Search'
import { useSelector, useDispatch } from 'react-redux'
import { fetchPublicItems, setFilters, setCurrentPage } from '../features/clothing/publicItemsSlice'

function PublicPage() {
    const dispatch = useDispatch()
    
    
    const { 
        items, 
        status, 
        error,
        categoryFilter, 
        brandFilter, 
        colorFilter, 
        sortOrder, 
        currentPage,
        itemsPerPage
    } = useSelector((state) => state.publicItems)

   
    const getCurrentParams = (pageOverride = currentPage) => ({
        category: categoryFilter,
        sort: sortOrder,
        page: pageOverride,
        brand_id: brandFilter,
        color_id: colorFilter
    })

   
    const handleFetch = (filters) => {
        dispatch(fetchPublicItems(filters))
    }

   
    const handlePageChange = (pageNumber) => {
        dispatch(setCurrentPage(pageNumber)) 
        handleFetch(getCurrentParams(pageNumber)) 
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    
    const handleSearch = (category = "", sort = "DESC", page, brand_id = "", color_id = "") => {
        
        dispatch(setFilters({ category, sort, brand_id, color_id }))
        
      
        handleFetch({ 
            category, 
            sort, 
            page: 1, 
            brand_id, 
            color_id 
        })
    }


    useEffect(() => {
        handleFetch(getCurrentParams())
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
                                    <PublicItemCards key={item.id} items={item} />)}
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