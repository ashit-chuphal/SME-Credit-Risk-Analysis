const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parses");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const { analyzeBankStatements } = require("./services/smeRiskAnalysisService");

const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/"});

const swaggerSpec = swaggerJsDoc({
    definition: {
        openapi: "3.1.0",
        info: {
            title: "SME Credit Risk Analysis API",
            version: "1.0.0",
            description: "API for analyzing SME credit risk based on bank statement data"
        },
    },
    apis: ["./src/index.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *    summary: Check API health
 *    responses:
 *        200:
 *          description: Service is healthy
 *        500:
 *          description: Service is unhealthy
 */
app.get("/health", (req, res) => {
    const isServiceHealth = true; // Placeholder for actual health check logic
    if (! isServiceHealth) {
        return res.status(500).json({
            status: "DOWN",
            service: "SME Credit Risk Analysis API",
        });
    }

    return res.status(200).json({
        status: "UP",
        service: "SME Credit Risk Analysis API",
    }); 
});

app.get("/", (req, res) => {
    res.send("Welcome to the SME Credit Risk Analysis API. Please refer to /api-docs for API documentation.");
});

/** 
 * @swagger
 * / analyze:
 *  post:
 *   summary: Analyze bank statements endpoint to assess SME credit risk.
 *   requestBody:
 *    required: true
 *   content:
 *    multipart/form-data:
 *     schema:
 *      type: object
 *      properties:
 *        file:
 *         type: string
 *         format: binary
 *  responses:
 *   200:
 *    description: Counterpart concentration report generated successfully.
 *   400:
 *    description: Bad request - invalid file format or CSV file missing.
 *   500:
 *    description: Internal server error - failed to process the file.
 */
app.post("/analyze", upload.single("file"), async (req, res) => {
    
    // Validate that a file was uploaded
    if (! req.file) {
        return res.status(400).json({ error: "CSV file is required. Upload using form-data key 'file'" });
    }

    // Continue with file processing logic
    try {
        const rows = [];

        // Read the uploaded CSV file and parse its contents
        fs.createReadStream(req.file.path)
        pipe(csv())
        .on("data", (row) => {
            rows.push(row);
        })
        .on("end", async () => {
            // Remove the uploaded file after processing
            fs.unlinkSync(req.file.path);

            // Call the analysis function with the parsed CSV data
            const analysisResult = await analyzeBankStatements(rows);
            
            // Return the analysis result as JSON response
            res.json(analysisResult);
        });
    } catch (error) {

        // Handle any errors that occur during file processing
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Failed to process the CSV file." });
    }
});

app.listen(PORT, () => {
    // Log a message to indicate that the server is running
    console.log(`SME Credit Risk Analysis API is running : https://localhost:${PORT}`);
});