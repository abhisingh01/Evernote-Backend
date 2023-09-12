const express = require("express");
const Note = require("../models/Note");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchuser");

// Route 1: Fetch all notes for logged in User using get/api/notes/fetchallnotes. Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 2: create notes for logged in User using post/api/notes/addnote. Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Title must be 3 characters long").isLength({ min: 3 }),
    body("description", "Description must be 3 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // Returning bad request if there is any error
    try {
      const { title, description, tags } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tags,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 3: Update existing note for User using put/api/notes/updatenote:id. Login required
router.put('/updatenote/:id', fetchuser, async (req,res) => {
    try{
        const {title, description, tags} = req.body

        const newNote = {}
        if(title){newNote.title = title}
        if(description){newNote.description = description}
        if(tags){newNote.tags = tags}

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id)
        if(!note){return res.status(404).send("Not Found")};

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true})
        res.json(note)
    } catch (err){
        console.error(err.message)
        res.status(500).send('Internal Server Error')
    }
})

// Route 3: Delete existing note for User using delete/api/notes/deletenote:id. Login required
router.delete('/deletenote/:id', fetchuser, async (req,res) => {
    try{
        // find the not to be deleted & delete it 
        let note = await Note.findById(req.params.id)
        if(!note){
            return res.status(404).send("Not Found")
        }

        // Allow deletion only if logged in user owns the note 
        if(note.user.toString() !== req.user.id){
          console.log(note.user.toString(), req.user.id ,'check if it is equal')
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"Success":'Note has been successfully deleted'})
    }catch(err){
        console.error(err.message)
        res.status(500).send("Internal Server Error")
    }
})
module.exports = router;
