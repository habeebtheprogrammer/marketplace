const Blogposts = require("../model/blogposts.model");

exports.getBlogPosts = async ({ query = {}, options = {} }) => {
  const data = await Blogposts.paginate(query, {
    populate: [
      {
        path: "author",
        select: ["firstName", "lastName", "avatar"],
      },
    ],
    ...options,
  });

  if (data.totalDocs == 1) {
    await Blogposts.findOneAndUpdate(query, { $inc: { views: 1 } });
  }
  return data;
};

exports.createBlogposts = async (param) => {
  const data = await Blogposts.create(param);
  return data;
};

exports.updateBlogposts = async (param, obj) => {
  const data = await Blogposts.findOneAndUpdate(param, obj, { new: true });
  return data;
};

exports.deleteBlogposts = async (id) => {
  const data = await Blogposts.findOneAndDelete({ _id: id });
  return data;
};

exports.searchBlogPosts = async ({ query: searchQuery, options = {} }) => {
  const { q } = searchQuery || {};
  const { page = 1, limit = 9, sort } = options;
  
  if (!q) {
    throw new Error('Search query is required');
  }

  const query = {
    archive: false,
    $text: { $search: q }
  };

  const paginationOptions = {
    page: Number(page),
    limit: Number(limit),
    sort: sort || { score: { $meta: 'textScore' }, _id: -1 },
    populate: [
      {
        path: "author",
        select: ["firstName", "lastName", "avatar"],
      },
    ],
  };

  // Add textScore to select for relevance sorting
  paginationOptions.select = { score: { $meta: 'textScore' } };

  const data = await Blogposts.paginate(query, paginationOptions);
  return data;
};

exports.getBlogPostBySlug = async (slug) => {
  // Get the blog post by slug
  const post = await Blogposts.findOne({ 
    slug, 
    archive: false 
  }).populate({
    path: "author",
    select: ["firstName", "lastName", "avatar"],
  });

  if (!post) {
    return null;
  }

  // Increment views
  await Blogposts.findOneAndUpdate({ _id: post._id }, { $inc: { views: 1 } });

  // Build search query from title and tags
  const searchTerms = [];
  
  // Add title keywords (filter out short words and common words)
  const titleWords = post.title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5); // Take up to 5 keywords
  
  searchTerms.push(...titleWords);
  
  // Add tags to search terms
  if (post.tags && post.tags.length > 0) {
    searchTerms.push(...post.tags.map(tag => tag.toLowerCase()));
  }
  
  // Create search query string (join all terms)
  const searchQuery = [...new Set(searchTerms)].join(' ');
  
  // Convert post to plain object and extract tags for aggregation
  const postTags = (post.tags && Array.isArray(post.tags)) ? post.tags : [];
  const postId = post._id;

  // Use aggregation to find related posts with flexible matching
  const relatedPostsAgg = await Blogposts.aggregate([
    {
      $match: {
        _id: { $ne: postId },
        archive: false,
        $text: { $search: searchQuery }
      }
    },
    {
      $addFields: {
        // Calculate relevance score
        textScore: { $meta: 'textScore' },
      
      }
    },
    {
      $sort: {
        // Prioritize posts with matching tags, then text relevance, then recency
        tagMatchCount: -1,
        textScore: -1,
        createdAt: -1
      }
    },
    {
      $limit: 3
    },
    {
      $project: {
        slug: 1,
        title: 1,
        tags: 1,
        excerpt: 1,
        createdAt: 1,
        coverImage: 1,
        author: 1
      }
    }
  ]);

  // Populate author information
  const relatedPosts = await Blogposts.populate(relatedPostsAgg, {
    path: 'author',
    select: 'firstName lastName avatar'
  });

  // If we don't have 3 related posts, fill with more flexible search or recent posts
  if (relatedPosts.length < 3) {
    // Collect already found post IDs
    const foundIds = [
      postId,
      ...relatedPosts.map(p => {
        const id = p._id;
        return id ? (id.toString ? id.toString() : id) : null;
      }).filter(Boolean)
    ];
    
    // Try a broader search using just the main keywords from title
    if (titleWords.length > 0) {
      const broaderSearchQuery = titleWords.slice(0, 3).join(' ');
      
      const broaderResults = await Blogposts.aggregate([
        {
          $match: {
            _id: { $nin: foundIds },
            archive: false,
            $text: { $search: broaderSearchQuery }
          }
        },
        {
          $addFields: {
            textScore: { $meta: 'textScore' }
          }
        },
        {
          $sort: {
            textScore: -1,
            createdAt: -1
          }
        },
        {
          $limit: 3 - relatedPosts.length
        },
        {
          $project: {
            slug: 1,
            title: 1,
            excerpt: 1,
            coverImage: 1,
            author: 1
          }
        }
      ]);

      if (broaderResults.length > 0) {
        const broaderWithAuthors = await Blogposts.populate(broaderResults, {
          path: 'author',
          select: 'firstName lastName avatar'
        });
        relatedPosts.push(...broaderWithAuthors);
      }
    }

    // If still less than 3, fill with recent posts
    if (relatedPosts.length < 3) {
      // Update foundIds with broader results
      const allFoundIds = [
        postId,
        ...relatedPosts.map(p => {
          const id = p._id;
          return id ? (id.toString ? id.toString() : id) : null;
        }).filter(Boolean)
      ];
      
      const recentPosts = await Blogposts.find({
        _id: { $nin: allFoundIds },
        archive: false
      })
        .select('slug title excerpt coverImage author')
        .populate({
          path: "author",
          select: ["firstName", "lastName", "avatar"],
        })
        .sort({ createdAt: -1 })
        .limit(3 - relatedPosts.length)
        .lean();

      relatedPosts.push(...recentPosts);
    }
  }

  // Limit to exactly 3
  const finalRelatedPosts = relatedPosts.slice(0, 3);

  return {
    post,
    relatedPosts: finalRelatedPosts
  };
};
