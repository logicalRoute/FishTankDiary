const express    = require("express"),
      router     = express.Router({mergeParams: true}),
      Post       = require("../models/post"),
      middleware = require("../middleware/");

// INDEX ROUTE
router.get("/", function(req, res){
    Post.find({}, function(err, allPosts){
        if(err){
            console.log("ERROR");
        } else{
            res.render("posts/index", {posts: allPosts, page: 'posts'});
        }
    });
});

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("posts/new", {page: "new"});
});

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
    const phLevel      = req.body.phLevel,
          nitrates     = req.body.nitrates,
          nitrites     = req.body.nitrites,
          ammonia      = req.body.ammonia,
          waterChanged = req.body.waterChanged,
          waterAmount  = req.body.waterAmount,
          notes        = req.body.notes,
          author       = {
            id: req.user._id,
            username: req.user.username
          },
          created = req.body.created,
          createdAt = req.body.createdAt;

    const newPost = {
        phLevel: phLevel,
        nitrates: nitrates,
        nitrites: nitrites,
        ammonia: ammonia,
        waterChanged: waterChanged,
        waterAmount: waterAmount,
        notes: notes,
        author: author,
        created: created,
        createdAt: createdAt
    };

    Post.create(newPost, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            req.flash("success", "You have successfully added a new entry");
            res.redirect("/posts");
        }
    });
});

// SHOW ROUTE
router.get("/:id", function(req, res){
    Post.findById(req.params.id).populate("comments").exec(function (err, foundPost){
        if(err){
            console.log(err);
        } else {
            res.render("posts/show", {post: foundPost});
        }
    });
});

// EDIT ROUTE
router.get("/:id/edit", middleware.checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function (err, foundPost){
        res.render("posts/edit", {post: foundPost});
    });  
});

// UPDATE ROUTE
router.put("/:id", middleware.checkPostOwnership, function (req, res){
    req.body.post.body = req.sanitize(req.body.post.body);
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
        if(err){
            res.redirect("/posts");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
});


// DESTROY ROUTE
router.delete("/:id", middleware.checkPostOwnership, function(req, res){
    Post.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/posts");
        } else {
            req.flash("error", "You have successully deleted your entry.");
            res.redirect("/posts");
        }
    });
});

module.exports = router;