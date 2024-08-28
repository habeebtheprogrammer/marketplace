const axios = require('axios');
const { SitemapStream, streamToPromise } = require('sitemap')
const { createGzip } = require('zlib')
const { Readable } = require('stream')
let sitemap

exports.createSiteMap = async (req, res, next) => {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');
    // if we have a cached entry send it
    if (sitemap) {
        res.send(sitemap)
        return
    }

    try {

        const hostname = 'https://360gadgetsafrica.com'; // Replace with your actual API endpoint
        const response = (await axios.default.get(hostname + '/api/products?limit=1000')).data;
        const products = response?.data.docs; // Assuming your API returns an array of product objects
        const smStream = new SitemapStream({ hostname })
        const pipeline = smStream.pipe(createGzip())
        
        // Add dynamic product URLs to the sitemap
        smStream.write({ url: '/', changefreq: 'monthly', priority: 1 })
        products.forEach((product) => {
            smStream.write({ url: `/product-details/${product.slug}`, changefreq: 'monthly', priority: 1, img: product.images.map(img => ({url: img, title: product.title, caption: product.title})) })
        })
        
     
        smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.3 })
        smStream.write({ url: '/return-policy', changefreq: 'monthly', priority: 0.3 })
        smStream.write({ url: '/privacy', changefreq: 'monthly', priority: 0.3 })
        smStream.write({ url: '/terms', changefreq: 'monthly', priority: 0.3 })

        // cache the response
    streamToPromise(pipeline).then(sm => sitemap = sm)
    // make sure to attach a write stream such as streamToPromise before ending
    smStream.end()
    // stream write the response
    pipeline.pipe(res).on('error', (e) => {throw e})
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
}