const express = require("express");
const todoController = require("../controllers/todoController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.post("/", isAuthenticated, todoController.createTodo);
router.get("/", isAuthenticated, todoController.getTodos);
router.put("/:id", isAuthenticated, todoController.updateTodo);
router.delete("/:id", isAuthenticated, todoController.deleteTodo);

module.exports = router;