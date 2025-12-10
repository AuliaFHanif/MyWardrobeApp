import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { useState, useRef, useEffect } from "react";
import { phase2Api } from "../helpers/http.client";

// Helper function to get nested property
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
}

// Searchable Dropdown Component
function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  displayKey = "name",
  valueKey = "id",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Find the selected option from the options array
  const selectedOption = options.find((opt) => opt[valueKey] === value);
  const displayValue = selectedOption
    ? getNestedValue(selectedOption, displayKey)
    : "";

  const filtered = options.filter((option) =>
    getNestedValue(option, displayKey)
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // Reset search when dropdown closes or when value changes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen, value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option[valueKey]);
    setSearch("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setSearch("");
    inputRef.current?.focus();
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div ref={wrapperRef} className="position-relative">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? search : displayValue || ""}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="form-control"
          />

          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              width="16"
              height="16"
              fill="currentColor"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
            </svg>
          </button>

          {value && (
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              ×
            </button>
          )}
        </div>

        {isOpen && (
          <div
            className="list-group position-absolute w-100 mt-1 shadow-lg"
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              zIndex: 1000,
              backgroundColor: "white",
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <button
                  key={option[valueKey]}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`list-group-item list-group-item-action ${
                    value === option[valueKey] ? "active" : ""
                  }`}
                >
                  {getNestedValue(option, displayKey)}
                </button>
              ))
            ) : (
              <div className="list-group-item text-center text-muted">
                No results found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditItem({ items, setItems, fetchData }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [brand_id, setBrand] = useState("");
  const [type_id, setType] = useState("");
  const [color_id, setColor] = useState("");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [image_url, setImageUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [last_used, setLastUsed] = useState("");

  const [colors, setColors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    // Fetch all data in parallel
    const fetchAllData = async () => {
      try {
        // First fetch all reference data
        const [colorsData, brandsData, typesData, clothingData] =
          await Promise.all([
            phase2Api.get("/colors", {}),
            phase2Api.get("/brands", {}),
            phase2Api.get("/types", {}),
            phase2Api.get("/clothingItems/" + id, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }),
          ]);

        console.log(clothingData.data, "<============ Clothing Item");
        console.log(brandsData.data, "<============ Brands");
        console.log(typesData.data, "<============ Types");
        console.log(colorsData.data, "<============ Colors");

        // Set the reference data
        setColors(colorsData.data);
        setBrands(brandsData.data);
        setTypes(typesData.data);

        // Now match IDs with the fetched reference data
        const brandId =
          brandsData.data.find(
            (b) => b.brand_name === clothingData.data.brand?.brand_name
          )?.id || "";
        const typeId =
          typesData.data.find(
            (t) => t.type_name === clothingData.data.type?.type_name
          )?.id || "";
        const colorId =
          colorsData.data.find(
            (c) => c.color_name === clothingData.data.color?.color_name
          )?.id || "";

        console.log("Matched IDs:", { brandId, typeId, colorId });

        // Set the clothing item data
        setBrand(brandId);
        setType(typeId);
        setColor(colorId);
        setSize(clothingData.data.size);
        setMaterial(clothingData.data.material || "");
        setImageUrl(clothingData.data.image_url || "");
        setNotes(clothingData.data.notes || "");
        // Extract just the date portion (YYYY-MM-DD) from the timestamp
        let lastUsedDate = "";
        if (
          clothingData.data.last_used &&
          typeof clothingData.data.last_used === "string" &&
          clothingData.data.last_used.length >= 10
        ) {
          // Extract the first 10 characters: "YYYY-MM-DD"
          lastUsedDate = clothingData.data.last_used.substring(0, 10);
        }
        setLastUsed(lastUsedDate);
      } catch (err) {
        console.log("🚀 ~ fetchAllData ~ err:", err);
      }
    };
    fetchAllData();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const requestBody = {
      brand_id,
      type_id,
      color_id,
      size,
      material,
      image_url,
      notes,
    };
    console.log({
      brand_id,
      type_id,
      color_id,
      size,
      material,
      image_url,
      notes,
    });

    try {
      const response = await phase2Api.put("/clothing/" + id, requestBody, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (fetchData) {
        try {
          await fetchData();
        } catch (fetchError) {
          console.log("🚀 ~ fetchData error:", fetchError);
        }
      }

      // Navigate after successful update
      navigate("/clothingItems/myItems");
    } catch (error) {
      console.log(error);
      window.Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        text: error.response?.data?.message || "An error occurred",
      });
    }
  };

  return (
    <div
      className="py-5"
      style={{ backgroundColor: "#FFF2EB", minHeight: "100vh" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <h1
              className="text-center mb-5"
              style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#333" }}
            >
              Edit Item
            </h1>

            <form
              onSubmit={handleSubmit}
              className="rounded p-5"
              style={{
                backgroundColor: "#FFE8CD",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "2rem",
                  borderRadius: "8px",
                }}
              >
                <SearchableDropdown
                  label="Brand"
                  value={brand_id}
                  onChange={setBrand}
                  options={brands}
                  placeholder="Select or search brand"
                  displayKey="brand_name"
                  valueKey="id"
                />

                <SearchableDropdown
                  label="Type"
                  value={type_id}
                  onChange={setType}
                  options={types}
                  placeholder="Select or search type"
                  displayKey="type_name"
                  valueKey="id"
                />

                <SearchableDropdown
                  label="Color"
                  value={color_id}
                  onChange={setColor}
                  options={colors}
                  placeholder="Select or search color"
                  displayKey="color_name"
                  valueKey="id"
                />

                <div className="mb-3">
                  <label
                    htmlFor="input-size"
                    className="form-label"
                    style={{ fontWeight: "600", color: "#333" }}
                  >
                    Size
                  </label>
                  <select
                    value={size}
                    onChange={(event) => setSize(event.target.value)}
                    className="form-select"
                    id="input-size"
                    style={{ borderColor: "#DDD", borderRadius: "4px" }}
                  >
                    <option value="">Select clothing size</option>
                    <option value="XSS">XSS</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="XXXL">XXXL</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="input-material"
                    className="form-label"
                    style={{ fontWeight: "600", color: "#333" }}
                  >
                    Material
                  </label>
                  <input
                    value={material}
                    onChange={(event) => setMaterial(event.target.value)}
                    type="text"
                    className="form-control"
                    id="input-material"
                    placeholder="Material"
                    style={{ borderColor: "#DDD", borderRadius: "4px" }}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="input-image-url"
                    className="form-label"
                    style={{ fontWeight: "600", color: "#333" }}
                  >
                    Image URL
                  </label>
                  <input
                    value={image_url}
                    onChange={(event) => setImageUrl(event.target.value)}
                    type="text"
                    className="form-control"
                    id="input-image-url"
                    placeholder="Image URL"
                    style={{ borderColor: "#DDD", borderRadius: "4px" }}
                  />
                  {image_url && (
                    <div className="mt-2">
                      <img
                        src={image_url}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          borderRadius: "4px",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="input-notes"
                    className="form-label"
                    style={{ fontWeight: "600", color: "#333" }}
                  >
                    Notes
                  </label>
                  <input
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    type="text"
                    className="form-control"
                    id="input-notes"
                    placeholder="Add notes"
                    style={{ borderColor: "#DDD", borderRadius: "4px" }}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="input-last-used"
                    className="form-label"
                    style={{ fontWeight: "600", color: "#333" }}
                  >
                    Last used
                  </label>
                  <input
                    value={last_used}
                    onChange={(event) => setLastUsed(event.target.value)}
                    type="date"
                    className="form-control"
                    id="input-last-used"
                    style={{ borderColor: "#DDD", borderRadius: "4px" }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100"
                  style={{
                    backgroundColor: "#FF8C42",
                    color: "#FFFFFF",
                    fontWeight: "600",
                    padding: "0.75rem",
                    borderRadius: "4px",
                    border: "none",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#E67E2E")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#FF8C42")
                  }
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
