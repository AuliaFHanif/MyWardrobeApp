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
                <label htmlFor="input-category" className="form-label">
                    Type
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
                <label htmlFor="input-category" className="form-label">
                    Brand
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
                <label htmlFor="input-category" className="form-label">
                    Color
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
            
            <button type="submit" className="btn btn-primary w-100">
                Search
            </button>
        </form>
    )
}