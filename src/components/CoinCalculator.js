import React, { useState } from "react";

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
            const response = await fetch("http://localhost:8080/calculate", {
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
        <div style={{ padding: "20px" }}>
            <h1>Coin Calculator</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Target Amount:
                        <input
                            type="number"
                            step="0.01"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Coin Denominations (comma-separated):
                        <input
                            type="text"
                            value={denominations}
                            onChange={(e) => setDenominations(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <button type="submit">Calculate</button>
            </form>

            {result && (
                <div>
                    <h2>Result:</h2>
                    <p>{result.join(", ")}</p>
                </div>
            )}

            {error && (
                <div>
                    <h2>Error:</h2>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

export default CoinCalculator;
