import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import type { UserAttributes } from "@/lib/types";

export type UserCreationAttributes = Optional<UserAttributes, "id" | "createdAt" | "updatedAt">;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Method to return safe user object without passwordHash
  toSafeJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
    };
  }
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true,
    }
  );
  return User;
}
