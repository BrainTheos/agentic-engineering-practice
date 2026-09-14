const express = require('express');
const { PORT } = require('./config');
const { requestLogger } = require('./middleware/request-logger');
const { errorHandler } = require('./middleware/error-handler');
const { systemRouter } = require('./routes/system-routes');
const { usersRouter } = require('./routes/users-routes');
const { projectsRouter } = require('./routes/projects-routes');
const { tasksRouter } = require('./routes/tasks-routes');
const { commentsRouter } = require('./routes/comments-routes');
const { taskTagsRouter } = require('./routes/task-tags-routes');
const { tagsRouter } = require('./routes/tags-routes');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/', systemRouter);
app.use('/users', usersRouter);
app.use('/projects', projectsRouter);
app.use('/tasks/:id/comments', commentsRouter);
app.use('/tasks/:id/tags', taskTagsRouter);
app.use('/tasks', tasksRouter);
app.use('/tags', tagsRouter);

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Taskr API running on port ${PORT}`);
  });
}

module.exports = app;
