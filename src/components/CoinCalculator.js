import React, { useState } from "react";

function CoinCalculator() {
    const [targetAmount, setTargetAmount] = useState("");
    const [denominations, setDenominations] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // 提交表单时调用后端服务
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);

        // 准备请求数据
        const payload = {
            targetAmount: parseFloat(targetAmount),
            denominations: denominations.split(",").map((value) => parseFloat(value.trim())),
        };

        try {
            // 调用后端 API
            const response = await fetch("http://localhost:8080/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(errorMessage || "请求失败");
            }

            const data = await response.json();
            setResult(data.coinsUsed);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>硬币计算器</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        目标金额:
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
                        硬币面值 (用逗号分隔):
                        <input
                            type="text"
                            value={denominations}
                            onChange={(e) => setDenominations(e.target.value)}
                            required
                        />
                    </label>
                </div>
                <button type="submit">计算</button>
            </form>

            {result && (
                <div>
                    <h2>结果：</h2>
                    <p>{result.join(", ")}</p>
                </div>
            )}

            {error && (
                <div>
                    <h2>错误：</h2>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

export default CoinCalculator;
