const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const { analyzeBankStatement } = require("./services/smeRiskAnalysisService");

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

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
    res.send(`
    <html>
      <head>
        <title>SME Credit Risk Assessment API</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            background: #0f172a;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }

          .container {
            text-align: center;
          }

          h1 {
            margin-bottom: 10px;
          }

          p {
            color: #cbd5e1;
            margin-bottom: 30px;
          }

          a {
            text-decoration: none;
            background: #2563eb;
            color: white;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 18px;
          }

          a:hover {
            background: #1d4ed8;
          }
        </style>
      </head>

      <body>
        <div class="container">
          <h1>SME Credit Risk Assessment API</h1>

          <p>
            Upload SME bank statement CSVs and generate
            counterparty concentration risk analysis.
          </p>

          <a href="/docs">
            Open Swagger UI
          </a>
        </div>
      </body>
    </html>
  `);
});

/**
 * @swagger
 * /analyze:
 *   post:
 *     summary: Analyze bank statements endpoint to assess SME credit risk.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Upload CSV bank statement file
 *     responses:
 *       200:
 *         description: Counterparty concentration report generated successfully.
 *       400:
 *         description: Bad request - invalid file format or CSV file missing.
 *       500:
 *         description: Internal server error - failed to process the file.
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
        .pipe(csv())
        .on("data", (row) => {
            rows.push(row);
        })
        .on("end", async () => {
            try {
                fs.unlinkSync(req.file.path);

                const report = analyzeBankStatement(rows);

                console.log("Rows parsed:", rows.length);
                console.log("Report generated:", report);

                return res.status(200).json(report);
            } catch (error) {
                console.error("Error analyzing CSV:", error);
                
                return res.status(500).json({
                    error: "Failed to analyze bank statement.",
                    details: error.message
                });
            }
        });
    } catch (error) {

        // Handle any errors that occur during file processing
        console.error("Error processing file:", error);
        res.status(500).json({ error: "Failed to process the CSV file." });
    }
});

app.listen(PORT, () => {
    // Log a message to indicate that the server is running
    console.log(`SME Credit Risk Analysis API is running : http://localhost:${PORT}`);
});