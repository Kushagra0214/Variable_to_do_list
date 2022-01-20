//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin_kushagra:Test123@cluster0.stw63.mongodb.net/todolistDB", {useNewUrlParser: true});

const app = express();

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your to do list."
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<--Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {

  const day = date.getDate();


  Item.find(function(err, item){
    if(err){
      console.log(err);
    }
    else{
      if(item.length===0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          } else {
            console.log("Successfully inserted");
          }
        });
        res.redirect("/");
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: item});
      }
    }
  });

});

app.post("/", function(req, res){

  const newItem = req.body.newItem;
  const listName = req.body.list;
  const item_new = new Item ({
    name: newItem
  });
  if(listName==="Today"){
    item_new.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item_new);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});

app.post("/delete", function(req,res){
  const deleteItem = req.body.checkbox;
  const listInfo = req.body.listName;
  if(listInfo==="Today"){
    Item.findByIdAndRemove(deleteItem, function(err){
      if(err){
        console.log(err);
      }
      else {
        console.log("Successfully deleted");
      }
    });
    res.redirect("/");
  } 
  else{
    List.findOneAndUpdate({name: listInfo},{$pull:{items: {_id: deleteItem}}}, function(err, foundList){
      console.log(listInfo);
      if(!err){
        res.redirect("/"+ listInfo);
      }
    });
  }
});

app.get("/:page", function(req, res){
  pageInfo = _.capitalize(req.params.page);

  List.findOne({name: pageInfo}, function(err, foundItem){
    if(!err){
      if(!foundItem){
        const list1 = new List ({
          name: pageInfo,
          items: defaultItems
        });
      
        list1.save();
        res.redirect("/"+pageInfo);
      } else {
        res.render("list", {listTitle: foundItem.name, newListItems: foundItem.items});
      }
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port== null||port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});