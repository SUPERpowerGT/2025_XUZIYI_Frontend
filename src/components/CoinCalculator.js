import React, { useState } from "react";
import "./CoinCalculator.css";

function CoinCalculator() {
    const [targetAmount, setTargetAmount] = useState("");
    const [denominations, setDenominations] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        const payload = {
            targetAmount: parseFloat(targetAmount),
            denominations: denominations.split(",").map((value) => parseFloat(value.trim())),
        };

        try {
            const response = await fetch("api/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || "Request failed");
            }

            const data = await response.json();
            setResult(data.coinsUsed);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="calculator-container">
            <h1>Coin Calculator</h1>
            <div className="rules">
                <h2>Game Rules</h2>
                <ul>
                    <li>Target amount: Must be between 0 and 10,000.00.</li>
                    <li>Coin denominations: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 50, 100, 1000]</li>
                </ul>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Target Amount:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Coin Denominations (comma-separated):</label>
                    <input
                        type="text"
                        value={denominations}
                        onChange={(e) => setDenominations(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Calculate</button>
            </form>

            {result && (
                <div className="result">
                    <h2>Result:</h2>
                    <p>{result.join(", ")}</p>
                </div>
            )}

            {error && (
                <div className="error">
                    <h2>Error:</h2>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

export default CoinCalculator;
