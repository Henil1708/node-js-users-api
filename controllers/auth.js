const db = require('../config/database');
const {errorResponse} = require('../utils/Errors');
const { hashSync, compareSync } = require("bcrypt");
var jwt = require('jsonwebtoken');
var fs = require('fs');
const {
    dirname
} = require('path');
const appDir = dirname(require.main.filename);
const multer = require("multer");
const csvParser = require('csv-parser');
var XLSX = require('xlsx');
// storage for photo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    },
});


// upload photo checking mime type and validationg it shows if file type is other then png, jpg or jpeg 
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png , .jpg and .jpeg files are supported !!"));
        }
    }
}).single('photo');

const signUp = (req, res) => {

    // image upload 
    upload(req, res,async function (err) {

        // if error occurs
        // A Multer error occurred when uploading.
        if (err instanceof multer.MulterError) {
            errorResponse(res, err, 400, true);
            return;
        } else if (err) {
            // if error occurs
            // An unknown error occurred when uploading.
            errorResponse(res, err, 400, true);
            return;
        }


        // if file or files in request does not exists
        if (!req.file || req.files) {
            errorResponse(res, "Photo field is required !", 400, true);
            return;
        }

        // Everything went fine.

        // extraction all needed data from body 
        let {
            name,
            email,
            age,
            state,
            gender,
            password,
            city,
            hobbies
        } = req.body;

        // if the data name and email and age and state and gender and password and city and hobbies exists
        if (name && email && age && state && gender && password && city && hobbies) {
            const photo = "/public/images/"+req.file.filename;
            const hashedPassword = hashSync(password, 10);
             const insertQUery='INSERT INTO users(name,email,age,state,gender,password,city,hobbies,photo) VALUES(?,?,?,?,?,?,?,?,?)'
             db.query(insertQUery,[name,email,age,state,gender,hashedPassword,city,hobbies,photo],function(err){
             
            if(!err){
             
            res.json({
                success:true,
                message:'Inserted successfully !!'
            });
             
             }else{
             
                errorResponse(res,err,400,true);
             
            }
             
            });
            
        } else {
            // if error occurs
            const error = [];
            if (!name) {
                error.push({
                    name: {
                        "error": true,
                        "message": "Name field is required !"
                    }
                });
            }
            if (!email) {
                error.push({
                    email: {
                        "error": true,
                        "message": "Email field is required !"
                    }
                })
            }
            if (!age) {
                error.push({
                    age: {
                        "error": true,
                        "message": "Age field is required !"
                    }
                })
            }
            if (!password) {
                error.push({
                    password: {
                        "error": true,
                        "message": "Password field is required !"
                    }
                })
            }
            if (!state) {
                error.push({
                    state: {
                        "error": true,
                        "message": "State field is required !"
                    }
                })
            }
            if (!city) {
                error.push({
                    city: {
                        "error": true,
                        "message": "City field is required !"
                    }
                })
            }
            if (!gender) {
                error.push({
                    gender: {
                        "error": true,
                        "message": "Gender field is required !"
                    }
                })
            }
            if (!hobbies) {
                error.push({
                    hobbies: {
                        "error": true,
                        "message": "Hobbies field is required !"
                    }
                })
            }

            errorResponse(res, error, 400, true);
        }
    });

};


const signIn = (req, res) => {
    
    const { email, password } = req.body;
    
    console.log(email + " " + password);
    if (email && password) {
        const emailCheck = "SELECT * FROM users WHERE email = ?";

        db.query(emailCheck, [email], function (err,user) {
            if (!err && user.length > 0) {

                const hashedPassword = user[0].password;

                if (compareSync(password, hashedPassword)) {
                    const payload = {
                        email: user[0].email,
                        id:user[0].id
                    }
                    var token = jwt.sign(payload, 'This is a random string for privacy',{expiresIn:"10d"});
                    res.json({
                        success: true,
                        details: user,
                        accessToken:"Bearer "+ token
                    });
                } else {
                    
                    errorResponse(res,"Invalid username or password" ,401,true);
                }

            } else {
                errorResponse(res,err || "Invalid username or password" ,401,true);
            }
        });

    } else {
        res.json();
    }
}




const multipleSignUp = (req,res) => {
    
    
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "./files");
        }, filename: (req, file, cb) => {
            cb(null, Date.now() + file.originalname);
        },
    });


    const upload = multer({
        storage: storage,
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(csv|xlsx)$/)) {
                // upload only png and jpg format
                return cb(new Error('Please upload a csv or xlsx file.'))
            }
            cb(undefined, true)
        }
    }).single('file');
    
    upload(req, res, function (err) {

        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            errorResponse(res, err, 400, true);
            return;
        } else if (err) {
            // An unknown error occurred when uploading.
            errorResponse(res, err, 400, true);
            return;
        }

        // if everything is file then check req does have a file or not  
        if (!req.file || req.files) {
            errorResponse(res, "Photo field is required !", 400, true);
            return;
        }
        
        // if req has a file

        // uploaded file extension 
        const fileExtension = req.file.filename.split('.').pop();
        
        // uploaded file directory 
        const fileDir = "/files/" + req.file.filename;

        
        const importData = [];
        
        // if file extension is csv else for xlsx files
        if (fileExtension == "csv") {
            fs.createReadStream(appDir + "/files/" + req.file.filename)
                .pipe(csvParser({}))
                .on('data', (data) => {
                    importData.push(data);
                })
                .on('end',async () => {
                    const insertQUery = 'INSERT INTO users(name,email,city,state,password,age,hobbies,photo,gender) VALUES(?,?,?,?,?,?,?,?,?)'
                    const hashedPassword = hashSync(item.password, 10);
                    importData.map((item) => {
                        
                        db.query(insertQUery, [item.name, item.email, item.city, item.state, hashedPassword, item.age, item.hobbies, item.photo, item.gender], function (err) {
                            if (err) {
                                res.send(err);
                                return;
                            }
                        });

                    });

                   // deleting the file as its not needed 
                    fs.unlink(appDir + fileDir, function (err) {

                        // if error then return the error 
                         if (err) {
                             errorResponse(res, err, 400, true);
                             return;
                         } else {

                             // if no error, file has been deleted successfully
                             res.json({
                                 success: true,
                                 message: 'Inserted successfully !!'
                             });
                             return;

                         }
                     });

                });
        } else {

            var workbook = XLSX.readFile(appDir + fileDir);
            var sheet_name_list = workbook.SheetNames;
            const insertQUery = 'INSERT INTO users(name,email,city,state,password,age,hobbies,photo,gender) VALUES(?,?,?,?,?,?,?,?,?)'
            const data = (XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]));
            data.map((item) => {
                
                const hashedPassword = hashSync(item.password, 10);
               db.query(insertQUery, [item.name, item.email, item.city, item.state, hashedPassword, item.age, item.hobbies, item.photo, item.gender], function (err) {
                   if (err) {
                       res.send(err);
                       return;
                   }
               });

           });
            
            // deleting the file as its not needed 
             fs.unlink(appDir + fileDir, function (err) {
            if (err) {
                errorResponse(res, err, 400, true);
                return;
            } else {

                // if no error, file has been deleted successfully
                res.json({
                    success: true,
                    message: 'Inserted successfully !!'
                });
                return;

            }
        });
        }
        
       

        
        

    });
    

}


module.exports = {
    signUp,
    signIn,
    multipleSignUp
}