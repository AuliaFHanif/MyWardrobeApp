import { phase2Api } from "../helpers/http.client";
import { use, useEffect, useState } from "react";

export default function AdminPage() {
  const [types, setTypes] = useState([]);
  const [colors, setColors] = useState([]);
  const [brands, setBrands] = useState([]);

  const getTypes = async () => {
    try {
      const typesData = await phase2Api.get("/types");
      setTypes(typesData.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getColors = async () => {
    try {
      const colorsData = await phase2Api.get("/colors");
      setColors(colorsData.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getBrands = async () => {
    try {
      const brandsData = await phase2Api.get("/brands");
      setBrands(brandsData.data);
    } catch (error) {
      console.log(error);
    }
  };

  const addCategory = () => {
    // Functionality to add a new category
  };

  const removeCategory = () => {
    // Functionality to remove an existing category
  };

  const addColor = () => {
    // Functionality to add a new color
  };

  const removeColor = () => {
    // Functionality to remove an existing color
  };

  const addBrand = () => {
    // Functionality to add a new brand
  };

  const removeBrand = () => {
    // Functionality to remove an existing brand
  };

  useEffect(() => {

    getColors();
    getBrands();
  }, []);

  return (
    <div>
      <h1>Admin Page</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Colors</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {colors.map((color) => (
            <tr key={color.id}>
              <td>{color.color_name}</td>
              <td>
                <button onClick={() => removeColor(color.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Brands</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand.id}>
              <td>{brand.brand_name}</td>
              <td>
                <button onClick={() => removeBrand(brand.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Types</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <tr key={type.id}>
              <td>{type.type_name}</td>
              <td>
                <button onClick={() => removeType(type.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
