const { selectBestCategory, analyzeMultipleProducts, compareProducts } = require("./ai-service")
const { getCategories, createProduct, getProducts, updateProduct } = require("./api-client")

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}
// Function to calculate the original selling price
function calculateOriginalPrice(cp) {
  if (cp < 10000) {
    return cp + 2000
  } else if (cp >= 10000 && cp < 100000) {
    return cp + 5000
  } else if (cp >= 100000 && cp <= 1500000) {
    let profit = cp * 0.04 // 4%
    profit = Math.min(Math.max(profit, 5000), 50000) // clamp between 5k and 50k
    return cp + profit
  } else {
    return cp + 50000 // flat max profit
  }
}

// Function to calculate the discounted selling price
function calculateDiscountedPrice(cp, vendorId) {
  // Only apply discount for specific vendor ID, otherwise return cost price
  if (vendorId !== '65afa65efcb2e4a192d771db') {
    return cp;
  }
  
  if (cp < 10000) {
    return cp + 1000
  } else if (cp >= 10000 && cp < 100000) {
    return cp + 3000
  } else if (cp >= 100000 && cp <= 1500000) {
    let profit = cp * 0.02 // 1%
    profit = Math.min(Math.max(profit, 5000), 10000) // clamp between 5k and 8k
    return cp + profit
  } else {
    return cp + 10000 // flat max profit
  }
}

// Function to send a reaction to a WhatsApp message
async function sendWhatsAppReaction(to, messageId, emoji) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    console.log(`Sending ${emoji} reaction to message ID: ${messageId} for recipient: ${to}`)

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "reaction",
        reaction: {
          message_id: messageId,
          emoji: emoji,
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Failed to send WhatsApp reaction. Status: ${response.status}, Body: ${errorBody}`)
      throw new Error(`Failed to send WhatsApp reaction: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log("WhatsApp reaction sent successfully:", result)
    return result
  } catch (error) {
    console.error("Error sending WhatsApp reaction:", error)
    throw error
  }
}

// Function to send a text message to WhatsApp
async function sendWhatsAppMessage(to, message) {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    console.log(`Sending WhatsApp message to ${to}: "${message}"`)

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message,
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Failed to send WhatsApp message. Status: ${response.status}, Body: ${errorBody}`)
      throw new Error(`Failed to send WhatsApp message: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log("WhatsApp message sent successfully:", result)
    return result
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    throw error
  }
}

