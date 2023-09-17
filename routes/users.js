var express = require('express');
var router = express.Router();
const { dbUrl } = require('../common/dbConfig')
const mongoose = require('mongoose')
const { hashPassword, hashCompare, createToken, validate } = require('../common/authenticate');
const { userModel } = require('../Schemas/userSchemas');
const { videoModel } = require('../Schemas/videoSchemas');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

// mongoose.connect(dbUrl)

mongoose.connect(dbUrl)
  .then(() => console.log('Connected!'));


/* register */
router.post('/register', async (req, res) => {
  console.log("inside")
  try {
    const user = await userModel.findOne({ email: req.body.email });
    console.log(user)
    if (!user) {
      console.log("inside")
      let hashedPassword = await hashPassword(req.body.password)
      req.body.password = hashedPassword
      let newUser = await userModel.create(req.body)
      console.log(newUser)

      res.status(200).send({
        message: 'User Created Successfully!',
        user: newUser
      });
    }
    else {
      res.status(400).send({
        message: 'User Already Exists!'
      });
    }
  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    });
  }
});

/* login */
router.post('/login', async (req, res) => {
  try {

    let user = await userModel.findOne({ email: req.body.email })
    console.log(user)
    if (user) {

      // verify the password
      if (await hashCompare(req.body.password, user.password)) {
        // create the Token
        let token = await createToken({
          name: user.name,
          email: user.email,
          id: user._id,
          role: user.role
        })
        const { password, ...others } = user._doc;
        res.status(200).send({
          message: "User Login Successfully!",
          token,
          user: others,
        })
      }
      else {
        res.status(402).send({
          message: "Invalid Credentials"
        })
      }

    }
    else {
      res.status(400).send({
        message: 'Users Does Not Exists!'
      })
    }

  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    })
  }
})

/* update */
router.put('/:id', validate, async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.params.id });
    console.log(user);
    if (user) {
      user.name = req.body.name;
      user.email = req.body.email;
      await user.save();


      const { password, ...others } = user._doc;
      res.status(200).send({
        message: 'User Updated Successfully!',
        user: others,
      });
    } else {
      res.status(400).send({
        message: 'User Does Not Exist!',
      });
    }
  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});


/* delete */
router.delete('/:id', validate, async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.id })
    if (user) {
      let user = await userModel.deleteOne({ _id: req.params.id })
      res.status(200).send({
        message: "User Deleted Successfull!",
        user
      })
    }
    else {
      res.status(400).send({
        message: 'Users Does Not Exists!'
      })
    }

  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    })
  }
})

/* help */
router.post("/help", async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.values.email });
    console.log(user);

    if (!user) {
      console.log('User not found');
      return res.status(404).send({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: user.email }, process.env.secretkey, { expiresIn: '1h' });

    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
    });

    const queryParams = new URLSearchParams();
    queryParams.set('token', token);
    const queryString = queryParams.toString();

    let details = {
      from: user.email,
      to: "greenpalace1712@gmail.com",
      subject: "Help Request",
      html: `
        <p>Hello,</p>
        <p>You have received a help request from ${req.body.values.name} (${req.body.values.email}).</p>
        <p>Message: ${req.body.values.message}</p>
        
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(details);
    console.log('Help email sent');
    res.status(200).send({ message: 'Help email sent' });
  } catch (error) {
    console.error('Error sending help email:', error);
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
});

/* feedback */
router.post("/feedback", async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.values.email });
    console.log(user);

    if (!user) {
      console.log('User not found');
      return res.status(404).send({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: user.email }, process.env.secretkey, { expiresIn: '1h' });

    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
    });

    const queryParams = new URLSearchParams();
    queryParams.set('token', token);
    const queryString = queryParams.toString();

    let details = {
      from: user.email,
      to: "greenpalace1712@gmail.com",
      subject: "Help Request",
      html: `
        <p>Hello,</p>
        <p>You have received a Feedback from ${req.body.values.name} (${req.body.values.email}).</p>
        <p>Message: ${req.body.values.message}</p>
        
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(details);
    console.log('Help email sent');
    res.status(200).send({ message: 'Help email sent' });
  } catch (error) {
    console.error('Error sending help email:', error);
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
});

/* getbyId */
router.get('/find/:id', async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.id });
    if (user) {
      console.log(user)
      res.status(200).send({
        user,
        message: 'Users Data Fetch Successfully!'
      })
    } else {
      res.status(400).send({
        message: 'No User data Found!!'
      })
    }

  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error',
      error
    })
  }

});

/* getAll */

router.get('/', async (req, res) => {
  try {
    let users = await userModel.find();
    // console.log(users);
    return res.status(200).send({
      users,
      message: 'Users Data Fetch Successfully!'
    })

  } catch (error) {
    res.status(500).send({
      message: 'Internal Server Error...'
    })
    console.log(error);
  }

});

/* Forgot */
router.post("/reset", async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.values.email })
    let url = req.headers.origin;
    console.log('URL ::::::::::::::::::::::::::::::: ',url);
    console.log(user)
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: user.email }, process.env.secretkey, { expiresIn: '1h' });

    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD

      },
    });
    const queryParams = new URLSearchParams();
    queryParams.set('token', token);
    const queryString = queryParams.toString();
    let details = {
      from: "greenpalace1712@gmail.com",
      to: user.email,
      subject: "Hello ✔",
      html: `
        <p>Hello,</p>
        <p>Please click on the following link to reset your password:</p>
      <a href="${url}/password?${queryString}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    await transporter.sendMail(details)
    res.status(200).send({ message: 'Password reset email sent' })
    console.log(details)


  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
});

/* reset password */
router.post('/password', async (req, res) => {


  try {
    const users = await userModel.findOne({ email: req.body.email });
    console.log(users)
    console.log("reset : " + req.body.password);
    const token = req.body.token;
    console.log(token)
    let hashedPassword = await hashPassword(req.body.password)
    console.log(hashedPassword);

    let decodedToken = jwt.verify(token, process.env.secretkey)

    console.log("decoded : " + decodedToken)
    const userId = decodedToken.userId;
    console.log(userId)
    const filter = { email: userId };
    const update = { password: hashedPassword };

    const doc = await userModel.findOneAndUpdate(filter, update);
    console.log("test");
    console.log(doc);


    res.status(200).send({
      message: "Password Reset successfully",
    })

  } catch (error) {
    res.status(400).send({
      message: "Some Error Occured",
    })
  }
})












module.exports = router;




