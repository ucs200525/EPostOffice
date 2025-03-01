import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, googleLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password, rememberMe);
            if (result.success) {
                if (result.redirectToAddress) {
                    navigate('/customer/address');
                } else {
                    navigate('/customer/home');
                }
            } else {
                setError(result.error || 'Failed to log in');
            }
        } catch (error) {
            setError('Failed to log in');
        }

        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            const result = await googleLogin();
            if (result.success) {
                if (result.redirectToAddress) {
                    navigate('/customer/address');
                } else {
                    navigate('/customer/home');
                }
            } else {
                setError(result.error || 'Failed to log in with Google');
            }
        } catch (error) {
            setError('Failed to log in with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Customer Login</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Remember me"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                </Form.Group>

                                <Button
                                    className="w-100 mb-3"
                                    type="submit"
                                    disabled={loading}
                                >
                                    Log In
                                </Button>

                                <Button
                                    variant="outline-dark"
                                    className="w-100 mb-3"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                >
                                    <FcGoogle className="me-2" size={20} />
                                    Continue with Google
                                </Button>
                            </Form>

                            <div className="text-center mt-3">
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </div>
                            <div className="text-center mt-2">
                                Don't have an account? <Link to="/register">Register</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
