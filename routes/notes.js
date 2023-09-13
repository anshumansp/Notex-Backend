const express = require('express')
const router = express.Router();
const Notes = require('../models/Notes');
const { body, validationResult } = require("express-validator");
const authenticate = require('../middleware/checkUser');


// (Route-1) Getting all the Notes - Login Required
router.get('/getallnotes', authenticate, async (req, res) => {
    try {
        // Finding the User Notes by User Id
        const notes = await Notes.find({user: req.user.id});

        // Returning 404 and a message if No Notes are found
        if(notes.length === 0) {
          return res.status(404).json({status: "Error", message: "No Notes Found"})
        }

        // Sending all the Notes to the User
        res.status(200).json({status: "Success", message: "Fetched the Notes Successfuly", notes: notes})
    } catch (err) {
        console.log(err.message);
        res.status(500).json({status: "Error",  message: "Internal Server Error"})
    }
});



// (Route-2) Create a Note - Login Required
router.post(
  "/createnote",
  authenticate,
  [
    // Adding Validation using Express-Validator
    body("title", "Title must have atleast minimum 3 characters")
      .isLength({ min: 3 })
      .isString(),
    body(
      "description",
      "Description must have atleast minimum 5 characters"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      // Checking for validation errors and returning bad request on errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const message = errors.array()[0].msg
        return res.status(400).json({status: "Error", message: message });
      }

      // Filling up the Note Schema including the User Id
      let note = {
        user: req.user.id,
        title: req.body.title,
        description: req.body.description,
        tag: req.body.tag,
      };

      // Saving the Note and sending a response
      note = await Notes.create(note);
      res.status(200).json({
        status: "Success", 
        message: "Added the Note Successfully",
        note: note
    })
    } catch (err) {
      console.log(err.message);
      res.status(500).json({status: "Error",  message: "Internal Server Error"})
    }
  }
);



// (Route-3) Update the existing Note - Login Required
router.put('/updatenote/:id', authenticate, 
async (req, res) => {
    try {
        // Taking out the variables through Destructuring
        const {title, description, tag} = req.body;

        // Creating a newNote Object
        const newNote = {};
        if(title) {newNote.title = title}
        if(description) {newNote.description = description}
        if(tag) {newNote.tag = tag};

        // Find the note to be updated and check if it exists
        let note = await Notes.findById(req.params.id);
        if(!note) {
            return res.status(404).json({status: "Error", message: "Note not found"})
        }

        // Checking if the note belongs to user who is editing it
        if(note.user.toString() !== req.user.id) {
            return res.status(401).json({status: "Error", message: "Unauthorized Access"})
        }

        // Updating the Note to be Update with NewNote
        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});

        // Sending the response to the user
        res.status(200).json({
            status: "Success", 
            message: "Successfully Updated the Note",
            note: note
        })

    } catch (err) {
        console.log(err.message);
        res.status(500).json({status: "Error",  message: "Internal Server Error"})
    }
});



// (Route-4) Delete the existing Note - Login Required
router.delete('/deletenote/:id', authenticate, 
async (req, res) => {
    try {
        // Find the note to be deleted and check if it exists
        let note = await Notes.findById(req.params.id);
        if(!note) {
            return res.status(404).json({status: "Error", message: "Note not found"})
        }

        // Checking if the note belongs to user who is deleting it
        if(note.user.toString() !== req.user.id) {
            return res.status(401).json({status: "Error", message: "Unauthorized Access"})
        }

        // Updating the Note to be Update with NewNote
        note = await Notes.findByIdAndDelete(req.params.id);

        // Sending the response to the user
        res.status(200).json({
            status: "Success",
            message: "Successfully Deleted the Note",
        })
    } catch (err) {
        console.log(err.message);
        res.status(500).json({status: "Error",  message: "Internal Server Error"})
    }
});

module.exports = router