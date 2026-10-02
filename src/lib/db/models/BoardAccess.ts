import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import type { BoardAccessAttributes } from "@/lib/types";

export type BoardAccessCreationAttributes = Optional<
  BoardAccessAttributes,
  "id" | "canView" | "createdAt" | "updatedAt"
>;

export class BoardAccess
  extends Model<BoardAccessAttributes, BoardAccessCreationAttributes>
  implements BoardAccessAttributes
{
  declare id: string;
  declare ownerId: string;
  declare viewerId: string;
  declare canView: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initBoardAccessModel(sequelize: Sequelize) {
  BoardAccess.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      viewerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      canView: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "board_accesses",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["ownerId", "viewerId"],
        },
        {
          fields: ["viewerId"],
        },
      ],
    }
  );
  return BoardAccess;
}
