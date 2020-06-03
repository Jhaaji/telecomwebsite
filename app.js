var express=require("express");
var app=express();
var passport=require("passport");
var LocalStrategy=require("passport-local");
var User=require("./models/user.js");
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var Post=require("./models/post.js");
var Mark=require("./models/mark.js")
var Answer=require("./models/answer.js");
var asyn = require("async");
var nodemailer=require("nodemailer");
var crypto=require("crypto");
var methodOverride=require("method-override");


//comments
mongoose.set('useCreateIndex', true);
//Passport configuration
app.use(require("express-session")({
  secret:"hello world",
  resave :false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
  res.locals.currentUser =req.user;
  next();
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));


mongoose.connect("mongodb://satyam:satyam1@ds157707.mlab.com:57707/studentdatabase",{ useNewUrlParser: true });

//mongoose.connect(process.env.DATABASEURL,{useNewUrlParser: true}) ;

//mongoose.connect("mongodb://prabhakar:PkJhA028@ds123664.mlab.com:23664/gyaandoo",{ useNewUrlParser: true });



var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "prabhakarjha028@gmail.com",
        pass: 'ldanfhxuhbvxfgjd'
    }
});
var rand,mailOptions,refer;

        



app.get("/students", function(req,res){
 //  Post.find({},function(error,allPosts){
 //    if(error)
 //     console.log("error");
  //   else
  //   {
  //    res.render("posts/index",{posts : allPosts,currentUser : req.user});
  //   }
  // })
 
  User.find(function(err, allUsers) { 
      if(err)
        {console.log("error");}
     else
     {
      res.render("marks/students",{students : allUsers});
     }
  });
});

app.get("/student/:username",function(req,res){
   Mark.find(function(err, all) {
      if(err)
        {console.log("error");}
     else
     {
      res.render("marks/eachstudent",{marks : all,student : req.params.username});
     }
  });

})




app.post("/",isLoggedIn, function(req,res){
    var question=req.body.question;
    var author={
        id :req.user._id,
        username :req.user.username ,
        alias :req.user.alias
    };
    var newPost={question : question, author : author};
    Post.create(newPost,function(error,newlyCreatedPost){
     if(error)
      console.log(error);
     else
     {
         console.log(newlyCreatedPost);
      res.redirect("/posts/page/1");
     } 
    })
});


app.get("/new",function(req,res){
   res.render("posts/new");
});


app.get("/posts/:id",function(req,res){
    
    
  Post.findById(req.params.id).populate("answers").exec(function(err,foundPost){
     if(err)
      console.log(err);
      else
      {
         console.log(foundPost);
       res.render("posts/show", {post : foundPost});
      }
    });
});


app.post("/posts/:id/answers",isLoggedIn,function(req,res){
 Post.findById(req.params.id,function(err,post){
   if(err)
    console.log(err);
   else
   {
    console.log(req.body.answer);
    Answer.create(req.body.answer,function(err,answer){
      if(err)
       console.log(err);
      else
       {
        answer.author.id=req.user._id;
        answer.author.username=req.user.username;
        answer.save();
        post.answers.push(answer);
        post.save();
        res.redirect('/posts/'+post._id);
       }
    });
   }
 });
});

app.post("/marks/new",isLoggedIn,function(req,res){
    var semester=req.body.semester;
    var student={
        id :req.user._id,
        username :req.user.username
    };
    var newMark={Semester : semester, student : student, code : req.body.code, merit : req.body.merit, grade : req.body.grade};
    Mark.create(newMark,function(error,newlyCreatedMark){
     if(error)
      console.log(error);
     else
     {
         console.log(newlyCreatedMark);
      res.redirect("/marks");
     } 
    })
});


app.get("/allmarksall",function(req,res){
    Mark.find(function(err,all){
        if(err){
            res.redirect("/posts/page/1");
        }
        else{
            res.send(all)
        }
    })
    
});

