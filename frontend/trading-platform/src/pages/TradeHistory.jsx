import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTrades } from '../services/api';
import './TradeHistory.css';

const TradeHistory = () => {
    const navigate = useNavigate();
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getTradeHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetchTrades(token);
                setTrades(response.data);
            } catch (err) {
                setError(err.response?.data || 'Failed to fetch trade history');
                console.error('Trade history error:', err);
            } finally {
                setLoading(false);
            }
        };

        getTradeHistory();
    }, [navigate]);

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleString(undefined, options);
    };

    const determineTradeType = (trade) => {
        const currentUser = localStorage.getItem('username'); // You'll need to store username during login
        if (trade.bid_user === trade.ask_user) return 'Self-trade';
        return currentUser === trade.bid_user ? 'Buy' : 'Sell';
    };

    if (loading) {
        return <div className="loading">Loading trade history...</div>;
    }

    return (
        <div className="trade-history-container">
            <div className="header">
                <h1>Trade History</h1>
                <button onClick={() => navigate('/')}>Back to Dashboard</button>
            </div>

            {error ? (
                <div className="error">Error: {JSON.stringify(error)}</div>
            ) : trades.length === 0 ? (
                <p>No trades found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="trades-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Stock</th>
                                <th>Price (₹)</th>
                                <th>Quantity</th>
                                <th>AskUser</th>
                                <th>BidUser</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map(trade => {
                                return (
                                    <tr key={trade.id}>
                                        <td>{formatDate(trade.created_at)}</td>
                                        <td>{trade.Token}</td>
                                        <td>{parseFloat(trade.price).toFixed(2)}</td>
                                        <td>{trade.quantity}</td>
                                        <td>{trade.ask_user}</td>
                                        <td>{trade.bid_user}</td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TradeHistory;