const express = require("express");
const app = express();
const devuser = require('./devusermodel')
const jwt = require("jsonwebtoken")
const cors = require("cors")
const mongoose = require("mongoose");
const middleware = require("./middleware")
const port = 3001 || process.env
const review = require('./reviewmodel');



mongoose.connect("mongodb+srv://ajayjoji1723:anniejanez0814@cluster0.xs7ouo1.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log('DB Connected');
})
.catch(err=>console.log(err.message))

app.use(express.json());
app.use(cors({origin:'*'}));

app.get("/",(req,res)=>{
    res.send("Welcome DevHub!!!")
})

app.get("/allprofiles", middleware, async(req,res)=>{
    try{
        const allProfiles = await devuser.find()
        res.json(allProfiles)
    }catch(err){
        console.log(err.message)
        res.status(500).json("Server Error")
    }
})

app.get("/myprofile", middleware, async(req,res)=>{
    try{
        let user = await devuser.findById(req.user.id);
        res.json(user)
    }catch(err){
        console.log(err)
        res.status(500).send("Server Error")
    }
})

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
        let newUser = new devuser({
            fullname,email,mobile,skilss,password,confirmPassword
        })
        newUser.save()
        res.send("User Registered")
    }catch(err){
        console.log(err.message)
        res.send('Server Error')
    }
})

app.post("/login/", async (req,res)=>{
    try{
        const {email, password} = req.body
        const exist = await devuser.findOne({email})
        if(!exist){
            return res.status(400).send("User Not Found")
        }
        if(exist.password !== password){
            return res.status(400).send("Password Invalid")
        }
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