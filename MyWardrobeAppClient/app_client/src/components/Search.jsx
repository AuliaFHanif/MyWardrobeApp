import { useState } from 'react'

export default function Search({ fetchData }) {
    const [name, setName] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [sortOrder, setSortOrder] = useState("DESC")

    const handleSubmit = async (event) => {
        event.preventDefault()
        fetchData(name, categoryId, sortOrder)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="input-name" className="form-label">
                    Name
                </label>
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    type="text"
                    className="form-control"
                    id="input-name"
                    placeholder="Cuisine Name"
                />
            </div>
            <div className="mb-3">
                <label htmlFor="input-category" className="form-label">
                    Category
                </label>
                <select
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    className="form-select"
                    id="input-categoryId"
                >
                    <option value="">Select Cuisine Category</option>
                    <option value="1">Italian</option>
                    <option value="2">Thai</option>
                    <option value="3">American</option>
                    <option value="4">Japanese</option>
                    <option value="5">Salads</option>
                    <option value="6">Indian</option>
                    <option value="7">Mexican</option>
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="input-sort" className="form-label">
                    Sort By
                </label>
                <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className="form-select"
                    id="input-sort"
                >
                    <option value="DESC">Newest First</option>
                    <option value="ASC">Oldest First</option>
                </select>
            </div>
            <button type="submit" className="btn btn-primary w-100">
                Search
            </button>
        </form>
    )
}