//EDIT POST
app.get("/posts/:id/editpost",function(req,res){
    Post.findById(req.params.id, function(err,foundPost){
        if(err){
            res.redirect("/posts/page/1");
        }
        else{
            res.render("posts/edit",{post:foundPost});
        }
    })
    
});

app.post("/editpost", function(req,res){
    if(req.isAuthenticated()){
    var data = req.body.question;
    console.log(data);
    Post.findByIdAndUpdate(req.body.postid,{question:data},{upsert:true},function(err, updatedPost){
        if(err){
            console.log(err);
            res.redirect('/posts/'+req.body.postid);
        }else{
            console.log(updatedPost);
            res.redirect('posts/'+req.body.postid);
        }
    });}
    else{
        res.render('partials/editpost')
    }
});
// DELETE POST

app.post("/deletepost",function(req,res){
    console.log("delete")
    Post.deleteOne({_id:req.body.postid},function(err){
        if(err){
            console.log(err);
        }
        else
        res.redirect("/posts/page/1");
    });
});
//like answers



/*app.get("/posts/:id/answers/new",isLoggedIn, function(req,res){
 Post.findById(req.params.id,function(err,post){
    if(err)
     console.log(err);
    else{
      res.render("/answers/new",{post:post});
    }
 });
});*/
// "5ca58f9910eb7015b182fa2b")


//landing
app.get("/",function(req,res){
   res.render("home"); 
});
app.get("/marks",function(req,res){
    res.render("marks/new");
});


//Authentication routes
app.get("/register",function(req,res){
    res.render("register");
});

app.post("/register",function(req,res){
   
  refer=Math.floor((Math.random() * 100) + 123);
  var referral = req.body.alias+refer;
  var newUser = new User(
      {
          username : req.body.username,
          firstname : req.body.firstname,
          lastname : req.body.lastname,
          
      });
      
    
      
  if(req.body.adminCode==='secretcode123'){
      newUser.isAdmin = true ;
  }
  
  User.register(newUser,req.body.password,function(err,user){
    if(err){
     console.log(err);
     res.render("register");
    }
    else
     {  
       passport.authenticate("local")(req,res,function(){

           req.logout();
         res.redirect("/login");
       });
     }
  });
});






app.get("/login",function(req,res){
    res.render("login")
});

app.post("/login",passport.authenticate("local",
 {
   successRedirect:"/marks",
   failureRedirect:"/login"
 }
),function(req,res){
 
});


app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});


app.get("/users/:id",function(req,res){
  User.findById(req.params.id,function(err,foundUser){
      if(err){
         console.log(err);
      }
      else{
          Post.find().populate("answers").exec(function(err,posts){
               if(err){
                 console.log(err);
                }
                else{
                     res.render("users/show", {user : foundUser,posts : posts});
                }
          });
         
      }
  })
});



app.get('/forgot', function(req, res) {
  res.render('forgot');
});

app.post('/forgot', function(req, res, next) {
  asyn.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ username: req.body.username }, function(err, user) {
          if(err){
              
              console.log('finding error'+err);
          }else{
        if (!user) {
            console.log('finding error 2 '+err);
          //req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      }
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'prabhakarjha028@gmail.com',
          pass: 'ldanfhxuhbvxfgjd'
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'prabhakarjha028@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
       // req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

app.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if(err){
          console.log(err);
      }else{
    if (!user) {
     // req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
      }
  });
});

app.post('/reset/:token', function(req, res) {
  asyn.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if(err){
              console.log(err);
          }else{
        if (!user) {
        //  req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
              if(err){
              console.log(err);
          }else{
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
                if(err){
              console.log(err);
          }else{
              req.logIn(user, function(err) {
                done(err, user);
              });
            }
            });
          }
          })
        } else {
          //  req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'prabhakarjha028@gmail.com',
          pass: 'ldanfhxuhbvxfgjd'
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'prabhakarjha028@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
   //     req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
      if(err){
        console.log(err);
      }else{
    res.redirect('/');
      }
  });
});





function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}


app.listen(3000,'127.0.0.1',function(){
    console.log("server started");
});