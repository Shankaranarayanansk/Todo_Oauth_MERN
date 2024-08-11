const Todo = require("../models/Todo");

exports.createTodo = async (req, res) => {
  const { title, domain, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required." });
  }
  try {
    console.log('Creating todo for userId:', req.userId);
    const TodoModel = new Todo({ title, description, domain, userId: req.userId });
    await TodoModel.save();
    console.log('Todo created:', TodoModel);
    res.status(201).json(TodoModel);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTodos = async (req, res) => {
  try {
    console.log('Fetching todos for userId:', req.userId);
    const todos = await Todo.find({ userId: req.userId });
    console.log('Todos found:', todos);
    res.json(todos);
  } catch (err) {
    console.error('Error in getTodos:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, domain, description } = req.body;
    console.log(`Updating todo ${id} for userId:`, req.userId);
    const UpdatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { title, domain, description },
      { new: true }
    );
    if (!UpdatedTodo) {
      console.log('Todo not found for update');
      return res.status(404).json({ error: "Todo not found" });
    }
    console.log('Todo updated:', UpdatedTodo);
    res.json(UpdatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting todo ${id} for userId:`, req.userId);
    const DeletedTodo = await Todo.findOneAndDelete({ _id: id, userId: req.userId });
    if (!DeletedTodo) {
      console.log('Todo not found for deletion');
      return res.status(404).json({ error: "Todo not found" });
    }
    console.log('Todo deleted:', DeletedTodo);
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};