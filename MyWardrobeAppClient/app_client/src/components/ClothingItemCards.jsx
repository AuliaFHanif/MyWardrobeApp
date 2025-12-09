import { useNavigate } from "react-router"

export default function ClothingItemCards( items) {
    const navigate = useNavigate()
    console.log(items);
    
    return (
        <div className="card" style={{
            width: "260px",
            height: "400px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            transition: "transform 0.2s, box-shadow 0.2s",
            border: "none",
            backgroundColor: "#fff"
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)"
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)"
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"
            }}>
                <img
                src={items.items.image_url}
                className="card-img-top"
                alt={items.items.name}
                style={{
                    height: "170px",
                    objectFit: "cover",
                    width: "100%"
                }}
            />
            <div className="card-body d-flex flex-column p-3" style={{ height: "230px" }}>
                <h5 className="card-title fw-bold mb-2" style={{
                    fontSize: "1.05rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "#333"
                }}>
                    {items.items.type.type_name}
                    <br />
                    {items.items.type.category}
                    <br />
                    {items.items.brand.brand_name}
                    <br />
                    {items.items.color.color_name}
                    <br />
                    
                </h5>
                <div className="mt-auto d-flex gap-2">
                    <button
                        onClick={() => navigate(`/cuisinedetails/${item.id}`)}
                        className="btn btn-warning flex-fill"
                        style={{ fontSize: "0.875rem", fontWeight: "500", padding: "0.5rem" }}>
                        Details
                    </button>

                </div>
            </div>
        </div>
    )
}