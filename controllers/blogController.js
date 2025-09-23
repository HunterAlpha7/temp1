const blogModel = require("../models/blogModel");
const userModel = require("../models/userModel");
const mongoose = require("mongoose");

//GET ALL BLOGS
exports.getAllBlogsController = async (req, res) => {
  try {
    const blogs = await blogModel.find({}).populate("user");
    if (!blogs) {
      return res.status(200).send({
        success: false,
        message: "No Blog found",
      });
    }

    return res.status(200).send({
      success: true,
      Blogcount: blogs.length,
      message: "All blogs listed",
      blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while getting the blogs",
      error,
    });
  }
};

//Create BLOGS
exports.createBlogController = async (req, res) => {
  try {
    const { title, description, image, user } = req.body;
    //validation
    if (!title || !description || !image || !user) {
      return res.status(400).send({
        success: false,
        message: "You gotta put in the details in.",
      });
    }
    const existingUser = await userModel.findById(user);
    //user validation
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }
    const newBlog = new blogModel({
      title,
      description,
      image,
      user,
    });
    const session = await mongoose.startSession();
    session.startTransaction();
    await newBlog.save({
      session,
    });
    existingUser.blogs.push(newBlog);
    await existingUser.save({
      session,
    });
    await session.commitTransaction();
    await newBlog.save();
    return res.status(201).send({
      success: true,
      message: "Blog goes in. You are all set.",
      newBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(2201).send({
      success: false,
      message: "Oops. Something went wrong during creation.",
      error,
    });
  }
};

//Update BLOGS
exports.updateBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image } = req.body;
    const blog = await blogModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      {
        new: true,
      },
    );
    return res.status(200).send({
      success: true,
      message: "Yay! Successfully updated",
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "For some odd reason, the blog wasn't updated",
      error,
    });
  }
};

//Single blog
exports.getBlogByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(404).send({
        success: false,
        message: "Blog Not found. You sure there is no typo?",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Presenting, the blog you were looking for.",
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Sorry. Fetch has failed. Try again later.",
      error,
    });
  }
};

//Delete blog
exports.deleteBlogController = async (req, res) => {
  try {
    const blog = await blogModel
      .findByIdAndDelete(req.params.id)
      .populate("user");
    await blog.user.blogs.pull(blog);
    await blog.user.save();
    return res.status(200).send({
      success: true,
      message: "Poof. Its all gone.",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error. Delete operation failed.",
      error,
    });
  }
};

//GET USER BLOG
exports.userBlogController = async (req, res) => {
  try {
    const userBlog = await userModel.findById(req.params.id).populate("blogs");
    if (!userBlog) {
      return res.status(404).send({
        success: false,
        message: "Woah. This user has no blogs",
      });
    }
    return res.status(200).send({
      success: true,
      message: "user blogs",
      userBlog,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      success: false,
      message: "Error in user blog",
      error,
    });
  }
};

//START FROM 7
