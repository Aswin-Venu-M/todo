import { type Sequelize } from "sequelize";
import { User, initUserModel } from "./User";
import { Todo, initTodoModel } from "./Todo";
import { BoardAccess, initBoardAccessModel } from "./BoardAccess";

let initialized = false;

export function initModels(sequelize: Sequelize) {
  if (initialized) {
    return { User, Todo, BoardAccess };
  }

  // Initialize models
  initUserModel(sequelize);
  initTodoModel(sequelize);
  initBoardAccessModel(sequelize);

  // Define Associations
  // User <-> Todo
  User.hasMany(Todo, {
    foreignKey: "ownerId",
    as: "todos",
    onDelete: "CASCADE",
  });
  Todo.belongsTo(User, {
    foreignKey: "ownerId",
    as: "owner",
  });

  // User <-> BoardAccess (granted permissions where user is the owner)
  User.hasMany(BoardAccess, {
    foreignKey: "ownerId",
    as: "grantedAccesses",
    onDelete: "CASCADE",
  });
  BoardAccess.belongsTo(User, {
    foreignKey: "ownerId",
    as: "owner",
  });

  // User <-> BoardAccess (received permissions where user is the viewer)
  User.hasMany(BoardAccess, {
    foreignKey: "viewerId",
    as: "receivedAccesses",
    onDelete: "CASCADE",
  });
  BoardAccess.belongsTo(User, {
    foreignKey: "viewerId",
    as: "viewer",
  });

  initialized = true;

  return { User, Todo, BoardAccess };
}

export { User, Todo, BoardAccess };
