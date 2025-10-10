const { generateText, generateObject } = require("ai")
const { google } = require("@ai-sdk/google")
const { z } = require("zod")

// Initialize the Google Gemini model
const gemini = google("gemini-2.0-flash")

// Schema for a single product analysis
const SingleProductSchema = z.object({
  name: z
    .string()
    .describe(
      "The detailed name of the product including key specifications like storage, RAM, etc. (e.g., 'iPhone 15 Pro Max 128GB', 'Dell Latitude 16GB RAM 512GB SSD').",
    ),
  description: z
    .string()
    .describe(
      "A detailed description of the product, including all specifications like RAM, SSD, processor, screen size, features (e.g., keyboard light, fingerprint unlock, Face ID), and any other relevant details mentioned.",
    ),
  price: z
    .number()
    .nullable()
    .describe("The numerical price of the product, extracted from the text. If no price is found, it should be null."),
  category: z
    .string()
    .describe("The most appropriate category for the product (e.g., 'Laptop', 'Smartphone', 'Headphones')."),
  brand: z.string().describe("The brand of the product (e.g., 'Lenovo', 'Apple', 'Samsung')."),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("A confidence score (0-1) indicating how certain the AI is about the extracted product details."),
  videoUrl: z.string().nullable().describe("YouTube embed URL for product review video"),
})

// Schema for multiple product analyses
const MultipleProductAnalysisSchema = z.object({
  products: z.array(SingleProductSchema).describe("An array of distinct products identified in the message."),
})

/**
 * Searches YouTube for a product review video and returns the embed URL
 */
async function searchYouTubeReview(productName) {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      console.error("YouTube API key not found")
      return null
    }

    const searchQuery = encodeURIComponent(`${productName} review`)
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=1&key=${apiKey}`

    console.log(`Searching YouTube for: ${productName}`)
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId
      const embedUrl = `https://www.youtube.com/embed/${videoId}`
      console.log(`Found YouTube video for ${productName}: ${embedUrl}`)
      return embedUrl
    }

    console.log(`No YouTube video found for: ${productName}`)
    return null
  } catch (error) {
    console.error("Error searching YouTube:", error)
    return null
  }
}

/**
 * Analyzes a WhatsApp message that may contain multiple product listings
 * and an associated image.
 * @param imageDataBase64 Base64 encoded image data URL (e.g., "data:image/jpeg;base64,...").
 * @param messageText The text content of the WhatsApp message.
 * @returns An array of product analyses, each containing name, description, price, category, brand, and confidence.
 */
