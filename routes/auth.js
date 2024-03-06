const router = require("express").Router();
const passport = require("passport");
const crypto = require("crypto");


router.get("/login/success", (req, res) => {
	if (req.user) {
		res.status(200).json({
			error: false,
			message: "Successfully Loged In",
			user: req.user,
		});
	} else {
		res.status(403).json({ error: true, message: "Not Authorized" });
	}
});

router.get("/login/failed", (req, res) => {
	res.status(401).json({
		error: true,
		message: "Log in failure",
	});
});

router.get("/google", passport.authenticate('google', { scope: 
	[ 'email', 'profile' ] 
}));

router.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: process.env.CLIENT_URL,
		failureRedirect: "/login/failed",
	})
);

router.get("/logout", (req, res) => {
	req.logout();
	res.redirect(process.env.CLIENT_URL);
});

module.exports = router;

// Generate the OTP_SECRET_KEY
const generateRandomKey = () => {
	return crypto.randomBytes(20).toString("hex");
  };
  
  const OTP_SECRET_KEY = generateRandomKey();
  
  


//otp
const express = require("express");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");


// Email configuration for Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let otpToken;

// Send OTP via email
const sendOtpEmail = (email, otpToken) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Login",
    html: `<p>Your OTP is: <strong>${otpToken}</strong></p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP via email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

// Route to handle sending OTP via email
router.post("/send-otp", (req, res) => {
  const { email } = req.body;

  // Dummy user lookup (replace this with a real user lookup)
  const user = users.find((u) => u.email === email);

  if (user) {
    // Generate and send OTP to the user's email
    const secret = speakeasy.generateSecret({ length: 20 });
    otpToken = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    // Store the user's OTP secret in the session or database
    req.session.otpSecret = secret.base32;
    req.session.user = user;

    // Send OTP via email
    sendOtpEmail(email, otpToken);

    res.redirect("/enter-otp");
  } else {
    res.send("User not found.");
  }
});

// OTP entry page
router.get("/enter-otp", (req, res) => {
  res.send(`
    <form action="/verify-otp" method="post">
      <label for="otp">Enter OTP:</label>
      <input type="text" id="otp" name="otp" required>
      <button type="submit">Verify OTP</button>
    </form>
  `);
});

// Route to handle OTP verification
router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  const user = req.session.user;

  if (user) {
    console.log("OTP entered:", otp);
    console.log("OTP secret:", req.session.otpSecret);

    if (otpToken === otp) {
      // OTP verification successful
      res.send(`OTP verification successful. Welcome, ${user.email}!`);
    } else {
      // OTP verification failed
      res.send("OTP verification failed. Please try again.");
    }
  } else {
    // User not found
    res.send("User not found.");
  }
});


module.exports = { OTP_SECRET_KEY, router };

