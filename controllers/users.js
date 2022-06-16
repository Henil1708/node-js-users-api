const db = require("../config/database");
var fs = require('fs');
const {
    dirname
} = require('path');
const appDir = dirname(require.main.filename);
const { errorResponse } = require("../utils/Errors");
const { hashSync, compareSync } = require("bcrypt");
const multer = require("multer");

// storage of the photo  
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    },
});

// upload image 
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



// shows single from the jwt token using passport js
const getSingleUserDetails = (req,res) => {
    const { id} = req.params;

    const selectUserQuery = "SELECT * FROM users WHERE id=?";

    db.query(selectUserQuery, [id], function (err,user) {
        if (!err && user.length > 0) {
            res.json({
                success: true,
                details:user[0]
            });
        } else {
            errorResponse(res, err || "No data found !!", 404, true);
       }
    });


}


// shows all to authenticated user only
const getAllUsersDetails = (req,res) => {
    
    const selectUserQuery = "SELECT * FROM users";

    db.query(selectUserQuery, function (err,user) {
        if (!err && user.length > 0) {
            res.json({
                success: true,
                details:user
            });
        } else {
            errorResponse(res, err || "No data found !!", 404, true);
       }
    });


}



// update the current user that is authenticated user which we get from the passport js jwt extraction
const updateCurrentUser = (req,res) => {
    
    const id = req.user[0].id;
     upload(req, res, async function (err) {

         if (err instanceof multer.MulterError) {
             // A Multer error occurred when uploading.
             errorResponse(res, err, 400, true);
             return;
         } else if (err) {
             // An unknown error occurred when uploading.
             errorResponse(res, err, 400, true);
             return;
         }

         if (!req.file || req.files) {
             errorResponse(res, "Photo field is required !", 400, true);
             return;
         }

         // Everything went fine.
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

         if (name && email && age && state && gender && password && city && hobbies) {
             const oldFile = req.user[0].photo;
            
             
             const photo = "/public/images/" + req.file.filename;
             const hashedPassword = hashSync(password, 10);
             const updateQUery = 'UPDATE users SET name = ? ,email = ? ,age = ? ,state = ? ,gender = ? ,password = ? ,city = ? ,hobbies = ? ,photo=? WHERE id = ?'
             db.query(updateQUery, [name, email, age, state, gender, hashedPassword, city, hobbies, photo,id], function (err) {
                 if (!err) {
                     fs.unlink(appDir + oldFile, function (err) {
                         if (err) {
                             errorResponse(res, err, 400, true);
                             return;
                         } else {
                             
                             // if no error, file has been deleted successfully
                             res.json({
                                 success: true,
                                 message: 'Updated successfully !!'
                             });
                             return;
                             
                         }
                     });
                     
                    } else {
                        
                        errorResponse(res, err, 400, true);
                        return;
                    
                 }

             });

         } else {

             const error = [];
             if (!name) {
                 error.push({
                     name: {
                         "error": true,
                         "message": "Name field is required !"
                     }
                 });
             }   0+7
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




    

}   

// exporting the controllers
module.exports = {
    getSingleUserDetails,
    getAllUsersDetails,
    updateCurrentUser
}