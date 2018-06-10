const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

const resolvers = {
  User: {
    todos: (parent, args, ctx, info) =>
      ctx.db.query.todoes({ where: { user: { id: parent.id } } }, info),
    pendingTodos: (parent, args, ctx, info) =>
      ctx.db.query.todoes(
        { where: { user: { id: parent.id }, done: false } },
        info
      ),
  },

  Query: {
    todos: (_, args, ctx, info) => ctx.db.query.todoes({}, info),
    users: (_, args, ctx, info) => ctx.db.query.users({}, info),
  },

  Mutation: {
    addUser: (parent, args, ctx, info) =>
      ctx.db.mutation.createUser({ data: { name: args.name } }, info),
    addTodo: (parent, args, ctx, info) =>
      ctx.db.mutation.createTodo(
        { data: { text: args.text, user: { connect: { id: args.userId } } } },
        info
      ),
    markTodoDone: (parent, args, ctx, info) =>
      ctx.db.mutation.updateTodo(
        { where: { id: args.id }, data: { done: true } },
        info
      ),
  },
}

const server = new GraphQLServer({
  typeDefs: 'schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'generated-schema.graphql',
      endpoint: process.env.PRISMA_URL,
    }),
  }),
})

server.start(options =>
  console.log(`Server running on http://localhost:${options.port}`)
)
