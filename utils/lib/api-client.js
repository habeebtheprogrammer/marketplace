// API client for 360gadgetsafrica.com endpoints
const API_BASE_URL = process.env.API_BASE_URL
const API_KEY = process.env.GADGETS_API_KEY

function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  // Try different authentication methods
  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}` 
  }

  return headers
}

// Cache for categories and vendors to avoid repeated API calls
let categoriesCache = null
let vendorsCache = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function isCacheValid() {
  return Date.now() - cacheTimestamp < CACHE_DURATION
}

async function fetchApiWithHandling(endpoint, options) {
  const url = `${API_BASE_URL}${endpoint}`
  console.log(`Fetching from: ${url}`)

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options?.headers, 
    },
  })

  const contentType = response.headers.get("content-type")

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`API Error for ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      contentType,
      body: errorText.substring(0, 500),
    })

    if (response.status === 403) {
      throw new Error(`Access forbidden to ${endpoint}. Check API authentication.`)
    } else if (response.status === 401) {
      throw new Error(`Unauthorized access to ${endpoint}. Invalid API key.`)
    } else if (response.status === 404) {
      throw new Error(`Endpoint not found: ${endpoint}`)
    } else {
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText.substring(0, 100)}`)
    }
  }

  if (!contentType || !contentType.includes("application/json")) {
    const textResponse = await response.text()
    console.error(`Non-JSON response from ${endpoint}:`, {
      contentType,
      body: textResponse.substring(0, 500),
    })
    throw new Error(`Expected JSON response but got: ${contentType}`)
  }

  try {
    return await response.json()
  } catch (error) {
    const textResponse = await response.text()
    console.error(`JSON parse error for ${endpoint}:`, {
      error: error instanceof Error ? error.message : String(error),
      body: textResponse.substring(0, 500),
    })
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Mock data for fallback when API is not accessible
const mockCategories = [
  {
    _id: "mock_cat_1",
    title: "Smartphones",
    image: "/placeholder.svg?height=48&width=48",
    slug: "smartphones",
    vendorId: "mock_vendor_1",
    archive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock_cat_2",
    title: "Laptops",
    image: "/placeholder.svg?height=48&width=48",
    slug: "laptops",
    vendorId: "mock_vendor_1",
    archive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock_cat_3",
    title: "Tablets",
    image: "/placeholder.svg?height=48&width=48",
    slug: "tablets",
    vendorId: "mock_vendor_1",
    archive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock_cat_4",
    title: "Headphones",
    image: "/placeholder.svg?height=48&width=48",
    slug: "headphones",
    vendorId: "mock_vendor_1",
    archive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock_cat_5",
    title: "Accessories",
    image: "/placeholder.svg?height=48&width=48",
    slug: "accessories",
    vendorId: "mock_vendor_1",
    archive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockVendors = [
  {
    _id: process.env.VENDOR_ID || "mock_vendor_1", // Use actual env var if set
    creatorId: "mock_creator_1",
    title: "Default Vendor",
    slug: "default-vendor",
    image: "/placeholder.svg?height=64&width=64",
    available: true,
    views: 0,
    loc: {
      type: "Point",
      coordinates: [3.3792, 6.5244], // Lagos coordinates
    },
    address: {
      longitude: 3.3792,
      latitude: 6.5244,
      city: "Lagos",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archive: false,
  },
]

async function getCategories() {
  try {
    if (categoriesCache && isCacheValid()) {
      return categoriesCache
    }

    const data = await fetchApiWithHandling("/categories")
    let categories = []

    // Assuming the API returns { data: { docs: [...] } }
    if (data && data.data && Array.isArray(data.data.docs)) {
      categories = data.data.docs
    } else if (Array.isArray(data)) {
      // Fallback if it's directly an array
      categories = data
    } else {
      console.warn("Unexpected categories response structure, returning empty array:", data)
      categories = []
    }

    categoriesCache = categories.filter((cat) => !cat.archive)
    cacheTimestamp = Date.now()
    console.log(`Loaded ${categoriesCache.length} categories`)
    return categoriesCache
  } catch (error) {
    console.error("Error fetching categories, using mock data:", error)
    return mockCategories
  }
}

async function getVendors() {
  try {
    if (vendorsCache && isCacheValid()) {
      return vendorsCache
    }

    const data = await fetchApiWithHandling("/vendors")
    let vendors = []

    // Handle different possible response structures
    if (data && data.data && Array.isArray(data.data.docs)) {
      vendors = data.data.docs
    } else if (Array.isArray(data)) {
      vendors = data
    } else if (data.vendors && Array.isArray(data.vendors)) {
      vendors = data.vendors
    } else if (data.docs && Array.isArray(data.docs)) {
      vendors = data.docs
    } else if (data.data && Array.isArray(data.data)) {
      vendors = data.data
    } else {
      console.warn("Unexpected vendors response structure, returning empty array:", data)
      vendors = []
    }

    vendorsCache = vendors.filter((vendor) => !vendor.archive && vendor.available)
    cacheTimestamp = Date.now()
    console.log(`Loaded ${vendorsCache.length} vendors`)
    return vendorsCache
  } catch (error) {
    console.error("Error fetching vendors, using mock data:", error)
    return mockVendors
  }
}

async function getProducts(params) {
  try {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())
    if (params?.search) queryParams.append("title", params.search)
    if (params?.category) queryParams.append("category", params.category)
    if (params?.vendor) {
      // Append both keys for compatibility with different backends
      queryParams.append("vendorId", params.vendor)
    }

    const data = await fetchApiWithHandling(`/products?${queryParams}`)

    let products = []
    let pagination = {}

    if (data && data.data && Array.isArray(data.data.docs)) {
      products = data.data.docs
      pagination = {
        page: data.page || 1,
        limit: data.limit || 20,
        total: data.totalDocs || 0,
        totalPages: data.totalPages || 1,
        hasNextPage: data.hasNextPage || false,
        hasPrevPage: data.hasPrevPage || false,
      }
    } else if (Array.isArray(data)) {
      products = data
      pagination = {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: data.length,
        totalPages: Math.ceil(data.length / (params?.limit || 20)),
      }
    } else {
      console.warn("Unexpected products response structure, returning empty array:", data)
      products = []
    }

    console.log(`Loaded ${products.length} products`)
    return {
      products,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        total: pagination.total || products.length,
        totalPages:
          pagination.totalPages || Math.ceil((pagination.total || products.length) / (pagination.limit || 20)),
      },
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { products: [] }
  }
}

async function createProduct(productData) {
  const data = await fetchApiWithHandling("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  })
  return data.product || data // Assuming API returns { product: ... } or direct product object
}

async function updateProduct(updates) {
  const data = await fetchApiWithHandling(`/products`, {
    // Assuming PATCH to /products/:id
    method: "PATCH", 
    body: JSON.stringify(updates), // Send updates directly
  })
  return data.product || data
}

async function createCategory(categoryData) {
  const data = await fetchApiWithHandling("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  })
  return data.category || data
}

// Helper function to get vendor and category names for display
async function getVendorName(vendorId) {
  try {
    const vendors = await getVendors()
    const vendor = vendors.find((v) => v._id === vendorId)
    return vendor?.title || "Unknown Vendor"
  } catch (error) {
    console.error("Error getting vendor name:", error)
    return "Unknown Vendor"
  }
}

async function getCategoryName(categoryId) {
  try {
    const categories = await getCategories()
    const category = categories.find((c) => c._id === categoryId)
    return category?.title || "Unknown Category"
  } catch (error) {
    console.error("Error getting category name:", error)
    return "Unknown Category"
  }
}

module.exports = {
  fetchApiWithHandling,
  getCategories,
  getVendors,
  getProducts,
  createProduct,
  updateProduct,
  createCategory,
  getVendorName,
  getCategoryName,
}
