// This file would integrate with your Python fraud detection services
// For demo purposes, we'll just define the interfaces and mock implementations

export 

export 

export 

export 

export async function detectFraud<FraudDetectionResult> {
  try {
    const response = await fetch("/api/fraud/detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ transaction }),
    })

    if (!response.ok) {
      throw new Error("Fraud detection failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error detecting fraud:", error)
    throw error
  }
}

export async function batchDetectFraud<BatchResult> {
  try {
    const response = await fetch("/api/fraud/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ transactions }),
    })

    if (!response.ok) {
      throw new Error("Batch fraud detection failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in batch detection:", error)
    throw error
  }
}

