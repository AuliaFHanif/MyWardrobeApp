import { useState, useEffect } from 'react'
import { phase2Api } from '../helpers/http.client'

export default function Search({ fetchData }) {
    const [category, setCategory] = useState("")
    const [brand_id, setBrandId] = useState("")
    const [color_id, setColorId] = useState("")
    const [sortOrder, setSortOrder] = useState("DESC")
    const [brands, setBrands] = useState([])
    const [colors, setColors] = useState([])

    const handleSubmit = async (event) => {
        event.preventDefault()
        fetchData(category, sortOrder, 1, brand_id, color_id)
    }

    const getBrands = async () => {
        const brandsData = await phase2Api.get('/brands')
        setBrands(brandsData.data)
    }

    const getColors = async () => {
        const colorsData = await phase2Api.get('/colors')
        setColors(colorsData.data)
    }

    useEffect(() => {
        getBrands()
        getColors()
    }, [])

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="input-category" className="form-label">
                    Category
                </label>
                <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="form-select"
                    id="input-category"
                >
                    <option value="">Select item category</option>
                    <option value="Tops">Tops</option>
                    <option value="Bottoms">Bottoms</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Formalwear">Formal</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Swimwear">Swimwear</option>
                    <option value="Activewear">Activewear</option>
                    <option value="Accessories">Accessories</option>
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="input-brandId" className="form-label">
                    Brand
                </label>
                <select
                    value={brand_id}
                    onChange={(event) => setBrandId(event.target.value)}
                    className="form-select"
                    id="input-brandId"
                >
                    <option value="">Select item brand</option>
                    {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.brand_name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="input-colorId" className="form-label">
                    Color
                </label>
                <select
                    value={color_id}
                    onChange={(event) => setColorId(event.target.value)}
                    className="form-select"
                    id="input-colorId"
                >
                    <option value="">Select item color</option>
                    {colors.map((color) => (
                        <option key={color.id} value={color.id}>{color.color_name}</option>
                    ))}
                </select>
            </div>
            <button type="submit" className="btn btn-primary w-100">
                Search
            </button>
        </form>
    )
}