async function analyzeMultipleProducts(imageDataBase64, messageText) {
  try {
    console.log("Analyzing multiple products with Gemini...")

    const { object } = await generateObject({
      model: gemini,
      schema: MultipleProductAnalysisSchema,
      prompt: `You are an expert e-commerce merchandiser and product cataloger. Analyze the following WhatsApp message, which may contain descriptions for one or more electronic gadgets.

      For each distinct product, extract:
      - A detailed, specific name including key specs (storage, RAM, model).
      - A persuasive, conversion-focused description that BOTH lists key specifications (processor, RAM, SSD, screen size, notable features like keyboard light, fingerprint unlock, Face ID, battery health, condition, etc.) AND sells the benefits.
        • Start with 1–2 concise sentences highlighting benefits, ideal user, and what makes it a great buy.
        • Then include a compact spec rundown in natural language (not a bullet list), keeping it readable for shoppers.
        • Include trust builders when applicable: warranty/return policy (if present in text or from context), seller reliability, and usage scenario.
        • Keep tone friendly and confident; avoid hype words like “best in the world”.
      - Its numerical price (or null if price isn’t present).
      - The most appropriate category.
      - The brand.
      - A confidence score (0–1).

      The output must strictly match the schema. Do NOT add fields.

      Message Text:
      ${messageText}

      Image Data (if relevant, use for context but prioritize text for specs):
      ${imageDataBase64 ? "Image is present. Use it to infer product type if text is ambiguous." : "No image provided."}

      Example of expected output for multiple products:
      _Lenovo ThinkPad X390 || Intel Core i5-10210U 10th Generation || 8GB Ram || 256GB SSD || 14" FHD || 2.10GHz || Keyboard Light || Fingerprint Unlock || ₦320,000
      Lenovo ThinkPad X13 || Intel Core i5-10310U 10th Generation || 8GB Ram || 256GB SSD || 14" FHD || 2.30GHz || Keyboard Light || Fingerprint Unlock & Face ID Unlock || ₦340,000_

      Should be parsed as:
      {
        products: [
          {
            name: "Lenovo ThinkPad X390 8GB RAM 256GB SSD",
            description: "Built for reliable performance at work and school, this ThinkPad balances speed and portability with an excellent keyboard and security features. Intel Core i5-10210U 10th Generation, 8GB RAM, 256GB SSD, 14\" FHD display, 2.10GHz; Keyboard Light and Fingerprint Unlock included.",
            price: 320000,
            category: "Laptop",
            confidence: 0.95,
            videoUrl: null
          },
          {
            name: "Lenovo ThinkPad X13 8GB RAM 256GB SSD",
            description: "Transform your workday with this powerful, portable ThinkPad X13. Enjoy seamless performance with 10th-gen Intel Core i5 processing, ample 8GB RAM, and rapid 256GB SSD storage. Plus, stay productive with a crisp 14\" FHD display, Keyboard Light, and advanced Fingerprint & Face ID Unlock security.",
      price: 340000,
      category: "Laptop",
      brand: "Lenovo",
      confidence: 0.95,
      videoUrl: null
      ]
      }

      Make sure to include key specifications in the product name for better identification.`,
    })
    console.log("Gemini analysis complete.")

    // Search for YouTube videos for each product
    const productsWithVideos = await Promise.all(
      object.products.map(async (product) => {
        const videoUrl = await searchYouTubeReview(product.name)
        return {
          ...product,
          videoUrl,
        }
      }),
    )

    return productsWithVideos
  } catch (error) {
    console.error("Error analyzing multiple products with Gemini:", error)
    throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Analyzes a single product image and generates a description.
 * This is kept separate for cases where only image analysis is needed or for single product messages.
 * @param imageUrl The URL of the image to analyze.
 * @returns A string description of the image content.
 */
async function analyzeProductImage(imageUrl) {
  try {
    console.log("Analyzing product image with Gemini...")

    const { text } = await generateText({
      model: gemini,
      prompt:
        "Write a short, persuasive product blurb for the electronic gadget in this image that helps it SELL.\n" +
        "Start with 1–2 sentences highlighting benefits, ideal user, and what makes it a great buy.\n" +
        "Then naturally mention key visible specs/features (e.g., display size, ports, camera layout, materials, condition) without bullets.\n" +
        "Keep it under 80–100 words, confident tone, no overhype.",
      // Note: For image analysis, you would need to pass the image data to the model
      // This is a simplified version - you may need to adjust based on the AI SDK's image handling
    })

    console.log("Image analysis complete.")
    return text
  } catch (error) {
    console.error("Error analyzing product image with Gemini:", error)
    return "Could not analyze image."
  }
}

/**
 * Selects the best category ID from a list of available categories based on product name and AI's initial suggestion.
 * @param productName The name of the product.
 * @param aiCategorySuggestion The category suggested by the AI.
 * @param availableCategories An array of available categories from your backend.
 * @returns The ID of the best matching category, or null if no suitable category is found.
 */
async function selectBestCategory(productName, aiCategorySuggestion, availableCategories) {
  try {
    console.log("Selecting best category with Gemini...")

    const { text } = await generateText({
      model: gemini,
      prompt: `Given the product name "${productName}" and the AI's initial category suggestion "${aiCategorySuggestion}", choose the best matching category ID from the following list of available categories. Respond ONLY with the category ID. If no perfect match, choose the closest one. If still unsure, pick a general "Accessories" or "Other" category if available, otherwise return an empty string.

      Available Categories (ID: Title):
      ${availableCategories.map((cat) => `${cat._id}: ${cat.title}`).join("\n")}

      Example:
      Product: "iPhone 15 Pro Max", AI Suggestion: "Smartphone"
      Available: "cat123: Smartphones", "cat456: Laptops"
      Output: cat123

      Product: "Gaming Mouse", AI Suggestion: "Gaming Accessories"
      Available: "cat789: Gaming", "cat101: Accessories"
      Output: cat789 (or cat101 if Gaming is not a direct match)`,
    })

    console.log("Category selection complete.")
    const selectedId = text.trim()

    // Validate if the selected ID actually exists in the available categories
    if (availableCategories.some((cat) => cat._id === selectedId)) {
      return selectedId
    }

    return null // Return null if the AI's choice is not a valid ID
  } catch (error) {
    console.error("Error selecting best category with Gemini:", error)
    return null
  }
}

/**
 * Extracts a numerical price from a given text string.
 * @param text The text from which to extract the price.
 * @returns The extracted numerical price, or null if no valid price is found.
 */
async function extractPriceFromText(text) {
  try {
    console.log("Extracting price from text with Gemini...")

    const { text: priceText } = await generateText({
      model: gemini,
      prompt: `Extract the numerical price from the following text. If a currency symbol like '₦' or '$' is present, ignore it. If a price range is given, extract the lower bound. If no clear numerical price is present, respond with "null". Respond ONLY with the number or "null".

      Text: "${text}"

      Examples:
      "Laptop for ₦320,000" -> 320000
      "Price: $1,200.50" -> 1200.50
      "Starting from 50000" -> 50000
      "Best offer" -> null`,
    })

    const cleanedPriceText = priceText.trim().replace(/[^0-9.]/g, "") // Remove non-numeric characters except dot
    const price = Number.parseFloat(cleanedPriceText)

    if (isNaN(price)) {
      return null
    }

    return price
  } catch (error) {
    console.error("Error extracting price from text with Gemini:", error)
    return null
  }
}

// =====================
// Product comparison API
// =====================
const ProductComparisonSchema = z.object({
  isMatch: z.boolean(),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
})

async function compareProducts(newProduct, existingProduct) {
  const prompt = `You are a product matching expert for an electronics e-commerce platform.

Compare these two products and determine if they are THE SAME product (not just similar, but EXACTLY the same product that might be worded differently).

NEW PRODUCT:
Name: ${newProduct.productName}
Description: ${newProduct.description}

EXISTING PRODUCT:
Name: ${existingProduct.title}
Description: ${existingProduct.description}

For a MATCH (respond true), ALL of these MUST be identical when present in either description or title:
1. Brand must be exactly the same (Apple, Samsung, Dell, etc.)
2. Model/Series must be exactly the same (e.g., "16 Pro Max" vs "16 Pro" = NO MATCH)
3. Storage capacity must be exactly the same (e.g., "256GB" vs "128GB" = NO MATCH)
4. If RAM is specified in either, it must match (e.g., "8GB RAM" vs "6GB RAM" = NO MATCH)
5. Processor generation should match if specified (e.g., "i7 12th Gen" vs "i7 11th Gen" = NO MATCH)
6. Screen size should match if specified (e.g., "15.6 inch" vs "14 inch" = NO MATCH)

Minor differences that ARE allowed:
- Different wording for same thing (e.g., "Unlocked" vs "Factory Unlocked")
- Different condition descriptions (e.g., "Brand New" vs "New")
- Color differences (these are considered the same product)
- Additional or missing warranty details
- E-sim vs Physical sim (if same model)

EXAMPLES:
Match: "Brand New iPhone 16 Pro Max 256GB" vs "iPhone 16 Pro Max 256GB Unlocked"
No Match: "iPhone 16 Pro Max 256GB" vs "iPhone 16 Pro Max 128GB" (different storage)
No Match: "iPhone 16 Pro Max" vs "iPhone 16 Pro" (different model)

Return a JSON object with this EXACT structure:
{
  "isMatch": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "Detailed explanation of why it's a match or not"
}

Be STRICT: If key specifications differ, confidence should be < 0.75. If some specs are absent in both, infer cautiously from model naming. Do not penalize color differences.`

  try {
    const { object } = await generateObject({
      model: gemini,
      schema: ProductComparisonSchema,
      prompt,
    })

    return {
      isMatch: object.isMatch,
      confidence: object.confidence,
      reasoning: object.reasoning,
    }
  } catch (error) {
    console.error("Error comparing products:", error)
    return {
      isMatch: false,
      confidence: 0,
      reasoning: `Error during comparison: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

 
module.exports = {
  analyzeMultipleProducts,
  analyzeProductImage,
  selectBestCategory,
  extractPriceFromText,
  compareProducts,
}
