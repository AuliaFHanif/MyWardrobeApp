import { useState } from "react";
import { phase2Api } from '../helpers/http.client'
import { Navigate, useNavigate } from "react-router"

export default function LoginPage() {
    let navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    async function handleLogin(event) {
        event.preventDefault()

        try {
            const response = await phase2Api.post("/login", {
                email,
                password
            })

            const token = response.data.access_token
            localStorage.setItem("access_token", token)
            navigate('/cuisines')
        } catch (error) {
            window.Swal.fire({
                icon: "error",
                title: "Something Went Wrong",
                text: error.response.data.message
            })
        }
    }

    return (
        <section id="login-page" style={{
            backgroundColor: '#FFF2EB',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="container-sm">
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h3 className="text-center mb-4" style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        Welcome To Restaurant App
                    </h3>
                    <div style={{
                        backgroundColor: '#FFE8CD',
                        borderRadius: '12px',
                        padding: '2.5rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        <h4 className="text-center mb-4" style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            Login
                        </h4>
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label htmlFor="login-email" className="form-label" style={{
                                    fontWeight: '500',
                                    color: '#333'
                                }}>
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="login-email"
                                    aria-describedby="emailHelp"
                                    autoComplete="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd'
                                    }}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="login-password" className="form-label" style={{
                                    fontWeight: '500',
                                    color: '#333'
                                }}>
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="login-password"
                                    autoComplete="current-password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd'
                                    }}
                                    placeholder="Enter your password"
                                />
                            </div>
                            <div className="d-flex justify-content-center">
                                <button type="submit" className="btn btn-primary w-100" style={{
                                    padding: '0.75rem',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    borderRadius: '8px',
                                    backgroundColor: '#007bff',
                                    border: 'none'
                                }}>
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );

}