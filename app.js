var express = require("express");
var bodyParser = require("body-parser")
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

var app = express();
var dbURI = 'mongodb://localhost/blog_app';
mongoose.connect(dbURI);


//Serve contents of public directory
app.use(express.static("public"));
//FOR using put-destroy
app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");

//DB Schema
var blogSchema = new mongoose.Schema({
   title: String, 
   image: String, //{type: String, default: "def_image.location"
   body: String,
   created: {
       type: Date, 
       default: Date.now
       
   }
});

var Blog = mongoose.model('Blog', blogSchema);

//ROUTES
// Blog.create({
//   title: "First Blog",
//   image: "https://zenpitoe.files.wordpress.com/2010/12/img_5817-red-led-macbook.jpg",
//   body: "This is a blog post"
// });

app.get("/", function(req, res){
   res.redirect("/blogs");
});


//INDEX
app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs){
      if(err){
          console.log(err);
      }else {
          res.render("index", {blogs: blogs});
      }
  }); 
    
});


//NEW ROUTE
app.get("/blogs/new", function(req, res){
   res.render("new");
});

//ROUTE CREATE
app.post("/blogs", function(req, res){
   var blog = {
       title: req.body.title,
       image: req.body.image,
       body: req.sanitize(req.body.body)
   }
   Blog.create(blog, function(err, blog){
       if(err){
           res.render("new");
       }else{
           res.redirect("/blogs");
       }
   })
});

//SHOW DETAILS ROUTE
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: blog});
        }
    })
});


//EDIT PAGE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: blog});
        }
    })
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    var blog = {
       title: req.body.title,
       image: req.body.image,
       body: req.body.body
   }
   Blog.findByIdAndUpdate(req.params.id, blog, function(err, blog){
       if(err){
           res.render("/blogs");
       }else{
           res.redirect("/blogs/" + req.params.id);
       }
   })
});

//DESTROY Route
app.delete("/blogs/:id", function(req, res){
   Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs");
       }else{
           res.redirect("/blogs");
       }
   })
});
















//Server Running
app.listen(process.env.PORT, process.env.IP, function(){
//app.listen(8080, "127.0.0.1", function(){
   console.log("Server Running"); 
});

//Monitoring moongose
mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error',function (err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose disconnected');
});