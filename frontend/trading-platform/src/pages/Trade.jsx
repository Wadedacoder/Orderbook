import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../services/api';


const Trade = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Token: 'RELIANCE', // Default to RELIANCE (will be dynamic later)
        price: '',
        quantity: '',
        listing_type: 'Buy' // Default to Buy
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hardcoded stocks list (will be dynamic later)
    const availableStocks = [

        {key: 'APPL', symbol: 'APPL' },
        {key: 'GGL', symbol: 'GGL' },
        {key: 'RELIANCE', symbol: 'RELIANCE' },
    
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Prepare payload
            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity)
            };

            await createListing(token, payload);
            alert('Trade executed successfully!');
            navigate('/'); // Return to dashboard after trade
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to execute trade');
            console.error('Trade error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="trade-container">
            <h1>Trade Stocks</h1>
            <button onClick={() => navigate('/')}>Back to Dashboard</button>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Stock:</label>
                    <select
                        name="Token"
                        value={formData.Token}
                        onChange={handleChange}
                        required
                    >
                        {availableStocks.map(stock => (
                            <option key={stock.symbol} value={stock.symbol}>
                                {stock.symbol}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Action:</label>
                    <select
                        name="listing_type"
                        value={formData.listing_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="Buy">Buy</option>
                        <option value="Sell">Sell</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0.01"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Quantity:</label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Execute Trade'}
                </button>
            </form>
        </div>
    );
};

export default Trade;