import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";

export default function Navbar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsAuthenticated(!!token);
    }, []);

    function handleLogout() {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
        navigate("/login");
    }

    function handleLogin() {
        navigate("/login");
    }

    return (
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#FFD6BA', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div className="container">
                <div className="navbar-brand fw-bold" style={{ color: '#8B4513' }}>
                    My Wardrobe App
                </div>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    style={{ borderColor: '#8B4513' }}
                >
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold" aria-current="page" to="/clothingItems" style={{ color: '#6B3410' }}>
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold" aria-current="page" to="/clothingItems/myItems" style={{ color: '#6B3410' }}>
                                My Clothing Items
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold" aria-current="page" to="/clothingItems/myItems/add" style={{ color: '#6B3410' }}>
                                Add Clothing Item
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold" aria-current="page" to="/clothingItems/outfitSuggestions" style={{ color: '#6B3410' }}>
                                Outfit suggestions
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fw-semibold" aria-current="page" to="/admin" style={{ color: '#6B3410' }}>
                                Admin dashboard
                            </Link>
                        </li>
                    </ul>
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="btn"
                            style={{
                                backgroundColor: '#fe4d4dff',
                                color: '#470000ff',
                                border: '2px solid #FFD6BA',
                                fontWeight: '600'
                            }}
                        >
                            Logout
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="btn"
                            style={{
                                backgroundColor: '#fe4d4dff',
                                color: '#470000ff',
                                border: '2px solid #FFD6BA',
                                fontWeight: '600'
                            }}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}