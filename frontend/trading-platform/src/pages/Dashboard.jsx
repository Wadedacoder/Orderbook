import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchListings } from '../services/api';
import './Dashboard.css';

const Dashboard = ({ setToken }) => {
    const navigate = useNavigate();
    const [token] = useState(() => localStorage.getItem('token'));
    const [listings, setListings] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [controller] = useState(new AbortController());

    const buyListings = listings.filter(listing => listing.listing_type === 'Buy');
    const sellListings = listings.filter(listing => listing.listing_type === 'Sell');

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        controller.abort();
        navigate('/login', { replace: true });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString(undefined, options);
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetchListings(token, { signal: controller.signal });
            setListings(response.data);
            setError(null);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Failed to fetch listings');
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, controller]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetchData();

        return () => {
            controller.abort();
        };
    }, [token, navigate, fetchData, controller]);

    if (!token) return null;

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <div className="button-group">
                        <button onClick={() => navigate('/trade')}>New Trade</button>
                        <button onClick={() => navigate('/trade-history')}>Trade History</button>
                        <button onClick={fetchData}>Refresh</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
                <div className="error-message">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="button-group">
                    <button onClick={() => navigate('/trade')}>New Trade</button>
                    <button onClick={() => navigate('/trade-history')}>Trade History</button>
                    <button onClick={fetchData}>Refresh</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {isLoading ? (
                <p>Loading listings...</p>
            ) : (
                <div className="listings-container">
                    {/* Buy Section */}
                    <div className="listing-section">
                        <h2 className="buy-header">Buy Orders ({buyListings.length})</h2>
                        {buyListings.length > 0 ? (
                            <table className="listings-table">
                                <thead>
                                    <tr>
                                        <th>Stock</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Created</th>
                                        <th>Status</th>
                                        <th>User</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {buyListings.map((listing) => (
                                        <tr key={`buy-${listing.id}`}>
                                            <td>{listing.Token}</td>
                                            <td>₹{parseFloat(listing.price).toFixed(2)}</td>
                                            <td>{listing.quantity}</td>
                                            <td>{formatDate(listing.created_at)}</td>
                                            <td className={`status-${listing.listing_status.toLowerCase()}`}>
                                                {listing.listing_status}
                                            </td>
                                            <td>{listing.User}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No buy orders available.</p>
                        )}
                    </div>

                    {/* Sell Section */}
                    <div className="listing-section">
                        <h2 className="sell-header">Sell Orders ({sellListings.length})</h2>
                        {sellListings.length > 0 ? (
                            <table className="listings-table">
                                <thead>
                                    <tr>
                                        <th>Stock</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Created</th>
                                        <th>Status</th>
                                        <th>User</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sellListings.map((listing) => (
                                        <tr key={`sell-${listing.id}`}>
                                            <td>{listing.Token}</td>
                                            <td>₹{parseFloat(listing.price).toFixed(2)}</td>
                                            <td>{listing.quantity}</td>
                                            <td>{formatDate(listing.created_at)}</td>
                                            <td className={`status-${listing.listing_status.toLowerCase()}`}>
                                                {listing.listing_status}
                                            </td>
                                            <td>{listing.User}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No sell orders available.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
