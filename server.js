const express = require("express");
const app = express();
const devuser = require('./devusermodel')
const jwt = require("jsonwebtoken")
const cors = require("cors")
const mongoose = require("mongoose");
const middleware = require("./middleware")
const port = 3001 || process.env
const review = require('./reviewmodel');
const bcrypt = require("bcrypt")



mongoose.connect("mongodb+srv://ajayjoji1723:Ajay123@cluster0.xs7ouo1.mongodb.net/devhubs?retryWrites=true&w=majority")
.then(()=>{
    console.log('DB Connected');
})
.catch(err=>console.log(err.message))

app.use(express.json());
app.use(cors({origin:'*'}));

//home api
app.get("/",(req,res)=>{
    res.send("Welcome DevHub!!!")
})

//get all profiles api
app.get("/allprofiles", middleware, async(req,res)=>{
    try{
        const allProfiles = await devuser.find()
        res.json(allProfiles)
    }catch(err){
        console.log(err.message)
        res.status(500).json("Server Error")
    }
})

//myprofile api
app.get("/myprofile", middleware, async(req,res)=>{
    try{
        let user = await devuser.findById(req.user.id);
        res.json(user)
    }catch(err){
        console.log(err)
        res.status(500).send("Server Error")
    }
})


//add review
app.post('/addreview', middleware, async(req,res)=>{
    try{
        const {taskworker,rating} = req.body;
        const existUser = await devuser.findById(req.user.id);
        const newReview = new review({
            taskprovider:existUser.fullname,
            taskworker,
            rating
        })
        newReview.save();
        return res.send('Review updated successfully')
    }catch(err){
        console.log(err)
        res.status(500).send('Server Error')
    }
})

//my reviews 
app.get('/myreview', middleware, async(req,res)=>{
    try{
        let allReviews = await review.find()
        let myreviews = allReviews.filter(review=> review.taskworker.toString() === req.user.id.toString())
        return res.status(200).json(myreviews)
    }catch(err){
        console.log(err)
        res.status(500).send('Server Error')
    }
})

//register api
app.post("/register", async(req,res)=>{
    try{
        const {fullname,email,mobile,skilss,password,confirmPassword} = req.body
        const exist = await devuser.findOne({email});
        if(exist){
            return res.send("User Already Registered")
        } 
        if(password !== confirmPassword){
            return res.send("Password Not Matched")
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        let newUser = new devuser({
            fullname,
            email,
            mobile,
            skilss,
            password :hashedPassword,
            confirmPassword
        })
        newUser.save()
        res.send("User Registered")
    }catch(err){
        console.log(err.message)
        res.send('Server Error')
    }
})

//login api
app.post("/login/", async (req,res)=>{
    try{
        const {email, password} = req.body
        const exist = await devuser.findOne({email})
        if(!exist){
            return res.status(400).send("User Not Found")
        }

         // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, exist.password);
        
        if(!isMatch){
            return res.status(401).send("Password Invalid")
        }

        // If the password matches, you can implement JSON Web Token (JWT) authentication here and generate a token for the user.
        let payload = {
            user:{
                id:exist.id
            }
        }

        jwt.sign(payload,'jwtPassword',{expiresIn:360000000},
        (err,token)=>{
            if(err) throw err
            return res.json({token})
        })

    }catch(err){
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})


app.listen(port,()=>console.log(`Server running at ${port}`)) 