async function processProductMessage(
  serverImageUrl,
  imageDataBase64,
  messageText,
  messageId,
  fromNumber,
  vendorId, // Now accepting vendor ID as parameter
) {
  try {
    console.log("Starting product message processing...")
    console.log("Server image URL:", serverImageUrl)
    console.log("Message text:", messageText)
    console.log("From number:", fromNumber)
    console.log("Using vendor ID:", vendorId)

    // Send initial reaction to acknowledge receipt
    await sendWhatsAppReaction(fromNumber, messageId, "👀")

    // 1. Analyze the message and image to get multiple product analyses
    console.log("Starting AI analysis...")
    const productAnalyses = await analyzeMultipleProducts(imageDataBase64, messageText)
    console.log("AI analysis complete, found products:", productAnalyses.length)

    if (!productAnalyses || productAnalyses.length === 0) {
      console.log("No products identified")
      await sendWhatsAppMessage(
        fromNumber,
        "Could not identify any products in your message. Please try again with a clear product description and price.",
      )
      return 0
    }

    let productsCreatedCount = 0

    // Fetch all available categories from your server once
    console.log("Fetching categories...")
    const availableCategories = await getCategories()
    console.log("Available categories:", availableCategories.length)

    if (availableCategories.length === 0) {
      await sendWhatsAppMessage(
        fromNumber,
        "No categories found on the server. Cannot create product(s). Please configure categories in the admin dashboard.",
      )
      return 0
    }

    for (const productAnalysis of productAnalyses) {
      console.log(`Processing product: ${productAnalysis.name}`)

      // Optional: Add a confidence check per product if desired
      if (productAnalysis.confidence < 0.7) {
        console.warn(
          `Skipping product "${productAnalysis.name}" due to low confidence (${productAnalysis.confidence}).`,
        )
        continue
      }

      let categoryId

      // Get or select category
      const category = availableCategories.find(
        (cat) => cat.title.toLowerCase() === productAnalysis.category.toLowerCase(),
      )
      if (category) {
        categoryId = category._id
        console.log(`Found exact category match: ${category.title}`)
      } else {
        // No exact match, use Gemini to select the best category from available ones
        console.log(`Category "${productAnalysis.category}" not found, using AI to select best match.`)
        categoryId = await selectBestCategory(productAnalysis.name, productAnalysis.category, availableCategories)
        console.log(`AI selected category ID: ${categoryId} for product "${productAnalysis.name}"`)
      }

      // Ensure categoryId is always set
      if (!categoryId) {
        categoryId = process.env.DEFAULT_CATEGORY_ID || availableCategories[0]?._id || ""
        console.warn(`Final fallback: Using category ID: ${categoryId} for product "${productAnalysis.name}"`)
      }

      if (!categoryId) {
        console.warn(`Skipping product "${productAnalysis.name}" due to missing category ID.`)
        await sendWhatsAppMessage(
          fromNumber,
          `Could not determine a category for product "${productAnalysis.name}". Please try again or configure default categories.`,
        )
        continue
      }

      // Use the price extracted by AI as the cost price (cp) for calculations
      const costPrice = productAnalysis.price !== null ? productAnalysis.price : 0
      console.log(`Cost price for ${productAnalysis.name}: ${costPrice}`)

      const fullDescription = productAnalysis.description.trim()

      // 1) Try to find an existing matching product for this vendor (scan first 12 related)
      try {
        // Use the title as a search hint to limit to relevant items
        const searchHint = productAnalysis.name
        const { products: candidateProducts } = await getProducts({
          vendor: vendorId,
          limit: 3,
          search: searchHint,
        })

        console.log(`Fetched ${candidateProducts.length} candidate products for vendor ${vendorId}`)

        let bestMatch = null

        for (const candidate of candidateProducts) {
          const comparison = await compareProducts(
            { productName: productAnalysis.name, description: fullDescription },
            { title: candidate.title, description: candidate.description },
          )

          console.log(
            `Compared with candidate ${candidate._id} (${candidate.title}) => match=${comparison.isMatch} confidence=${comparison.confidence}`,
          )

          if (comparison.isMatch) {
            if (!bestMatch || comparison.confidence > bestMatch.confidence) {
              bestMatch = { product: candidate, confidence: comparison.confidence }
            }
          }
        }

        // Threshold to accept a match
        const CONF_THRESHOLD = 0.75

        if (bestMatch && bestMatch.confidence >= CONF_THRESHOLD) {
          // Update price of existing product instead of creating a new one
          const updated = await updateProduct({
            _id: bestMatch.product._id, 
            original_price: calculateOriginalPrice(costPrice),
            discounted_price: calculateDiscountedPrice(costPrice, vendorId),
            priceUpdatedAt: new Date(),
            updatedAt: new Date().toISOString(), 
            // Optionally refresh description/video if provided
            description: fullDescription || bestMatch.product.description,
            videoUrl: productAnalysis.videoUrl || bestMatch.product.videoUrl,
            images: serverImageUrl ? [serverImageUrl, ...(bestMatch.product.images || [])] : bestMatch.product.images,
          })

          console.log(
            `Updated existing product price: ${updated._id} (matched with confidence ${bestMatch.confidence.toFixed(2)})`,
          )
          productsCreatedCount++
          continue // proceed to next detected product
        }
      } catch (matchErr) {
        console.warn(`Matching step failed for "${productAnalysis.name}":`, matchErr)
        // Fall through to creation
      }

      // 2) If no confident match, create a new product
      const productToSave = {
        title: productAnalysis.name,
        slug: generateSlug(productAnalysis.name),
        original_price: calculateOriginalPrice(costPrice),
        discounted_price: calculateDiscountedPrice(costPrice, vendorId),
        description: fullDescription,
        images: serverImageUrl ? [serverImageUrl] : [],
        categoryId: categoryId,
        vendorId: vendorId, // Use the vendor ID passed from webhook
        is_stock: 3,
        rating: 0,
        reviews: 0,
        trending: false,
        warranty: process.env.WARRANTY_IMG || "",
        views: 0,
        archive: false,
        priceUpdatedAt: new Date(),
        videoUrl: productAnalysis.videoUrl || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      try {
        console.log(`Creating new product "${productAnalysis.name}" with vendor ID: ${vendorId}`)
        console.log("Product data:", JSON.stringify(productToSave, null, 2))

        const createdProduct = await createProduct(productToSave)
        console.log(`Product "${productAnalysis.name}" created successfully with ID: ${createdProduct._id}`)
        productsCreatedCount++
      } catch (productSaveError) {
        console.error(`Failed to save product "${productAnalysis.name}":`, productSaveError)
        await sendWhatsAppMessage(
          fromNumber,
          `Failed to save product "${productAnalysis.name}". Please check server logs for details.`,
        )
      }
    }

    if (productsCreatedCount > 0) {
      await sendWhatsAppReaction(fromNumber, messageId, "✅")

      // Send detailed success message
      let successMessage = `✅ Successfully created ${productsCreatedCount} product(s):\n\n`

      productAnalyses.slice(0, productsCreatedCount).forEach((product, index) => {
        successMessage += `${index + 1}. ${product.name}\n`
        successMessage += `   💰 Original: ₦${calculateOriginalPrice(product.price || 0).toLocaleString()}\n`
        successMessage += `   🏷️ Discounted: ₦${calculateDiscountedPrice(product.price || 0, vendorId).toLocaleString()}\n\n`
      })

      await sendWhatsAppMessage(fromNumber, successMessage)
      console.log(`Successfully processed and created ${productsCreatedCount} product(s).`)
    } else {
      await sendWhatsAppMessage(fromNumber, "No products were successfully created from your message.")
    }

    return productsCreatedCount
  } catch (error) {
    console.error("Error processing product message:", error)
    await sendWhatsAppReaction(fromNumber, messageId, "❌")
    await sendWhatsAppMessage(
      fromNumber,
      `Failed to process your product message: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
    return 0
  }
}

module.exports = { processProductMessage }
