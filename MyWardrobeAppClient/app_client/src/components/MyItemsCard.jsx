import { useNavigate } from "react-router"

export default function ClothingItemCards({ item, handleOnDeleteCuisine }) {
    const navigate = useNavigate()
   
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
                src={item.imgUrl}
                className="card-img-top"
                alt={item.name}
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
                    {item.name}
                </h5>
                <p className="text-muted mb-2" style={{
                    fontSize: "0.85rem",
                    height: "2.6rem",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    lineHeight: "1.3"
                }}>
                    {item.description}
                </p>
                <p className="fw-bold mb-2" style={{
                    fontSize: "1.15rem",
                    color: "#28a745",
                    margin: "0"
                }}>
                    Rp{item.price}
                </p>
                <span className="badge mb-3" style={{
                    fontSize: "0.75rem",
                    width: "fit-content",
                    backgroundColor: "#6c757d",
                    padding: "0.25rem 0.7rem"
                }}>
                    {categoryName}
                </span>

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