const Blogposts = require("../model/blogposts.model")

exports.getBlogPosts = async ({ query = {}, options = {} }) => {

    const data = await Blogposts.paginate(query, {
        populate: [
            {
                path: "author",
                select: ["firstName", 'lastName'],
            }], ...options
    })

    if (data.totalDocs ==  1) {
        await Blogposts.findOneAndUpdate(query, {"$inc": {"views": 1}})
    }
    return data
}

exports.createBlogposts = async (param) => {
    const data = await Blogposts.create(param)
    return data
}

exports.updateBlogposts = async (param, obj) => {
    const data = await Blogposts.findOneAndUpdate(param, obj, { new: true })
    return data
}

exports.deleteBlogposts = async (id) => {
    const data = await Blogposts.findOneAndDelete({ _id: id })
    return data
}
 