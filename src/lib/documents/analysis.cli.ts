import { command, firstArgument, flag } from "../../services/simple-cli/cli";
import { getPlatform } from "../../services/simple-cli/platform";
import { analyzeDocument } from "./analysis";
import { readFile } from "fs/promises";

if (
  command(
    "analyze",
    "Analyze a document to extract type and expiry date",
    "<file-path>",
  )
) {
  const filePath = firstArgument();
  const isRemote = flag("remote", "Use remote production database");

  if (!filePath) {
    console.error("Error: file path is required");
    console.log("\nUsage: analyze <file-path> [--remote]");
    process.exit(1);
  }

  const platform = await getPlatform(isRemote ? "production" : "local");

  try {
    console.log(`Analyzing document: ${filePath}`);

    const fileBuffer = await readFile(filePath);
    const fileName = filePath.split("/").pop() || "document";

    let mimeType = "application/octet-stream";
    if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (fileName.endsWith(".png")) {
      mimeType = "image/png";
    } else if (fileName.endsWith(".pdf")) {
      mimeType = "application/pdf";
    }

    const file = new File([fileBuffer], fileName, { type: mimeType });

    const result = await analyzeDocument(
      { env: { GEMINI_API_KEY: platform.env.GEMINI_API_KEY as string } },
      file,
    );

    console.log("\n=== Analysis Result ===");
    console.log(JSON.stringify(result, null, 2));

    if (result.documentType) {
      console.log(`\nDocument Type: ${result.documentType}`);
    } else {
      console.log("\nDocument Type: Could not be determined");
    }

    if (result.expiryDate) {
      console.log(`Expiry Date: ${result.expiryDate}`);
    } else {
      console.log("Expiry Date: Not found");
    }

    console.log(`Confidence: ${result.confidence}`);

    if (result.notes) {
      console.log(`Notes: ${result.notes}`);
    }

    platform.dispose();
  } catch (error) {
    console.error("Error analyzing document:", error);
    platform.dispose();
    process.exit(1);
  }
}
