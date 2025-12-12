import { useNavigate, useParams } from "react-router";
import { useState, useRef, useEffect } from "react";
import { phase2Api } from "../helpers/http.client";
import { useSelector, useDispatch } from "react-redux";
import { fetchEditItemData, updateItem, setFormField, resetForm } from "../features/clothing/editItemSlice";


function getNestedValue(obj, path) {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
}


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


  const selectedOption = options.find((opt) => opt[valueKey] === value);
  const displayValue = selectedOption
    ? getNestedValue(selectedOption, displayKey)
    : "";

  const filtered = options.filter((option) =>
    getNestedValue(option, displayKey)
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );


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

export default function EditItem({}) {
  const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();

 
    const { 
        formData, 
        brands, 
        types, 
        colors, 
        status, 
        error 
    } = useSelector((state) => state.editItem);

   
    useEffect(() => {
        dispatch(fetchEditItemData(id));
        
     
        return () => {
            dispatch(resetForm());
        };
    }, [id, dispatch]);

 
    const handleChange = (name, value) => {
        dispatch(setFormField({ name, value }));
    };


    const handleSubmit = async (event) => {
        event.preventDefault();

        
        const resultAction = await dispatch(updateItem({ id, data: formData }));

        if (updateItem.fulfilled.match(resultAction)) {
        
            navigate("/clothingItems/myItems");
        } else {
        
            Swal.fire({
                icon: "error",
                title: "Something Went Wrong",
                text: typeof resultAction.payload === 'string' ? resultAction.payload : resultAction.payload?.message || "An error occurred",
            });
        }
    };

    if (status === 'loading') {
        return <div className="text-center py-5">Loading...</div>;
    }

    if (status === 'failed') {
        return <div className="text-center py-5 text-danger">Error: {error}</div>;
    }
  return (
        <div className="py-5" style={{ backgroundColor: "#FFF2EB", minHeight: "100vh" }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <h1 className="text-center mb-5" style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#333" }}>
                            Edit Item
                        </h1>

                        <form onSubmit={handleSubmit} className="rounded p-5" style={{ backgroundColor: "#FFE8CD", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                            <div style={{ backgroundColor: "#FFFFFF", padding: "2rem", borderRadius: "8px" }}>
                                
                                <SearchableDropdown
                                    label="Brand"
                                    value={formData.brand_id}
                                    onChange={(val) => handleChange('brand_id', val)}
                                    options={brands}
                                    placeholder="Select or search brand"
                                    displayKey="brand_name"
                                    valueKey="id"
                                />

                                <SearchableDropdown
                                    label="Type"
                                    value={formData.type_id}
                                    onChange={(val) => handleChange('type_id', val)}
                                    options={types}
                                    placeholder="Select or search type"
                                    displayKey="type_name"
                                    valueKey="id"
                                />

                                <SearchableDropdown
                                    label="Color"
                                    value={formData.color_id}
                                    onChange={(val) => handleChange('color_id', val)}
                                    options={colors}
                                    placeholder="Select or search color"
                                    displayKey="color_name"
                                    valueKey="id"
                                />

                                <div className="mb-3">
                                    <label htmlFor="input-size" className="form-label" style={{ fontWeight: "600", color: "#333" }}>Size</label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => handleChange('size', e.target.value)}
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
                                    <label htmlFor="input-material" className="form-label" style={{ fontWeight: "600", color: "#333" }}>Material</label>
                                    <input
                                        value={formData.material}
                                        onChange={(e) => handleChange('material', e.target.value)}
                                        type="text"
                                        className="form-control"
                                        id="input-material"
                                        placeholder="Material"
                                        style={{ borderColor: "#DDD", borderRadius: "4px" }}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="input-image-url" className="form-label" style={{ fontWeight: "600", color: "#333" }}>Image URL</label>
                                    <input
                                        value={formData.image_url}
                                        onChange={(e) => handleChange('image_url', e.target.value)}
                                        type="text"
                                        className="form-control"
                                        id="input-image-url"
                                        placeholder="Image URL"
                                        style={{ borderColor: "#DDD", borderRadius: "4px" }}
                                    />
                                    {formData.image_url && (
                                        <div className="mt-2">
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "4px" }}
                                                onError={(e) => { e.target.style.display = "none"; }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="input-notes" className="form-label" style={{ fontWeight: "600", color: "#333" }}>Notes</label>
                                    <input
                                        value={formData.notes}
                                        onChange={(e) => handleChange('notes', e.target.value)}
                                        type="text"
                                        className="form-control"
                                        id="input-notes"
                                        placeholder="Add notes"
                                        style={{ borderColor: "#DDD", borderRadius: "4px" }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="input-last-used" className="form-label" style={{ fontWeight: "600", color: "#333" }}>Last used</label>
                                    <input
                                        value={formData.last_used}
                                        onChange={(e) => handleChange('last_used', e.target.value)}
                                        type="date"
                                        className="form-control"
                                        id="input-last-used"
                                        style={{ borderColor: "#DDD", borderRadius: "4px" }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="btn w-100"
                                    style={{
                                        backgroundColor: "#FF8C42",
                                        color: "#FFFFFF",
                                        fontWeight: "600",
                                        padding: "0.75rem",
                                        borderRadius: "4px",
                                        border: "none",
                                        fontSize: "1rem",
                                        cursor: status === 'submitting' ? "not-allowed" : "pointer",
                                    }}
                                    onMouseOver={(e) => (e.target.style.backgroundColor = "#E67E2E")}
                                    onMouseOut={(e) => (e.target.style.backgroundColor = "#FF8C42")}
                                >
                                    {status === 'submitting' ? 'Updating...' : 'Update Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
