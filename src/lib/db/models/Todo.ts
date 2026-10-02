import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import type { TodoAttributes, TodoPriority, TodoStatus } from "@/lib/types";

export type TodoCreationAttributes = Optional<
  TodoAttributes,
  "id" | "description" | "status" | "priority" | "createdAt" | "updatedAt"
>;

export class Todo
  extends Model<TodoAttributes, TodoCreationAttributes>
  implements TodoAttributes
{
  declare id: string;
  declare title: string;
  declare description?: string | null;
  declare status: TodoStatus;
  declare priority: TodoPriority;
  declare ownerId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initTodoModel(sequelize: Sequelize) {
  Todo.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("TODO", "IN_PROGRESS", "DONE"),
        allowNull: false,
        defaultValue: "TODO",
      },
      priority: {
        type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
        allowNull: false,
        defaultValue: "MEDIUM",
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      tableName: "todos",
      timestamps: true,
      indexes: [
        {
          fields: ["ownerId"],
        },
        {
          fields: ["status"],
        },
      ],
    }
  );
  return Todo;
}
