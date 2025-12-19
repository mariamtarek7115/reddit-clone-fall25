const summarizePost = async (req, res) => {
    try {
        let { text } = req.body;

        if (!text || text.length < 30) {
            return res.status(400).json({ error: "Text too short to summarize" });
        }

        // Clean input
        text = text
            .replace(/http\S+/g, "")
            .replace(/\s+/g, " ")
            .trim();

        // Limit tokens (important for HF API)
        if (text.length > 1024) {
            text = text.slice(0, 1024);
        }

        // Hugging Face Inference API endpoint
        // Using facebook/bart-large-cnn model for summarization
        const model = "facebook/bart-large-cnn";
        
        // Use the router endpoint
        const apiUrl = `https://router.huggingface.co/hf-inference/models/${model}`;
        
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: text,
                parameters: {
                    max_length: 100,
                    min_length: 30,
                    do_sample: false
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText || response.statusText };
            }
            throw new Error(errorData.error || errorData.message || `HF API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Handle HF API response format
        let summary;
        if (Array.isArray(data) && data[0]?.summary_text) {
            summary = data[0].summary_text;
        } else if (data.summary_text) {
            summary = data.summary_text;
        } else if (data[0]?.generated_text) {
            summary = data[0].generated_text;
        } else {
            throw new Error("Unexpected response format from HF API");
        }

        res.status(200).json({ summary });

    } catch (err) {
        console.error("AI summarize error:", err);
        res.status(500).json({ 
            error: "AI summarization failed", 
            details: err.message 
        });
    }
};

module.exports = {
    summarizePost
};